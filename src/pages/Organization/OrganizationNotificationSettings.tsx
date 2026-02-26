import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Page, PageContainer } from '@/components/Layout';
import { toBackendErrorToastMessage } from '@/lib/backendErrors';
import { useAuthStore } from '@/lib/store';
import { useMyOrganizations } from '@/hooks/useMyOrganizations';
import { useValidatedSelectedOrganization } from '@/hooks/useValidatedSelectedOrganization';
import {
    CATEGORY_OPTIONS,
    type OrgNotificationSettings,
    ORG_WIDE_EVENT_OPTIONS,
    useOrgNotificationSettings,
} from '@/hooks/useNotificationSettings';

const ORG_SETTINGS_UI_ROLES = new Set(['owner', 'admin']);

function formatCategoryLabel(category: string): string {
    return category.replace(/_/g, ' ');
}

export default function OrganizationNotificationSettings(): JSX.Element {
    const { profile } = useAuthStore();
    const { orgs } = useMyOrganizations(profile?.id);
    const { activeOrgIds, validatedSelectedOrganizationId } = useValidatedSelectedOrganization(orgs.map((item) => item.id));
    const activeOrganizationId = validatedSelectedOrganizationId
        ?? (profile?.organization_id && activeOrgIds.has(profile.organization_id) ? profile.organization_id : null);
    const activeOrg = activeOrganizationId ? orgs.find((item) => item.id === activeOrganizationId) ?? null : null;

    const permissionRole = (activeOrg?.permissionRole ?? '').toLowerCase();
    const canViewPage = ORG_SETTINGS_UI_ROLES.has(permissionRole);
    const settingsOrganizationId = canViewPage ? activeOrganizationId : null;

    const { settings, loading, saving, error, save } = useOrgNotificationSettings(settingsOrganizationId);
    const [draftSettings, setDraftSettings] = useState<OrgNotificationSettings>(settings);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    useEffect(() => {
        setDraftSettings(settings);
        setHasUnsavedChanges(false);
    }, [settings]);

    const enabledCategories = useMemo(() => new Set(draftSettings.enabledCategories), [draftSettings.enabledCategories]);
    const enabledEvents = useMemo(() => new Set(draftSettings.enabledEvents), [draftSettings.enabledEvents]);

    const toggleCategory = (category: (typeof CATEGORY_OPTIONS)[number]) => {
        setDraftSettings((prev) => {
            const next = new Set(prev.enabledCategories);
            if (next.has(category)) {
                next.delete(category);
            } else {
                next.add(category);
            }
            return { ...prev, enabledCategories: Array.from(next) };
        });
        setHasUnsavedChanges(true);
    };

    const toggleEvent = (eventKey: (typeof ORG_WIDE_EVENT_OPTIONS)[number]['key']) => {
        setDraftSettings((prev) => {
            const next = new Set(prev.enabledEvents);
            if (next.has(eventKey)) {
                next.delete(eventKey);
            } else {
                next.add(eventKey);
            }
            return { ...prev, enabledEvents: Array.from(next) };
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
            toast.success('Organization notification settings updated.');
        } catch (err) {
            toast.error(toBackendErrorToastMessage({
                module: 'OrganizationNotificationSettings',
                operation: 'save organization notification settings',
                trigger: 'user',
                error: err,
                ids: {
                    organizationId: settingsOrganizationId,
                },
            }));
        }
    };

    return (
        <Page>
            <PageContainer className="max-w-4xl">
                <div className="mb-4 flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-white">Organization Notification Settings</h1>
                    <Link
                        to="/notifications"
                        className="rounded border border-background-lighter bg-background px-3 py-2 text-sm text-gray-200 hover:text-white"
                    >
                        Back to notifications
                    </Link>
                </div>

                {!activeOrganizationId && (
                    <div className="rounded border border-yellow-700 bg-yellow-900/20 p-3 text-sm text-yellow-300">
                        Select an organization first to manage org-wide notification settings.
                    </div>
                )}

                {activeOrganizationId && !canViewPage && (
                    <div className="rounded border border-red-700 bg-red-900/20 p-3 text-sm text-red-300">
                        Only organization owners and admins can view this page.
                    </div>
                )}

                {activeOrganizationId && canViewPage && (
                    <>
                        {error && (
                            <div className="mb-4 rounded border border-red-700 bg-red-900/20 p-3 text-sm text-red-300">
                                {error}
                            </div>
                        )}

                        <div className="rounded border border-background-lighter bg-background-light p-4">
                            <h2 className="mb-2 text-lg font-semibold text-white">Org-wide Categories</h2>
                            <p className="mb-4 text-sm text-gray-300">Choose notification categories that may be broadcast org-wide.</p>

                            <div className="grid gap-2 sm:grid-cols-2">
                                {CATEGORY_OPTIONS.map((category) => (
                                    <button
                                        key={category}
                                        type="button"
                                        onClick={() => toggleCategory(category)}
                                        disabled={saving}
                                        className={`flex items-center justify-between rounded border px-3 py-2 text-sm transition ${enabledCategories.has(category)
                                            ? 'border-background-lighter bg-background text-gray-100'
                                            : 'border-background-lighter bg-background-light text-gray-300 hover:text-white'} disabled:cursor-not-allowed disabled:opacity-60`}
                                    >
                                        <span className="capitalize">{formatCategoryLabel(category)}</span>
                                        <span className="text-xs">{enabledCategories.has(category) ? 'Enabled' : 'Disabled'}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="mt-4 rounded border border-background-lighter bg-background-light p-4">
                            <h2 className="mb-2 text-lg font-semibold text-white">Org-wide Events</h2>
                            <p className="mb-4 text-sm text-gray-300">Fine-tune exactly which events get sent across the organization.</p>

                            <div className="grid gap-2 sm:grid-cols-2">
                                {ORG_WIDE_EVENT_OPTIONS.map((eventOption) => (
                                    <button
                                        key={eventOption.key}
                                        type="button"
                                        onClick={() => toggleEvent(eventOption.key)}
                                        disabled={saving}
                                        className={`flex items-center justify-between rounded border px-3 py-2 text-sm transition ${enabledEvents.has(eventOption.key)
                                            ? 'border-background-lighter bg-background text-gray-100'
                                            : 'border-background-lighter bg-background-light text-gray-300 hover:text-white'} disabled:cursor-not-allowed disabled:opacity-60`}
                                    >
                                        <span>{eventOption.label}</span>
                                        <span className="text-xs">{enabledEvents.has(eventOption.key) ? 'Enabled' : 'Disabled'}</span>
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
                                    {saving ? 'Saving…' : 'Save organization settings'}
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </PageContainer>
        </Page>
    );
}
