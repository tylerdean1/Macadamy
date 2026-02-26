import { supabase } from './supabase';
import type { Database } from './database.types';
import { RPC_NAMES } from './rpc.definitions';

/**
 * Fail-loud invariant boundary.
 * All frontend RPC access must flow through this module.
 * Do not bypass this file.
 */

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

const rpcNameSet = new Set<string>(RPC_NAMES);

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

export const rpcClient: RpcClient = new Proxy({} as RpcClient, {
  get: (_target, prop: string) => {
    return async (args?: Record<string, unknown>) => {
      if (!rpcNameSet.has(prop)) {
        throw new Error(`[rpcClient] Unknown RPC: ${prop}`);
      }

      if (shouldForceRpcFailure(prop)) {
        const forcedError = new Error(`[dev-force-fail] Forced RPC failure for ${prop}`);
        console.error(`[rpcClient] ${prop} error:`, forcedError);
        throw forcedError;
      }

      const { data, error } = args === undefined
        // @ts-expect-error dynamic RPC name provided at runtime
        ? await supabase.rpc(prop)
        // @ts-expect-error dynamic RPC name provided at runtime
        : await supabase.rpc(prop, args);
      if (error) {
        console.error(`[rpcClient] ${prop} error:`, error);
        throw error;
      }
      return data as unknown;
    };
  }
});
