export type BackendTriggerType = 'user' | 'background';

type BackendErrorIds = Record<string, string | number | null | undefined>;

export interface BackendErrorContext {
    module: string;
    operation: string;
    trigger: BackendTriggerType;
    error: unknown;
    ids?: BackendErrorIds;
}

export function getBackendErrorMessage(error: unknown): string {
    if (error instanceof Error && error.message.trim() !== '') {
        return error.message;
    }

    if (error && typeof error === 'object') {
        const maybeMessage = (error as { message?: unknown }).message;
        if (typeof maybeMessage === 'string' && maybeMessage.trim() !== '') {
            return maybeMessage;
        }
    }

    if (typeof error === 'string' && error.trim() !== '') {
        return error;
    }

    return 'Unknown backend error';
}

export function logBackendError(context: BackendErrorContext): void {
    console.error(`[${context.module}] ${context.operation} failed`, {
        error: context.error,
        trigger: context.trigger,
        ...(context.ids ?? {}),
    });
}

export function toBackendErrorToastMessage(context: Omit<BackendErrorContext, 'error'> & { error: unknown }): string {
    const message = getBackendErrorMessage(context.error);
    return `[${context.module}] Failed to ${context.operation}: ${message}`;
}
