import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Page, PageContainer } from '@/components/Layout';
import { useAuthStore } from '@/lib/store';
import { useRequireProfile } from '@/hooks/useRequireProfile';
import { fetchNotificationsForUser, getNotificationTimestamp, markNotificationAsRead, subscribeToNotifications } from '@/hooks/useNotificationsData';
import { getNotificationDisplayMessage } from '@/lib/utils/notificationMessages';
import { getBackendErrorMessage, logBackendError, toBackendErrorToastMessage, type BackendTriggerType } from '@/lib/backendErrors';
import type { Database } from '@/lib/database.types';
import { toast } from 'sonner';

type NotificationRow = Database['public']['Functions']['filter_notifications']['Returns'][number];

function resolveNotificationRoute(notification: NotificationRow): string {
    const payload = notification.payload;
    const payloadObj = payload && typeof payload === 'object' && !Array.isArray(payload)
        ? payload as Record<string, unknown>
        : null;

    const projectId = payloadObj && typeof payloadObj.project_id === 'string' ? payloadObj.project_id : null;
    if (projectId) return `/projects/${projectId}`;

    const organizationId = payloadObj && typeof payloadObj.organization_id === 'string' ? payloadObj.organization_id : null;
    if (organizationId) return '/organizations';

    if (notification.category === 'approval_needed' || notification.category === 'workflow_update') {
        return '/organizations';
    }

    return '/dashboard';
}

