import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Page, PageContainer } from '@/components/Layout';
import { toBackendErrorToastMessage } from '@/lib/backendErrors';
import {
    CATEGORY_OPTIONS,
    type UserNotificationSettings,
    ORG_WIDE_EVENT_OPTIONS,
    useMyNotificationSettings,
} from '@/hooks/useNotificationSettings';

function formatCategoryLabel(category: string): string {
    return category.replace(/_/g, ' ');
}

export default function NotificationSettings(): JSX.Element {
    const { settings, loading, saving, error, save } = useMyNotificationSettings();
    const [draftSettings, setDraftSettings] = useState<UserNotificationSettings>(settings);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    useEffect(() => {
        setDraftSettings(settings);
        setHasUnsavedChanges(false);
    }, [settings]);

    const silencedCategories = useMemo(() => new Set(draftSettings.silencedCategories), [draftSettings.silencedCategories]);
    const silencedEvents = useMemo(() => new Set(draftSettings.silencedEvents), [draftSettings.silencedEvents]);

    const toggleCategory = (category: (typeof CATEGORY_OPTIONS)[number]) => {
        setDraftSettings((prev) => {
            const next = new Set(prev.silencedCategories);
            if (next.has(category)) {
                next.delete(category);
            } else {
                next.add(category);
            }
            return { ...prev, silencedCategories: Array.from(next) };
        });
        setHasUnsavedChanges(true);
    };

    const toggleEvent = (eventKey: (typeof ORG_WIDE_EVENT_OPTIONS)[number]['key']) => {
        setDraftSettings((prev) => {
            const next = new Set(prev.silencedEvents);
            if (next.has(eventKey)) {
                next.delete(eventKey);
            } else {
                next.add(eventKey);
            }
            return { ...prev, silencedEvents: Array.from(next) };
        });
        setHasUnsavedChanges(true);
    };

    const resetDraft = () => {
        setDraftSettings(settings);
        setHasUnsavedChanges(false);
    };

    const handleSave = async () => {
        try {
            await save(draftSettings);
            setHasUnsavedChanges(false);
            toast.success('Notification preferences updated.');
        } catch (err) {
            toast.error(toBackendErrorToastMessage({
                module: 'NotificationSettings',
                operation: 'save notification preferences',
                trigger: 'user',
                error: err,
            }));
        }
    };

    return (
        <Page>
            <PageContainer className="max-w-4xl">
                <div className="mb-4 flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-white">My Notification Settings</h1>
                    <Link
                        to="/notifications"
                        className="rounded border border-background-lighter bg-background px-3 py-2 text-sm text-gray-200 hover:text-white"
                    >
                        Back to notifications
                    </Link>
                </div>

                {error && (
                    <div className="mb-4 rounded border border-red-700 bg-red-900/20 p-3 text-sm text-red-300">
                        {error}
                    </div>
                )}

                <div className="rounded border border-background-lighter bg-background-light p-4">
                    <h2 className="mb-2 text-lg font-semibold text-white">Silence by Category</h2>
                    <p className="mb-4 text-sm text-gray-300">Select any category to mute it in your personal feed.</p>

                    <div className="grid gap-2 sm:grid-cols-2">
                        {CATEGORY_OPTIONS.map((category) => (
                            <button
                                key={category}
                                type="button"
                                onClick={() => toggleCategory(category)}
                                disabled={saving}
                                className={`flex items-center justify-between rounded border px-3 py-2 text-sm transition ${silencedCategories.has(category)
                                    ? 'border-background-lighter bg-background text-gray-100'
                                    : 'border-background-lighter bg-background-light text-gray-300 hover:text-white'} disabled:cursor-not-allowed disabled:opacity-60`}
                            >
                                <span className="capitalize">{formatCategoryLabel(category)}</span>
                                <span className="text-xs">{silencedCategories.has(category) ? 'Muted' : 'Active'}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mt-4 rounded border border-background-lighter bg-background-light p-4">
                    <h2 className="mb-2 text-lg font-semibold text-white">Silence by Event</h2>
                    <p className="mb-4 text-sm text-gray-300">Use event-level controls for finer mute preferences.</p>

                    <div className="grid gap-2 sm:grid-cols-2">
                        {ORG_WIDE_EVENT_OPTIONS.map((eventOption) => (
                            <button
                                key={eventOption.key}
                                type="button"
                                onClick={() => toggleEvent(eventOption.key)}
                                disabled={saving}
                                className={`flex items-center justify-between rounded border px-3 py-2 text-sm transition ${silencedEvents.has(eventOption.key)
                                    ? 'border-background-lighter bg-background text-gray-100'
                                    : 'border-background-lighter bg-background-light text-gray-300 hover:text-white'} disabled:cursor-not-allowed disabled:opacity-60`}
                            >
                                <span>{eventOption.label}</span>
                                <span className="text-xs">{silencedEvents.has(eventOption.key) ? 'Muted' : 'Active'}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-xs text-gray-400">
                        {hasUnsavedChanges ? 'You have unsaved changes.' : 'All changes saved.'}
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={resetDraft}
                            disabled={saving || loading || !hasUnsavedChanges}
                            className="rounded border border-background-lighter bg-background px-4 py-2 text-sm font-semibold text-gray-200 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            Reset
                        </button>
                        <button
                            type="button"
                            onClick={() => { void handleSave(); }}
                            disabled={loading || saving || !hasUnsavedChanges}
                            className="rounded bg-primary px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {saving ? 'Saving…' : 'Save preferences'}
                        </button>
                    </div>
                </div>
            </PageContainer>
        </Page>
    );
}
