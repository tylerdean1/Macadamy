// START: src/pages/StandardPages/Integrations.tsx

import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, ExternalLink, Loader2, Mail, MessageSquare, RefreshCw, ShieldAlert, Share2 } from 'lucide-react';
import { toast } from 'sonner';

import {
    getFeatureStatus,
    getMicrosoft365ConnectionStatus,
    startMicrosoft365Connection,
    type MicrosoftConnectedFeature,
    type MicrosoftConnectionSummary,
} from '@/lib/microsoft365';

type ConnectorCardProps = {
    title: string;
    description: string;
    feature: MicrosoftConnectedFeature;
    status: 'connected' | 'not_connected' | 'error';
    icon: JSX.Element;
};

function ConnectorCard({ title, description, status, icon }: ConnectorCardProps): JSX.Element {
    const isConnected = status === 'connected';
    const isError = status === 'error';

    return (
        <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-5 shadow-sm">
            <div className="flex items-start gap-4">
                <div className="rounded-xl bg-slate-800 p-3 text-primary">
                    {icon}
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                        <h3 className="text-base font-semibold text-white">{title}</h3>
                        <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                            isConnected
                                ? 'bg-emerald-500/10 text-emerald-300'
                                : isError
                                    ? 'bg-rose-500/10 text-rose-300'
                                    : 'bg-slate-700 text-slate-300'
                        }`}>
                            {isConnected ? 'Connected' : isError ? 'Error' : 'Not connected'}
                        </span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-300">{description}</p>
                </div>
            </div>
        </div>
    );
}

function formatConnectionName(connection: MicrosoftConnectionSummary): string {
    return connection.display_name ?? connection.email ?? 'Microsoft account';
}

export default function Integrations(): JSX.Element {
    const [connections, setConnections] = useState<MicrosoftConnectionSummary[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [connecting, setConnecting] = useState<boolean>(false);

    const queryMessage = useMemo(() => {
        const params = new URLSearchParams(window.location.search);
        const microsoftStatus = params.get('microsoft');
        const reason = params.get('reason');

        if (microsoftStatus === 'connected') {
            return { type: 'success' as const, message: 'Microsoft 365 connected successfully.' };
        }

        if (microsoftStatus === 'error') {
            return {
                type: 'error' as const,
                message: reason ? `Microsoft 365 connection failed: ${reason}` : 'Microsoft 365 connection failed.',
            };
        }

        return null;
    }, []);

    async function loadConnections(): Promise<void> {
        setLoading(true);
        try {
            const nextConnections = await getMicrosoft365ConnectionStatus();
            setConnections(nextConnections);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to load Microsoft 365 connection status.';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    }

    async function handleConnect(): Promise<void> {
        setConnecting(true);
        try {
            await startMicrosoft365Connection('/settings/integrations');
        } catch (error) {
            setConnecting(false);
            const message = error instanceof Error ? error.message : 'Failed to start Microsoft 365 connection.';
            toast.error(message);
        }
    }

    useEffect(() => {
        void loadConnections();
    }, []);

    useEffect(() => {
        if (!queryMessage) {
            return;
        }

        if (queryMessage.type === 'success') {
            toast.success(queryMessage.message);
        } else {
            toast.error(queryMessage.message);
        }

        window.history.replaceState({}, document.title, window.location.pathname);
    }, [queryMessage]);

    const sharePointStatus = getFeatureStatus(connections, 'sharepoint');
    const outlookStatus = getFeatureStatus(connections, 'outlook');
    const teamsStatus = getFeatureStatus(connections, 'teams');
    const primaryConnection = connections[0] ?? null;

    return (
        <main className="min-h-screen bg-slate-950 px-4 py-10 text-white sm:px-6 lg:px-8">
            <div className="mx-auto max-w-5xl">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-wide text-primary">Settings</p>
                        <h1 className="mt-2 text-3xl font-bold tracking-tight">Integrations</h1>
                        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
                            Connect Microsoft 365 so Macadamy can pull controlled project context from SharePoint,
                            Outlook, and Teams through Microsoft Graph.
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={() => void loadConnections()}
                            disabled={loading}
                            className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                            Refresh
                        </button>
                        <button
                            type="button"
                            onClick={() => void handleConnect()}
                            disabled={connecting}
                            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {connecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ExternalLink className="h-4 w-4" />}
                            Connect Microsoft 365
                        </button>
                    </div>
                </div>

                <section className="mt-8 rounded-2xl border border-white/10 bg-slate-900/70 p-5">
                    <div className="flex items-start gap-3">
                        {primaryConnection ? (
                            <CheckCircle2 className="mt-1 h-5 w-5 text-emerald-300" />
                        ) : (
                            <ShieldAlert className="mt-1 h-5 w-5 text-amber-300" />
                        )}
                        <div>
                            <h2 className="text-lg font-semibold">Microsoft 365 account</h2>
                            {loading ? (
                                <p className="mt-2 text-sm text-slate-300">Checking connection status…</p>
                            ) : primaryConnection ? (
                                <p className="mt-2 text-sm text-slate-300">
                                    Connected as <span className="font-medium text-white">{formatConnectionName(primaryConnection)}</span>
                                    {primaryConnection.email ? ` (${primaryConnection.email})` : ''}.
                                </p>
                            ) : (
                                <p className="mt-2 text-sm text-slate-300">
                                    No Microsoft 365 account is connected yet. Connect once, then Macadamy can light up the
                                    SharePoint, Outlook, and Teams modules as permissions are approved.
                                </p>
                            )}
                        </div>
                    </div>
                </section>

                <section className="mt-6 grid gap-4 md:grid-cols-3">
                    <ConnectorCard
                        title="SharePoint"
                        feature="sharepoint"
                        status={sharePointStatus}
                        icon={<Share2 className="h-5 w-5" />}
                        description="Read project sites, document libraries, folders, and files for project document control."
                    />
                    <ConnectorCard
                        title="Outlook"
                        feature="outlook"
                        status={outlookStatus}
                        icon={<Mail className="h-5 w-5" />}
                        description="Read project emails and later support controlled drafting or sending from Macadamy."
                    />
                    <ConnectorCard
                        title="Teams"
                        feature="teams"
                        status={teamsStatus}
                        icon={<MessageSquare className="h-5 w-5" />}
                        description="Read joined Teams and channels. Message-level access may require tenant admin consent."
                    />
                </section>
            </div>
        </main>
    );
}

// END: src/pages/StandardPages/Integrations.tsx
