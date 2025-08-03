import type { Database } from './database.types';

export type RpcName = keyof Database['public']['Functions'];
