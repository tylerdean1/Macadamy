import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
    getMyMemberOrganizations: vi.fn(),
    setMyPrimaryOrganization: vi.fn(),
    useAuthStore: vi.fn(),
    toastSuccess: vi.fn(),
    toastError: vi.fn(),
    setIsSwitching: vi.fn(),
    loadProfile: vi.fn(),
    setSelectedOrganizationId: vi.fn(),
    logBackendError: vi.fn(),
}));

vi.mock('react', () => ({
    useCallback: <T extends (...args: unknown[]) => unknown>(fn: T) => fn,
    useRef: <T,>(initialValue: T) => ({ current: initialValue }),
    useState: (initialValue: boolean) => [initialValue, mocks.setIsSwitching],
}));

vi.mock('@/lib/rpc.client', () => ({
    rpcClient: {
        get_my_member_organizations: mocks.getMyMemberOrganizations,
        set_my_primary_organization: mocks.setMyPrimaryOrganization,
    },
}));

vi.mock('@/lib/backendErrors', () => ({
    logBackendError: mocks.logBackendError,
    toBackendErrorToastMessage: ({ module, operation, error }: { module: string; operation: string; error: unknown }) => {
        const message = error instanceof Error ? error.message : String(error);
        return `[${module}] Failed to ${operation}: ${message}`;
    },
}));

vi.mock('@/lib/store', () => ({
    useAuthStore: mocks.useAuthStore,
}));

vi.mock('sonner', () => ({
    toast: {
        success: mocks.toastSuccess,
        error: mocks.toastError,
    },
}));

import { usePrimaryOrganizationSwitch } from './usePrimaryOrganizationSwitch';

function deferred<T>() {
    let resolve!: (value: T | PromiseLike<T>) => void;
    let reject!: (reason?: unknown) => void;
    const promise = new Promise<T>((res, rej) => {
        resolve = res;
        reject = rej;
    });
    return { promise, resolve, reject };
}

describe('usePrimaryOrganizationSwitch', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.useAuthStore.mockReturnValue({
            user: { id: 'user-1' },
            profile: { organization_id: 'org-0' },
            loadProfile: mocks.loadProfile,
            setSelectedOrganizationId: mocks.setSelectedOrganizationId,
        });
        mocks.getMyMemberOrganizations.mockResolvedValue([{ id: 'org-1', name: 'Org One', role: 'org_admin' }]);
        mocks.setMyPrimaryOrganization.mockResolvedValue(null);
        mocks.loadProfile.mockResolvedValue(undefined);
    });

    it('persists org switch and refreshes profile on success', async () => {
        const { switchPrimaryOrganization } = usePrimaryOrganizationSwitch();

        await expect(switchPrimaryOrganization('org-1')).resolves.toBeUndefined();

        expect(mocks.getMyMemberOrganizations).toHaveBeenCalled();
        expect(mocks.setMyPrimaryOrganization).toHaveBeenCalledWith({ p_organization_id: 'org-1' });
        expect(mocks.setSelectedOrganizationId).toHaveBeenCalledWith('org-1');
        expect(mocks.loadProfile).toHaveBeenCalledWith('user-1');
        expect(mocks.toastSuccess).toHaveBeenCalledWith('Primary organization updated');
        expect(mocks.toastError).not.toHaveBeenCalled();
    });

    it('blocks rapid duplicate calls while a switch is in flight', async () => {
        const pendingRpc = deferred<Array<{ id: string; name: string; role: string }>>();
        mocks.getMyMemberOrganizations.mockImplementationOnce(() => pendingRpc.promise);

        const { switchPrimaryOrganization } = usePrimaryOrganizationSwitch();

        const firstCall = switchPrimaryOrganization('org-1');
        const secondCall = switchPrimaryOrganization('org-2');

        await expect(secondCall).resolves.toBeUndefined();
        expect(mocks.getMyMemberOrganizations).toHaveBeenCalledTimes(1);

        pendingRpc.resolve([{ id: 'org-1', name: 'Org One', role: 'org_admin' }]);
        await expect(firstCall).resolves.toBeUndefined();
        expect(mocks.setMyPrimaryOrganization).toHaveBeenCalledWith({ p_organization_id: 'org-1' });
    });

    it('throws and skips update rpc when selected org is not in memberships', async () => {
        mocks.getMyMemberOrganizations.mockResolvedValue([{ id: 'org-9', name: 'Other Org', role: 'member' }]);

        const { switchPrimaryOrganization } = usePrimaryOrganizationSwitch();
        await expect(switchPrimaryOrganization('org-1')).rejects.toThrow('You are no longer a member of that organization.');

        expect(mocks.getMyMemberOrganizations).toHaveBeenCalledTimes(1);
        expect(mocks.toastError).toHaveBeenCalledTimes(1);
        expect(mocks.setSelectedOrganizationId).not.toHaveBeenCalled();
        expect(mocks.setMyPrimaryOrganization).not.toHaveBeenCalled();
    });

    it('short-circuits without RPC when selected org is already active', async () => {
        mocks.useAuthStore.mockReturnValue({
            user: { id: 'user-1' },
            profile: { organization_id: 'org-1' },
            loadProfile: mocks.loadProfile,
            setSelectedOrganizationId: mocks.setSelectedOrganizationId,
        });

        const { switchPrimaryOrganization } = usePrimaryOrganizationSwitch();
        await expect(switchPrimaryOrganization('org-1')).resolves.toBeUndefined();

        expect(mocks.getMyMemberOrganizations).not.toHaveBeenCalled();
        expect(mocks.setSelectedOrganizationId).toHaveBeenCalledWith('org-1');
        expect(mocks.loadProfile).not.toHaveBeenCalled();
    });
});