export default function Notifications(): JSX.Element {
    useRequireProfile();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const searchParamsKey = searchParams.toString();
    const { profile } = useAuthStore();

    const [items, setItems] = useState<NotificationRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [activeFilter, setActiveFilter] = useState<'all' | 'unread'>(() => searchParams.get('filter') === 'unread' ? 'unread' : 'all');
    const [searchQuery, setSearchQuery] = useState(() => searchParams.get('q') ?? '');

    useEffect(() => {
        const nextFilter = searchParams.get('filter') === 'unread' ? 'unread' : 'all';
        const nextQuery = searchParams.get('q') ?? '';

        setActiveFilter((prev) => (prev === nextFilter ? prev : nextFilter));
        setSearchQuery((prev) => (prev === nextQuery ? prev : nextQuery));
    }, [searchParamsKey, searchParams]);

    useEffect(() => {
        const nextParams = new URLSearchParams();
        if (activeFilter === 'unread') {
            nextParams.set('filter', 'unread');
        }

        const trimmedQuery = searchQuery.trim();
        if (trimmedQuery.length > 0) {
            nextParams.set('q', trimmedQuery);
        }

        const nextParamsKey = nextParams.toString();

        if (nextParamsKey !== searchParamsKey) {
            setSearchParams(nextParams, { replace: true });
        }
    }, [activeFilter, searchQuery, searchParamsKey, setSearchParams]);

    const loadNotifications = useCallback(async (
        activeProfileId: string,
        trigger: BackendTriggerType,
    ) => {
        setLoading(true);
        try {
            const rows = await fetchNotificationsForUser(activeProfileId, { limit: 100 });
            setItems(rows);
            setLoadError(null);
        } catch (err) {
            const context = {
                module: 'Notifications',
                operation: 'load notifications',
                trigger,
                error: err,
                ids: {
                    profileId: activeProfileId,
                },
            } as const;

            logBackendError(context);
            setLoadError(getBackendErrorMessage(err));

            if (trigger === 'user') {
                toast.error(toBackendErrorToastMessage(context));
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!profile?.id) {
            setItems([]);
            setLoadError(null);
            setLoading(false);
            return;
        }

        void loadNotifications(profile.id, 'user');
        const unsubscribe = subscribeToNotifications(profile.id, () => {
            void loadNotifications(profile.id, 'background');
        });

        return () => {
            unsubscribe();
        };
    }, [profile?.id, loadNotifications]);

    const handleOpenNotification = async (item: NotificationRow) => {
        try {
            if (!item.is_read) {
                await markNotificationAsRead(item.id);
                setItems((prev) => prev.map((p) => p.id === item.id ? { ...p, is_read: true } : p));
            }

            navigate(resolveNotificationRoute(item));
        } catch (err) {
            const context = {
                module: 'Notifications',
                operation: 'mark notification as read',
                trigger: 'user' as const,
                error: err,
                ids: {
                    notificationId: item.id,
                    profileId: profile?.id ?? null,
                },
            };
            logBackendError(context);
            toast.error(toBackendErrorToastMessage(context));
        }
    };

    const normalizedQuery = searchQuery.trim().toLowerCase();
    const filteredItems = items.filter((item) => {
        if (activeFilter === 'unread' && item.is_read) {
            return false;
        }

        if (normalizedQuery.length === 0) {
            return true;
        }

        const message = getNotificationDisplayMessage(item).toLowerCase();
        const category = item.category.toLowerCase();
        return message.includes(normalizedQuery) || category.includes(normalizedQuery);
    });

    const unreadTotal = items.reduce((count, item) => count + (item.is_read ? 0 : 1), 0);

    return (
        <Page>
            <PageContainer>
                <div className="max-w-3xl">
                    <h1 className="text-2xl font-bold text-white mb-4">Notifications</h1>

                    <div className="mb-4 flex flex-wrap gap-2">
                        <Link
                            to="/settings/notifications"
                            className="rounded border border-background-lighter bg-background px-3 py-2 text-sm text-gray-200 hover:text-white"
                        >
                            My notification settings
                        </Link>
                        <Link
                            to="/settings/organization-notifications"
                            className="rounded border border-background-lighter bg-background px-3 py-2 text-sm text-gray-200 hover:text-white"
                        >
                            Organization notification settings
                        </Link>
                    </div>

                    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="inline-flex rounded border border-background-lighter overflow-hidden">
                            <button
                                type="button"
                                className={`px-3 py-2 text-sm ${activeFilter === 'all' ? 'bg-background text-white' : 'bg-background-light text-gray-300 hover:text-white'}`}
                                onClick={() => setActiveFilter('all')}
                            >
                                All ({items.length})
                            </button>
                            <button
                                type="button"
                                className={`px-3 py-2 text-sm border-l border-background-lighter ${activeFilter === 'unread' ? 'bg-background text-white' : 'bg-background-light text-gray-300 hover:text-white'}`}
                                onClick={() => setActiveFilter('unread')}
                            >
                                Unread ({unreadTotal})
                            </button>
                        </div>

                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search notifications"
                            className="w-full sm:w-64 rounded border border-background-lighter bg-background px-3 py-2 text-sm text-white placeholder:text-gray-500"
                        />
                    </div>

                    {loading ? (
                        <p className="text-gray-400">Loading notifications…</p>
                    ) : loadError ? (
                        <div className="rounded border border-red-700 bg-red-900/20 p-4 text-red-300">
                            <p className="text-sm">Failed to load notifications: {loadError}</p>
                            {profile?.id && (
                                <button
                                    type="button"
                                    onClick={() => { void loadNotifications(profile.id, 'user'); }}
                                    className="mt-3 rounded border border-red-500/60 px-3 py-2 text-sm text-red-100 hover:bg-red-950/40"
                                >
                                    Retry
                                </button>
                            )}
                        </div>
                    ) : filteredItems.length === 0 ? (
                        <p className="text-gray-400">No notifications.</p>
                    ) : (
                        <div className="rounded border border-background-lighter overflow-hidden">
                            {filteredItems.map((item) => (
                                <button
                                    key={item.id}
                                    type="button"
                                    className={`w-full text-left px-4 py-3 border-b border-background-lighter last:border-b-0 hover:bg-background-light ${item.is_read ? 'text-gray-300' : 'text-white'}`}
                                    onClick={() => { void handleOpenNotification(item); }}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <p className="text-sm leading-5">{getNotificationDisplayMessage(item)}</p>
                                        {!item.is_read && <span className="mt-1 w-2 h-2 rounded-full bg-red-500 shrink-0" />}
                                    </div>
                                    <p className="mt-1 text-xs text-gray-400">{new Date(getNotificationTimestamp(item)).toLocaleString()}</p>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </PageContainer>
        </Page>
    );
}
