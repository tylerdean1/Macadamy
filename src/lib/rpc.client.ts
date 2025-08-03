import { supabase } from './supabase';
import type { Database } from './database.types';

/**
 * Typed RPC client generated from database functions.
 * Provides a method for each RPC function defined in Database['public']['Functions'].
 */
type Functions = Database['public']['Functions'];

export type RpcClient = {
  [K in keyof Functions]: (
    args: Functions[K]['Args']
  ) => Promise<Functions[K]['Returns']>;
} & Record<string, (args: Record<string, unknown>) => Promise<unknown>>; // legacy fallback

export const rpcClient: RpcClient = new Proxy({} as RpcClient, {
  get: (_target, prop: string) => {
    return async (args: Record<string, unknown> = {}) => {
      // @ts-expect-error dynamic RPC name provided at runtime
      const { data, error } = await supabase.rpc(prop, args);
      if (error) {
        console.error(`[rpcClient] ${prop} error:`, error);
        throw error;
      }
      return data as unknown;
    };
  }
});
