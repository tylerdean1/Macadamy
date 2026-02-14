import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuthStore } from '@/lib/store';
import { rpcClient } from '@/lib/rpc.client';
import type { Database } from '@/lib/database.types';

export default function OrganizationOnboarding(): JSX.Element {
    const navigate = useNavigate();
    const { user } = useAuthStore();

    useEffect(() => {
        if (!user) navigate('/');
    }, [user, navigate]);

    const [step, setStep] = useState<number>(1);
    const [orgName, setOrgName] = useState<string>('');
    const [orgDescription, setOrgDescription] = useState<string>('');
    const [searchResults, setSearchResults] = useState<Array<Pick<Database['public']['Tables']['organizations']['Row'], 'id' | 'name'>>>([]);
    const [isBusy, setIsBusy] = useState<boolean>(false);

    const canContinue = useMemo(() => orgName.trim().length >= 2, [orgName]);

    useEffect(() => {
        let cancelled = false;
        const q = orgName.trim();
        if (q.length < 2) {
            setSearchResults([]);
            return;
        }
        const run = async (): Promise<void> => {
            try {
                const data = await rpcClient.get_organizations_public({ p_query: q });
                if (!cancelled) {
                    setSearchResults(Array.isArray(data) ? data : []);
                }
            } catch {
                if (!cancelled) setSearchResults([]);
            }
        };
        const t = setTimeout(() => { void run(); }, 250);
        return () => { cancelled = true; clearTimeout(t); };
    }, [orgName]);

    const chooseExisting = async (): Promise<void> => {
        toast.info('Joining an existing organization requires an invite.');
    };

    const createNew = async (): Promise<void> => {
        if (!user) return;
        const name = orgName.trim();
        const description = orgDescription.trim();
        if (!name) return;
        setIsBusy(true);
        try {
            const payload: Database['public']['Functions']['create_my_organization']['Args'] = {
                p_name: name,
                p_description: description,
            };

            await rpcClient.create_my_organization(payload);
            await useAuthStore.getState().loadProfile(user.id);
            toast.success('Organization created');
            navigate('/organizations');
            return;
        } catch (err) {
            console.error(err);
            toast.error('Error creating organization');
        } finally {
            setIsBusy(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto mt-16 p-6 bg-background-light rounded shadow border border-background-lighter">
            <h1 className="text-2xl font-bold mb-6 text-white">Set up your Organization</h1>

            {step === 1 && (
                <div className="space-y-4">
                    <p className="text-gray-300">Search for your organization. If you can't find it, you'll be able to create it.</p>
                    <div>
                        <label htmlFor="org-name" className="block text-sm text-gray-300 mb-2">Organization name</label>
                        <input
                            id="org-name"
                            type="text"
                            placeholder="e.g. Acme Infrastructure, LLC"
                            className="w-full bg-background border border-background-lighter text-white px-4 py-2 rounded"
                            value={orgName}
                            onChange={(e) => setOrgName(e.target.value)}
                        />
                    </div>
                    <div>
                        <label htmlFor="org-description" className="block text-sm text-gray-300 mb-2">Description (optional)</label>
                        <textarea
                            id="org-description"
                            placeholder="Tell us about your organization"
                            className="w-full bg-background border border-background-lighter text-white px-4 py-2 rounded min-h-[96px]"
                            value={orgDescription}
                            onChange={(e) => setOrgDescription(e.target.value)}
                        />
                    </div>
                    {searchResults.length > 0 && (
                        <div className="border border-background-lighter rounded divide-y divide-background-lighter">
                            {searchResults.map(r => (
                                <button
                                    key={r.id}
                                    type="button"
                                    className="w-full text-left px-3 py-2 hover:bg-background-light text-sm"
                                    onClick={() => { setOrgName(r.name); setSearchResults([]); void chooseExisting(); }}
                                >
                                    {r.name}
                                </button>
                            ))}
                        </div>
                    )}
                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            className="px-4 py-2 bg-primary hover:bg-primary-hover rounded disabled:opacity-50"
                            disabled={!canContinue || isBusy}
                            onClick={() => setStep(2)}
                        >
                            Continue
                        </button>
                    </div>
                </div>
            )}

            {step === 2 && (
                <div className="space-y-4">
                    <p className="text-gray-300">Create the organization "{orgName}"?</p>
                    <div className="flex justify-between">
                        <button
                            type="button"
                            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded"
                            onClick={() => setStep(1)}
                        >
                            Back
                        </button>
                        <button
                            type="button"
                            className="px-4 py-2 bg-primary hover:bg-primary-hover rounded disabled:opacity-50"
                            disabled={isBusy}
                            onClick={() => { void createNew(); }}
                        >
                            Create
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
