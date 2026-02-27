import { rpcClient } from '@/lib/rpc.client';
import type { Database } from '@/lib/database.types';
import { supabase } from '@/lib/supabase';
import { logBackendError } from '@/lib/backendErrors';
import {
  fetchMyNotificationSettingsSnapshot,
  fetchOrgNotificationSettingsSnapshot,
  ORG_WIDE_EVENT_OPTIONS,
  type NotificationEventKey,
} from '@/hooks/useNotificationSettings';

type NotificationRow = Database['public']['Functions']['filter_notifications']['Returns'][number];

type NotificationOrderBy = 'created_at' | 'updated_at' | 'id';

const ORDER_BY_FALLBACKS: NotificationOrderBy[] = ['created_at', 'updated_at', 'id'];
const ORG_WIDE_EVENT_SET = new Set<string>(ORG_WIDE_EVENT_OPTIONS.map((item) => item.key));
const ALWAYS_ON_INVITE_EVENTS = new Set<string>([
  'organization_email_invite',
  'organization_email_invite_response',
  'organization_email_invite_cancelled',
]);
const ACTIVE_ORG_CACHE_TTL_MS = 30_000;

const activeMembershipOrgCache = new Map<string, { orgIds: Set<string>; fetchedAt: number }>();
const deniedOrgSettingsByUser = new Map<string, Set<string>>();

const NOTIFICATIONS_TABLE = 'notifications';

function isUnknownOrderByError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const maybeError = error as { message?: string; code?: string };
  const message = (maybeError.message ?? '').toLowerCase();
  return message.includes('unknown order_by column') || maybeError.code === 'P0001';
}

function sortNotifications(rows: NotificationRow[]): NotificationRow[] {
  return [...rows].sort((left, right) => {
    if (left.is_read !== right.is_read) {
      return left.is_read ? 1 : -1;
    }

    const leftTs = new Date(getNotificationTimestamp(left)).getTime();
    const rightTs = new Date(getNotificationTimestamp(right)).getTime();
    return rightTs - leftTs;
  });
}

function asPayloadObject(notification: NotificationRow): Record<string, unknown> | null {
  const payload = notification.payload;
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return null;
  }
  return payload as Record<string, unknown>;
}

function getNotificationEvent(notification: NotificationRow): string | null {
  const payloadObj = asPayloadObject(notification);
  const eventValue = payloadObj?.event;
  return typeof eventValue === 'string' && eventValue.trim() !== '' ? eventValue : null;
}

function getNotificationOrganizationId(notification: NotificationRow): string | null {
  const payloadObj = asPayloadObject(notification);
  const organizationId = payloadObj?.organization_id;
  return typeof organizationId === 'string' && organizationId.trim() !== '' ? organizationId : null;
}

async function getActiveMembershipOrgIds(userId: string): Promise<Set<string>> {
  const cached = activeMembershipOrgCache.get(userId);
  if (cached && Date.now() - cached.fetchedAt <= ACTIVE_ORG_CACHE_TTL_MS) {
    return cached.orgIds;
  }

  const memberships = await rpcClient.get_my_member_organizations();
  const orgIds = new Set<string>(
    Array.isArray(memberships)
      ? memberships
        .map((membership) => membership?.id)
        .filter((id): id is string => typeof id === 'string' && id.trim() !== '')
      : []
  );

  activeMembershipOrgCache.set(userId, { orgIds, fetchedAt: Date.now() });
  return orgIds;
}

function isAccessDeniedError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const maybeError = error as { code?: string; message?: string | null };
  return maybeError.code === '42501'
    || (typeof maybeError.message === 'string' && maybeError.message.toLowerCase().includes('not an active member of organization'));
}

