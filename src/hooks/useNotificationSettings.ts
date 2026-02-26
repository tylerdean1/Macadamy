import { useCallback, useEffect, useMemo, useState } from 'react';
import { rpcClient } from '@/lib/rpc.client';
import { logBackendError } from '@/lib/backendErrors';
import type { NotificationCategory } from '@/lib/types';

export type NotificationEventKey =
    | 'member_added'
    | 'member_removed'
    | 'contract_completed'
    | 'bid_accepted'
    | 'new_project_created'
    | 'member_job_title_changed'
    | 'member_permission_role_changed';

const MEMBER_TITLE_BROADCAST_EVENT = 'member_job_title_changed_broadcast';

export const ORG_WIDE_EVENT_OPTIONS: Array<{ key: NotificationEventKey; label: string }> = [
    { key: 'member_added', label: 'Member added' },
    { key: 'member_removed', label: 'Member removed' },
    { key: 'contract_completed', label: 'Contract completed' },
    { key: 'bid_accepted', label: 'Bid accepted' },
    { key: 'new_project_created', label: 'New project created' },
    { key: 'member_job_title_changed', label: 'Member title changed' },
    { key: 'member_permission_role_changed', label: 'Member role changed' },
];

export const CATEGORY_OPTIONS: NotificationCategory[] = [
    'bid_received',
    'approval_needed',
    'deadline_reminder',
    'task_assigned',
    'workflow_update',
    'general',
];

export type OrgNotificationSettings = {
    enabledCategories: NotificationCategory[];
    enabledEvents: NotificationEventKey[];
    updatedAt: string | null;
};

export type UserNotificationSettings = {
    silencedCategories: NotificationCategory[];
    silencedEvents: NotificationEventKey[];
    updatedAt: string | null;
};

export const DEFAULT_ORG_SETTINGS: OrgNotificationSettings = {
    enabledCategories: ['workflow_update', 'approval_needed', 'bid_received'],
    enabledEvents: ORG_WIDE_EVENT_OPTIONS.map((item) => item.key),
    updatedAt: null,
};

export const DEFAULT_USER_SETTINGS: UserNotificationSettings = {
    silencedCategories: [],
    silencedEvents: [],
    updatedAt: null,
};

function normalizeCategoryArray(value: unknown): NotificationCategory[] {
    if (!Array.isArray(value)) return [];
    return value.filter((item): item is NotificationCategory => typeof item === 'string' && CATEGORY_OPTIONS.includes(item as NotificationCategory));
}

function normalizeEventArray(value: unknown): NotificationEventKey[] {
    if (!Array.isArray(value)) return [];
    const knownEvents = new Set(ORG_WIDE_EVENT_OPTIONS.map((item) => item.key));
    const normalized = new Set<NotificationEventKey>();

    for (const item of value) {
        if (typeof item !== 'string') {
            continue;
        }

        const normalizedEvent = item === MEMBER_TITLE_BROADCAST_EVENT
            ? 'member_job_title_changed'
            : item;

        if (knownEvents.has(normalizedEvent as NotificationEventKey)) {
            normalized.add(normalizedEvent as NotificationEventKey);
        }
    }

    return Array.from(normalized);
}

function expandOrgEnabledEvents(events: NotificationEventKey[]): string[] {
    const expanded = new Set<string>(events);
    if (expanded.has('member_job_title_changed')) {
        expanded.add(MEMBER_TITLE_BROADCAST_EVENT);
    }
    return Array.from(expanded);
}

export async function fetchOrgNotificationSettingsSnapshot(organizationId: string): Promise<OrgNotificationSettings> {
    const data = await rpcClient.get_org_notification_settings({ p_organization_id: organizationId });

    const first = Array.isArray(data) ? data[0] : data;
    const record = first && typeof first === 'object' ? first as Record<string, unknown> : {};

    return {
        enabledCategories: normalizeCategoryArray(record.enabled_categories),
        enabledEvents: normalizeEventArray(record.enabled_events),
        updatedAt: typeof record.updated_at === 'string' ? record.updated_at : null,
    };
}

export async function fetchMyNotificationSettingsSnapshot(): Promise<UserNotificationSettings> {
    const data = await rpcClient.get_my_notification_settings();

    const first = Array.isArray(data) ? data[0] : data;
    const record = first && typeof first === 'object' ? first as Record<string, unknown> : {};

    return {
        silencedCategories: normalizeCategoryArray(record.silenced_categories),
        silencedEvents: normalizeEventArray(record.silenced_events),
        updatedAt: typeof record.updated_at === 'string' ? record.updated_at : null,
    };
}

export function useOrgNotificationSettings(organizationId: string | null) {
    const [settings, setSettings] = useState<OrgNotificationSettings>(DEFAULT_ORG_SETTINGS);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async () => {
        if (!organizationId) {
            setSettings(DEFAULT_ORG_SETTINGS);
            setError(null);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const snapshot = await fetchOrgNotificationSettingsSnapshot(organizationId);
            setSettings(snapshot);
        } catch (err) {
            logBackendError({
                module: 'OrgNotificationSettings',
                operation: 'load organization notification settings',
                trigger: 'background',
                error: err,
                ids: {
                    organizationId,
                },
            });
            setError(err instanceof Error ? err.message : String(err));
        } finally {
            setLoading(false);
        }
    }, [organizationId]);

    const save = useCallback(async (next: OrgNotificationSettings) => {
        if (!organizationId) {
            throw new Error('No organization selected.');
        }

        setSaving(true);
        setError(null);

        try {
            await rpcClient.set_org_notification_settings({
                p_organization_id: organizationId,
                p_enabled_categories: next.enabledCategories,
                p_enabled_events: expandOrgEnabledEvents(next.enabledEvents),
            });

            setSettings({ ...next, updatedAt: new Date().toISOString() });
        } catch (err) {
            logBackendError({
                module: 'OrgNotificationSettings',
                operation: 'save organization notification settings',
                trigger: 'user',
                error: err,
                ids: {
                    organizationId,
                },
            });
            throw err;
        } finally {
            setSaving(false);
        }
    }, [organizationId]);

    useEffect(() => {
        void load();
    }, [load]);

    return useMemo(() => ({ settings, setSettings, loading, saving, error, reload: load, save }), [settings, loading, saving, error, load, save]);
}

export function useMyNotificationSettings() {
    const [settings, setSettings] = useState<UserNotificationSettings>(DEFAULT_USER_SETTINGS);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const snapshot = await fetchMyNotificationSettingsSnapshot();
            setSettings(snapshot);
        } catch (err) {
            logBackendError({
                module: 'MyNotificationSettings',
                operation: 'load my notification settings',
                trigger: 'background',
                error: err,
            });
            setError(err instanceof Error ? err.message : String(err));
        } finally {
            setLoading(false);
        }
    }, []);

    const save = useCallback(async (next: UserNotificationSettings) => {
        setSaving(true);
        setError(null);

        try {
            await rpcClient.set_my_notification_settings({
                p_silenced_categories: next.silencedCategories,
                p_silenced_events: next.silencedEvents,
            });

            setSettings({ ...next, updatedAt: new Date().toISOString() });
        } catch (err) {
            logBackendError({
                module: 'MyNotificationSettings',
                operation: 'save my notification settings',
                trigger: 'user',
                error: err,
            });
            throw err;
        } finally {
            setSaving(false);
        }
    }, []);

    useEffect(() => {
        void load();
    }, [load]);

    return useMemo(() => ({ settings, setSettings, loading, saving, error, reload: load, save }), [settings, loading, saving, error, load, save]);
}
