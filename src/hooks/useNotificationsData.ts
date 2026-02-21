import { rpcClient } from '@/lib/rpc.client';
import type { Database } from '@/lib/database.types';
import { supabase } from '@/lib/supabase';

type NotificationRow = Database['public']['Functions']['filter_notifications']['Returns'][number];

type NotificationOrderBy = 'created_at' | 'updated_at' | 'id';

const ORDER_BY_FALLBACKS: NotificationOrderBy[] = ['created_at', 'updated_at', 'id'];

const NOTIFICATIONS_TABLE = 'notifications';

function isUnknownOrderByError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const maybeError = error as { message?: string; code?: string };
  const message = (maybeError.message ?? '').toLowerCase();
  return message.includes('unknown order_by column') || maybeError.code === 'P0001';
}

export function isGracefulEmptyNotificationsError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const maybeError = error as { message?: string; code?: string };
  const message = (maybeError.message ?? '').toLowerCase();
  return maybeError.code === '22004'
    || message.includes('query string argument of execute is null');
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
      return Array.isArray(rows) ? sortNotifications(rows) : [];
    } catch (error) {
      lastError = error;
      if (isGracefulEmptyNotificationsError(error)) {
        return [];
      }
      if (!isUnknownOrderByError(error)) {
        throw error;
      }
    }
  }

  if (lastError) throw lastError;
  return [];
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
