

import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { rpcClient } from '@/lib/rpc.client';
import { useAuthStore } from '@/lib/store';
import { USER_ROLE_TYPE_OPTIONS } from '@/lib/types';
import { resolveInviteRequestErrorMessage } from '@/lib/utils/inviteErrorMessages';
import { invalidateMyOrganizationsCache } from '@/hooks/useMyOrganizations';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/pages/StandardPages/StandardPageComponents/button';

export default function OrganizationOnboarding(): JSX.Element {
    const navigate = useNavigate();
    const { profile } = useAuthStore();
    const [step, setStep] = useState(1);
    const [orgName, setOrgName] = useState('');
    const [orgDescription, setOrgDescription] = useState('');
    const [orgMission, setOrgMission] = useState('');
    const [orgHeadquarters, setOrgHeadquarters] = useState('');
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [isBusy, setIsBusy] = useState(false);
    const logoInputRef = useRef<HTMLInputElement | null>(null);

    // live search / join flow
    const [searchResults, setSearchResults] = useState<Array<{ id: string; name: string }>>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [joinModalOpen, setJoinModalOpen] = useState(false);
    const [orgToJoin, setOrgToJoin] = useState<{ id: string; name: string } | null>(null);
    const [selectedMembershipRole, setSelectedMembershipRole] = useState<string>('org_user');

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setLogoFile(file);
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => setLogoPreview(ev.target?.result as string);
            reader.readAsDataURL(file);
        } else {
            setLogoPreview(null);
        }
    };

    useEffect(() => {
        let cancelled = false;
        const q = orgName.trim();
        if (q.length < 2) {
            setSearchResults([]);
            setIsSearching(false);
            return;
        }
        setIsSearching(true);
        const t = setTimeout(() => {
            (async () => {
                try {
                    const data = await rpcClient.get_organizations_public({ p_query: q });
                    if (!cancelled) {
                        const normalized = Array.isArray(data) ? (data as { id: string; name: string }[]).map(d => ({ id: d.id, name: d.name })) : [];
                        setSearchResults(normalized);
                    }
                } catch {
                    if (!cancelled) setSearchResults([]);
                } finally {
                    if (!cancelled) setIsSearching(false);
                }
            })();
        }, 250);
        return () => { cancelled = true; clearTimeout(t); };
    }, [orgName]);

    const handleRequestMembership = async (): Promise<void> => {
        if (!orgToJoin || !profile || isBusy) return;
        setIsBusy(true);
        try {
            // create a membership *request* (server will notify org_admins)
            await rpcClient.insert_organization_invites({
                _input: {
                    organization_id: orgToJoin.id,
                    invited_profile_id: profile.id,
                    invited_by_profile_id: profile.id,
                    role: selectedMembershipRole,
                    status: 'pending'
                }
            });

            // refresh profile & UI
            await useAuthStore.getState().loadProfile(profile.id);
            toast.success('Membership request submitted — org admins were notified');
            setJoinModalOpen(false);
            setOrgToJoin(null);
            setSearchResults([]);
            setOrgName('');
        } catch (err) {
            console.error('[OrganizationOnboarding] insert_organization_invites error', err);
            toast.error(resolveInviteRequestErrorMessage(err));
        } finally {
            setIsBusy(false);
        }
    };

    const handleCreate = async () => {
        if (!orgName.trim()) {
            toast.error('Organization name is required.');
            return;
        }
        setIsBusy(true);
        try {
            // Optionally upload logo first and get URL
            let logoUrl: string | null = null;
            if (logoFile) {
                // TODO: Replace with your upload logic
                // logoUrl = await uploadLogo(logoFile);
                logoUrl = logoPreview;
            }
            await rpcClient.create_my_organization({
                p_name: orgName.trim(),
                p_description: orgDescription.trim() || undefined,
                p_mission_statement: orgMission.trim() || undefined,
                p_headquarters: orgHeadquarters.trim() || undefined,
                p_logo_url: logoUrl ?? undefined,
            });
            invalidateMyOrganizationsCache(profile?.id ?? null);
            toast.success('Organization created!');
            navigate('/dashboard');
        } catch {
            toast.error('Error creating organization');
        } finally {
            setIsBusy(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto mt-16 p-6 bg-background-light rounded shadow border border-background-lighter">
            <h1 className="text-2xl font-bold mb-6 text-white">Set up your Organization</h1>
            <div className="flex items-center mb-8 gap-2">
                {[1, 2, 3].map((s) => (
                    <div key={s} className={`h-2 w-2 rounded-full ${step === s ? 'bg-primary' : 'bg-gray-600'}`} />
                ))}
                <span className="ml-3 text-gray-400 text-sm">
                    {step === 1 && 'Basics'}
                    {step === 2 && 'Mission'}
                    {step === 3 && 'Branding'}
                </span>
            </div>
            {step === 1 && (
                <div className="space-y-4">
                    <div>
                        <label className="text-sm text-gray-300">Organization name</label>
                        <input
                            className="mt-2 w-full rounded border border-background-lighter bg-background px-3 py-2 text-sm text-white"
                            value={orgName}
                            onChange={e => setOrgName(e.target.value)}
                            placeholder="e.g. Acme Infrastructure, LLC"
                            autoFocus
                            disabled={isBusy}
                            aria-autocomplete="list"
                        />
                        {isSearching && <p className="text-xs text-gray-400 mt-2">Searching organizations…</p>}
                        {!isSearching && searchResults.length > 0 && (
                            <div className="border border-background-lighter rounded mt-2 divide-y divide-background-lighter bg-background">
                                {searchResults.map((r) => (
                                    <button
                                        key={r.id}
                                        type="button"
                                        className="w-full text-left px-3 py-2 hover:bg-background-light text-sm"
                                        onClick={() => {
                                            setOrgToJoin(r);
                                            setSelectedMembershipRole('org_user');
                                            setJoinModalOpen(true);
                                        }}
                                    >
                                        {r.name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <div>
                        <label className="text-sm text-gray-300">Description (optional)</label>
                        <textarea
                            className="mt-2 w-full rounded border border-background-lighter bg-background px-3 py-2 text-sm text-white min-h-[96px]"
                            value={orgDescription}
                            onChange={e => setOrgDescription(e.target.value)}
                            placeholder="Tell us about your organization"
                            disabled={isBusy}
                        />
                    </div>
                    <div className="flex justify-between gap-2">
                        <button
                            type="button"
                            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded"
                            onClick={() => navigate('/dashboard')}
                            disabled={isBusy}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            className="px-4 py-2 bg-primary hover:bg-primary-hover rounded disabled:opacity-50"
                            disabled={!orgName.trim() || isBusy}
                            onClick={() => setStep(2)}
                        >
                            Continue
                        </button>
                    </div>
                </div>
            )}
            {step === 2 && (
                <div className="space-y-4">
                    <div>
                        <label className="text-sm text-gray-300">Mission statement</label>
                        <textarea
                            className="mt-2 w-full rounded border border-background-lighter bg-background px-3 py-2 text-sm text-white min-h-[96px]"
                            value={orgMission}
                            onChange={e => setOrgMission(e.target.value)}
                            placeholder="Describe your mission"
                            disabled={isBusy}
                        />
                    </div>
                    <div>
                        <label className="text-sm text-gray-300">Headquarters</label>
                        <input
                            className="mt-2 w-full rounded border border-background-lighter bg-background px-3 py-2 text-sm text-white"
                            value={orgHeadquarters}
                            onChange={e => setOrgHeadquarters(e.target.value)}
                            placeholder="City, State"
                            disabled={isBusy}
                        />
                    </div>
                    <div className="flex justify-between gap-2">
                        <div className="flex gap-2">
                            <button
                                type="button"
                                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded"
                                onClick={() => navigate('/dashboard')}
                                disabled={isBusy}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded"
                                onClick={() => setStep(1)}
                                disabled={isBusy}
                            >
                                Back
                            </button>
                        </div>
                        <button
                            type="button"
                            className="px-4 py-2 bg-primary hover:bg-primary-hover rounded disabled:opacity-50"
                            onClick={() => setStep(3)}
                            disabled={isBusy}
                        >
                            Continue
                        </button>
                    </div>
                </div>
            )}
            {step === 3 && (
                <div className="space-y-4">
                    <div>
                        <label htmlFor="org-logo-upload" className="text-sm text-gray-300">Organization logo (optional)</label>
                        <input
                            id="org-logo-upload"
                            ref={logoInputRef}
                            type="file"
                            accept="image/*"
                            title="Upload organization logo"
                            aria-label="Upload organization logo"
                            className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-hover"
                            onChange={handleLogoChange}
                            disabled={isBusy}
                        />
                        {logoPreview && (
                            <div className="mt-2">
                                <img src={logoPreview} alt="Logo preview" className="h-24 w-24 object-contain rounded bg-background-lighter border border-background-lighter" />
                            </div>
                        )}
                    </div>
                    <div className="flex justify-between gap-2">
                        <div className="flex gap-2">
                            <button
                                type="button"
                                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded"
                                onClick={() => navigate('/dashboard')}
                                disabled={isBusy}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded"
                                onClick={() => setStep(2)}
                                disabled={isBusy}
                            >
                                Back
                            </button>
                        </div>
                        <button
                            type="button"
                            className="px-4 py-2 bg-primary hover:bg-primary-hover rounded disabled:opacity-50"
                            onClick={handleCreate}
                            disabled={isBusy || !orgName.trim()}
                        >
                            Create Organization
                        </button>
                    </div>
                </div>
            )}

            {/* Join existing org modal */}
            <Dialog open={joinModalOpen} onOpenChange={setJoinModalOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-white">Request membership</DialogTitle>
                        <DialogDescription className="text-sm text-gray-400">Request to join "{orgToJoin?.name ?? ''}"</DialogDescription>
                    </DialogHeader>
                    <div className="mt-4 space-y-3">
                        <label htmlFor="join-role-select" className="text-sm text-gray-300">Membership role</label>
                        <select
                            id="join-role-select"
                            title="Select membership role"
                            value={selectedMembershipRole}
                            onChange={(e) => setSelectedMembershipRole(e.target.value)}
                            disabled={isBusy}
                            className="w-full bg-background border border-background-lighter text-gray-100 px-3 py-2.5 rounded-md focus:ring-2 focus:ring-primary"
                        >
                            {USER_ROLE_TYPE_OPTIONS.filter(r => r !== 'system_admin').map((r) => (
                                <option key={r} value={r}>{r}</option>
                            ))}
                        </select>
                    </div>
                    <DialogFooter>
                        <div className="flex justify-end gap-2 mt-4">
                            <Button variant="outline" onClick={() => setJoinModalOpen(false)} disabled={isBusy}>Cancel</Button>
                            <Button onClick={async () => { await handleRequestMembership(); }} isLoading={isBusy}>Request Membership</Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
