import { supabase } from './supabase';
import type { Database } from './database.types';
import { RPC_NAMES } from './rpc.definitions';
import { missingRpcFallbackFor, warnMissingRpc } from './rpc.missing';

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
} & Record<string, (args?: Record<string, unknown>) => Promise<unknown>>; // legacy fallback

const rpcNameSet = new Set<string>(RPC_NAMES);

export const rpcClient: RpcClient = new Proxy({} as RpcClient, {
  get: (_target, prop: string) => {
    return async (args?: Record<string, unknown>) => {
      if (!rpcNameSet.has(prop)) {
        warnMissingRpc(prop);
        return missingRpcFallbackFor(prop) as unknown;
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