async function applyNotificationSettingsFilters(rows: NotificationRow[], userId: string): Promise<NotificationRow[]> {
  if (rows.length === 0) return rows;

  const userSnapshot = await fetchMyNotificationSettingsSnapshot();
  const activeOrgIds = await getActiveMembershipOrgIds(userId);
  const deniedOrgIds = deniedOrgSettingsByUser.get(userId) ?? new Set<string>();
  deniedOrgSettingsByUser.set(userId, deniedOrgIds);
  const silencedCategorySet = new Set(userSnapshot.silencedCategories);
  const silencedEventSet = new Set<string>(userSnapshot.silencedEvents);
  const orgSettingsCache = new Map<string, {
    enabledCategorySet: Set<NotificationRow['category']>;
    enabledEventSet: Set<string>;
  }>();

  const filtered: NotificationRow[] = [];
  for (const notification of rows) {
    const eventName = getNotificationEvent(notification);
    if (eventName && ALWAYS_ON_INVITE_EVENTS.has(eventName)) {
      filtered.push(notification);
      continue;
    }

    if (silencedCategorySet.has(notification.category)) {
      continue;
    }

    if (eventName && silencedEventSet.has(eventName)) {
      continue;
    }

    if (eventName && ORG_WIDE_EVENT_SET.has(eventName)) {
      const organizationId = getNotificationOrganizationId(notification);
      if (organizationId) {
        if (!activeOrgIds.has(organizationId)) {
          continue;
        }

        if (deniedOrgIds.has(organizationId)) {
          continue;
        }

        let orgSettings = orgSettingsCache.get(organizationId);
        if (!orgSettings) {
          try {
            const snapshot = await fetchOrgNotificationSettingsSnapshot(organizationId);
            orgSettings = {
              enabledCategorySet: new Set(snapshot.enabledCategories),
              enabledEventSet: new Set<string>(snapshot.enabledEvents),
            };
            orgSettingsCache.set(organizationId, orgSettings);
          } catch (error) {
            if (isAccessDeniedError(error)) {
              deniedOrgIds.add(organizationId);
              logBackendError({
                module: 'NotificationsData',
                operation: 'load org notification settings in filter pipeline',
                trigger: 'background',
                error,
                ids: {
                  userId,
                  organizationId,
                },
              });
              continue;
            }

            throw error;
          }
        }

        const eventKey = eventName as NotificationEventKey;
        if (!orgSettings.enabledEventSet.has(eventKey) || !orgSettings.enabledCategorySet.has(notification.category)) {
          continue;
        }
      }
    }

    filtered.push(notification);
  }

  return filtered;
}

export async function fetchNotificationsForUser(
  userId: string,
  options?: { limit?: number; unreadOnly?: boolean },
): Promise<NotificationRow[]> {
  const limit = options?.limit ?? 20;
  const unreadOnly = options?.unreadOnly ?? false;

  let lastError: unknown = null;
  for (const orderBy of ORDER_BY_FALLBACKS) {
    try {
      const rows = await rpcClient.filter_notifications({
        _filters: unreadOnly ? { user_id: userId, is_read: false } : { user_id: userId },
        _select_cols: ['*'],
        _order_by: orderBy,
        _direction: 'desc',
        _limit: limit,
      });
      if (!Array.isArray(rows)) {
        throw new Error('[NotificationsData] filter_notifications returned a non-array response.');
      }

      const sortedRows = sortNotifications(rows);
      return await applyNotificationSettingsFilters(sortedRows, userId);
    } catch (error) {
      lastError = error;
      if (!isUnknownOrderByError(error)) {
        throw error;
      }
    }
  }

  if (lastError) {
    throw lastError;
  }

  throw new Error('[NotificationsData] Unable to load notifications after order_by fallbacks.');
}

export async function markNotificationAsRead(id: string): Promise<void> {
  await rpcClient.update_notifications({ _id: id, _input: { is_read: true } });
}

export function getNotificationTimestamp(notification: NotificationRow): string {
  const asRecord = notification as unknown as Record<string, unknown>;
  const createdAt = typeof asRecord.created_at === 'string' ? asRecord.created_at : null;
  const updatedAt = typeof asRecord.updated_at === 'string' ? asRecord.updated_at : null;
  return createdAt ?? updatedAt ?? new Date().toISOString();
}

export function subscribeToNotifications(
  userId: string,
  onChanged: () => void,
  options?: { debounceMs?: number },
): () => void {
  const debounceMs = options?.debounceMs ?? 200;
  let timeoutId: number | null = null;
  let didSubscribe = false;

  const schedule = () => {
    if (timeoutId !== null) {
      window.clearTimeout(timeoutId);
    }
    timeoutId = window.setTimeout(() => {
      timeoutId = null;
      onChanged();
    }, debounceMs);
  };

  const channel = supabase
    .channel(`notifications:user:${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: NOTIFICATIONS_TABLE,
        filter: `user_id=eq.${userId}`,
      },
      schedule,
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        didSubscribe = true;
      }
    });

  return () => {
    if (timeoutId !== null) {
      window.clearTimeout(timeoutId);
      timeoutId = null;
    }
    if (didSubscribe) {
      void supabase.removeChannel(channel);
    } else {
      void channel.unsubscribe();
    }
  };
}
