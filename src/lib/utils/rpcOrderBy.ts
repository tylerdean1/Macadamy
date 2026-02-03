import { rpcClient } from '@/lib/rpc.client';

const tableOrderByCache = new Map<string, string | null>();

const defaultPreferredColumns = ['id', 'created_at', 'updated_at', 'name'];

/**
 * Resolve a stable order_by column for a table using the backend schema.
 * This avoids runtime errors when the live schema differs from local types.
 */
export async function getOrderByColumn(
    tableName: string,
    preferredColumns: string[] = defaultPreferredColumns
): Promise<string | null> {
    if (tableOrderByCache.has(tableName)) {
        return tableOrderByCache.get(tableName) ?? null;
    }

    try {
        const data = await rpcClient.fn_list_tables_and_columns();
        if (!Array.isArray(data)) {
            tableOrderByCache.set(tableName, null);
            return null;
        }

        const columns = data
            .filter((row) => row.table_name === tableName)
            .map((row) => row.column_name);

        const resolved = preferredColumns.find((col) => columns.includes(col)) ?? columns[0] ?? null;
        tableOrderByCache.set(tableName, resolved);
        return resolved;
    } catch (_error) {
        tableOrderByCache.set(tableName, null);
        return null;
    }
}

export function disableOrderByForTable(tableName: string): void {
    tableOrderByCache.set(tableName, null);
}
