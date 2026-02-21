import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
    supabaseRpc: vi.fn(),
    useAuthStore: vi.fn(),
    toastSuccess: vi.fn(),
    toastError: vi.fn(),
    setIsSwitching: vi.fn(),
    loadProfile: vi.fn(),
    setSelectedOrganizationId: vi.fn(),
}));

vi.mock('react', () => ({
    useCallback: <T extends (...args: unknown[]) => unknown>(fn: T) => fn,
    useRef: <T,>(initialValue: T) => ({ current: initialValue }),
    useState: (initialValue: boolean) => [initialValue, mocks.setIsSwitching],
}));

vi.mock('@/lib/supabase', () => ({
    supabase: {
        rpc: mocks.supabaseRpc,
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
        mocks.supabaseRpc.mockImplementation((fn: string) => {
            if (fn === 'get_my_member_organizations') {
                return Promise.resolve({ data: [{ id: 'org-1', name: 'Org One', role: 'org_admin' }], error: null });
            }
            return Promise.resolve({ data: null, error: null });
        });
        mocks.loadProfile.mockResolvedValue(undefined);
    });

    it('persists org switch and refreshes profile on success', async () => {
        const { switchPrimaryOrganization } = usePrimaryOrganizationSwitch();

        const result = await switchPrimaryOrganization('org-1');

        expect(result).toBe(true);
        expect(mocks.supabaseRpc).toHaveBeenCalledWith('get_my_member_organizations');
        expect(mocks.supabaseRpc).toHaveBeenCalledWith('set_my_primary_organization', { p_organization_id: 'org-1' });
        expect(mocks.setSelectedOrganizationId).toHaveBeenCalledWith('org-1');
        expect(mocks.loadProfile).toHaveBeenCalledWith('user-1');
        expect(mocks.toastSuccess).toHaveBeenCalledWith('Primary organization updated');
        expect(mocks.toastError).not.toHaveBeenCalled();
    });

    it('blocks rapid duplicate calls while a switch is in flight', async () => {
        const pendingRpc = deferred<{ data: Array<{ id: string; name: string; role: string }>; error: null }>();
        mocks.supabaseRpc.mockImplementationOnce((fn: string) => {
            if (fn === 'get_my_member_organizations') {
                return pendingRpc.promise;
            }
            return Promise.resolve({ data: null, error: null });
        });

        const { switchPrimaryOrganization } = usePrimaryOrganizationSwitch();

        const firstCall = switchPrimaryOrganization('org-1');
        const secondResult = await switchPrimaryOrganization('org-2');

        expect(secondResult).toBe(false);
        expect(mocks.supabaseRpc).toHaveBeenCalledTimes(1);
        expect(mocks.supabaseRpc).toHaveBeenCalledWith('get_my_member_organizations');

        pendingRpc.resolve({ data: [{ id: 'org-1', name: 'Org One', role: 'org_admin' }], error: null });
        await expect(firstCall).resolves.toBe(true);
        expect(mocks.supabaseRpc).toHaveBeenCalledWith('set_my_primary_organization', { p_organization_id: 'org-1' });
    });

    it('returns false and skips update rpc when selected org is not in memberships', async () => {
        mocks.supabaseRpc.mockImplementation((fn: string) => {
            if (fn === 'get_my_member_organizations') {
                return Promise.resolve({ data: [{ id: 'org-9', name: 'Other Org', role: 'member' }], error: null });
            }
            return Promise.resolve({ data: null, error: null });
        });

        const { switchPrimaryOrganization } = usePrimaryOrganizationSwitch();
        const result = await switchPrimaryOrganization('org-1');

        expect(result).toBe(false);
        expect(mocks.supabaseRpc).toHaveBeenCalledTimes(1);
        expect(mocks.supabaseRpc).toHaveBeenCalledWith('get_my_member_organizations');
        expect(mocks.toastError).toHaveBeenCalledWith('You are no longer a member of that organization.');
        expect(mocks.setSelectedOrganizationId).not.toHaveBeenCalled();
    });

    it('short-circuits without RPC when selected org is already active', async () => {
        mocks.useAuthStore.mockReturnValue({
            user: { id: 'user-1' },
            profile: { organization_id: 'org-1' },
            loadProfile: mocks.loadProfile,
            setSelectedOrganizationId: mocks.setSelectedOrganizationId,
        });

        const { switchPrimaryOrganization } = usePrimaryOrganizationSwitch();
        const result = await switchPrimaryOrganization('org-1');

        expect(result).toBe(true);
        expect(mocks.supabaseRpc).not.toHaveBeenCalled();
        expect(mocks.setSelectedOrganizationId).toHaveBeenCalledWith('org-1');
        expect(mocks.loadProfile).not.toHaveBeenCalled();
    });
});
