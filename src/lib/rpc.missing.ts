const MISSING_RPC_NAMES = new Set<string>([
    'getEnrichedUserContracts',
    'getContractWithWkt',
    'getProfilesByContract',
    'removeProfileFromContract',
    'updateProfileContractRole',
]);

const warned = new Set<string>();

function isDevEnv(): boolean {
    return typeof import.meta !== 'undefined' && 'env' in import.meta && Boolean(import.meta.env?.DEV);
}

export function warnMissingRpc(name: string): void {
    if (!isDevEnv()) return;
    if (warned.has(name)) return;
    warned.add(name);
    if (MISSING_RPC_NAMES.has(name)) {
        console.warn(`RPC ${name} missing in DB; implement RPC or refactor UI. Returning fallback.`);
    } else {
        console.warn(`RPC ${name} is not in generated RPC_NAMES; typo/drift in code. Search/rename call site. Returning fallback.`);
    }
}

export function missingRpcFallbackFor(name: string): unknown {
    if (name.startsWith('filter_')) return [];
    if (name.startsWith('insert_')) return [];
    if (name.startsWith('update_')) return [];
    if (name.startsWith('delete_')) return [];
    return null;
}
