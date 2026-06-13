import { supabase } from './supabase';
import type { Database } from './database.types';
import { RPC_NAMES, type RpcName } from './rpc.definitions';

/**
 * Fail-loud invariant boundary.
 * All frontend RPC access must flow through this module.
 * Do not bypass this file.
 */

/**
 * Live project-management RPCs that exist in Supabase but are not yet captured
 * by the generated Database['public']['Functions'] contract in this repository.
 * Keep this list small and remove entries after running the full backend typegen.
 */
export const EXTRA_RPC_NAMES = [
  'filter_project_source_documents',
  'filter_rfqs',
  'rpc_project_management_core_payload',
  'rpc_project_production_payload',
] as const;

type ExtraRpcName = typeof EXTRA_RPC_NAMES[number];
export type KnownRpcName = RpcName | ExtraRpcName;

/**
 * Typed RPC client generated from database functions.
 * Provides a method for each RPC function defined in Database['public']['Functions'].
 */
type Functions = Database['public']['Functions'];

type RpcFn<Args, Returns> = [Args] extends [never]
  ? () => Promise<Returns>
  : (args: Args) => Promise<Returns>;

export type RpcClient = {
  [K in keyof Functions]: RpcFn<Functions[K]['Args'], Functions[K]['Returns']>;
};

const rpcNameSet = new Set<string>([...RPC_NAMES, ...EXTRA_RPC_NAMES]);

function assertKnownRpcName(rpcName: string): asserts rpcName is KnownRpcName {
  if (!rpcNameSet.has(rpcName)) {
    throw new Error(`[rpcClient] Unknown RPC: ${rpcName}`);
  }
}

function getForcedRpcFailures(): Set<string> {
  if (!import.meta.env.DEV || typeof window === 'undefined') {
    return new Set<string>();
  }

  const forced = new Set<string>();
  const query = new URLSearchParams(window.location.search).get('forceFailRpc');
  const storage = window.localStorage.getItem('DEV_FORCE_FAIL_RPC');

  for (const source of [query, storage]) {
    if (!source) continue;
    source
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item.length > 0)
      .forEach((item) => forced.add(item));
  }

  return forced;
}

function shouldForceRpcFailure(rpcName: string): boolean {
  const forced = getForcedRpcFailures();
  return forced.has('*') || forced.has(rpcName);
}

type RpcArgs = Record<string, unknown> | undefined;

async function executeRpc<TReturn>(rpcName: KnownRpcName, args?: RpcArgs): Promise<TReturn> {
  if (shouldForceRpcFailure(rpcName)) {
    const forcedError = new Error(`[dev-force-fail] Forced RPC failure for ${rpcName}`);
    console.error(`[rpcClient] ${rpcName} error:`, forcedError);
    throw forcedError;
  }

  const { data, error } = args === undefined
    // @ts-expect-error dynamic RPC name provided at runtime
    ? await supabase.rpc(rpcName)
    // @ts-expect-error dynamic RPC name provided at runtime
    : await supabase.rpc(rpcName, args);
  if (error) {
    console.error(`[rpcClient] ${rpcName} error:`, error);
    throw error;
  }
  return data as TReturn;
}

export async function invokeRpc<TReturn>(
  rpcName: KnownRpcName,
  args?: Record<string, unknown>,
): Promise<TReturn> {
  return executeRpc<TReturn>(rpcName, args);
}

export const rpcClient: RpcClient = new Proxy({} as RpcClient, {
  get: (_target, prop: string) => {
    assertKnownRpcName(prop);
    return async (args?: Record<string, unknown>) => executeRpc<unknown>(prop, args);
  }
});
