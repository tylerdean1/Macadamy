import { toast } from 'sonner';

import { logBackendError, toBackendErrorToastMessage, type BackendTriggerType } from '@/lib/backendErrors';
import { supabase } from '@/lib/supabase';

/**
 * Fail-loud invariant boundary.
 * All frontend storage access must flow through this module.
 * Do not bypass this file.
 */

interface StorageOperationContext {
    module: string;
    operation: string;
    trigger: BackendTriggerType;
    ids?: Record<string, string | number | null | undefined>;
}

interface StorageListItem {
    name: string;
}

async function executeStorageOperation<T>(
    context: StorageOperationContext,
    operation: () => Promise<T>,
): Promise<T> {
    try {
        return await operation();
    } catch (error) {
        const errorContext = {
            ...context,
            error,
        };
        logBackendError(errorContext);
        if (context.trigger === 'user') {
            toast.error(toBackendErrorToastMessage(errorContext));
        }
        throw error;
    }
}

export async function uploadStorageFile(
    bucket: string,
    path: string,
    file: Blob,
    context: StorageOperationContext,
): Promise<string> {
    return executeStorageOperation(context, async () => {
        const { data, error } = await supabase.storage
            .from(bucket)
            .upload(path, file, { upsert: false, contentType: file.type || 'application/octet-stream' });

        if (error) {
            throw error;
        }

        return data.path;
    });
}

export function getStoragePublicUrl(
    bucket: string,
    path: string,
    context: StorageOperationContext,
): string {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    const publicUrl = data?.publicUrl;
    if (!publicUrl) {
        const error = new Error(`[Storage] Unable to resolve public URL for ${bucket}/${path}`);
        const errorContext = {
            ...context,
            error,
        };
        logBackendError(errorContext);
        if (context.trigger === 'user') {
            toast.error(toBackendErrorToastMessage(errorContext));
        }
        throw error;
    }
    return publicUrl;
}

export async function listStoragePaths(
    bucket: string,
    prefix: string,
    context: StorageOperationContext,
): Promise<string[]> {
    return executeStorageOperation(context, async () => {
        const files: string[] = [];
        const limit = 100;
        let offset = 0;

        while (true) {
            const { data, error } = await supabase.storage
                .from(bucket)
                .list(prefix, { limit, offset });

            if (error) {
                throw error;
            }

            const batch = Array.isArray(data) ? data as StorageListItem[] : [];
            files.push(...batch.map((item) => `${prefix}/${item.name}`));
            if (batch.length < limit) {
                break;
            }
            offset += limit;
        }

        return files;
    });
}

export async function removeStoragePaths(
    bucket: string,
    paths: string[],
    context: StorageOperationContext,
): Promise<void> {
    if (paths.length === 0) {
        return;
    }

    await executeStorageOperation(context, async () => {
        const { error } = await supabase.storage.from(bucket).remove(paths);
        if (error) {
            throw error;
        }
    });
}
