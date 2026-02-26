type MaybeRpcError = {
  code?: string;
  message?: string;
  details?: string;
} | null;

function getErrorParts(error: unknown): { code: string; combined: string } {
  const maybeError = error as MaybeRpcError;
  const code = maybeError?.code ?? '';
  const message = (maybeError?.message ?? '').toLowerCase();
  const details = (maybeError?.details ?? '').toLowerCase();
  return { code, combined: `${message} ${details}` };
}

function isNetworkFailure(combined: string): boolean {
  return combined.includes('failed to fetch')
    || combined.includes('networkerror')
    || combined.includes('err_connection');
}

export function resolveOrgMemberActionErrorMessage(error: unknown, fallbackMessage: string): string {
  const maybeError = error as MaybeRpcError;
  const code = maybeError?.code ?? '';
  const message = (maybeError?.message ?? '').trim();
  const details = (maybeError?.details ?? '').trim();

  if (isNetworkFailure(`${message.toLowerCase()} ${details.toLowerCase()}`)) {
    return 'Network error. Please try again.';
  }

  if (code === '42501') {
    return 'Access denied for this action.';
  }

  if (message.length > 0) {
    return message;
  }

  if (details.length > 0) {
    return details;
  }

  return fallbackMessage;
}

export function resolveInviteRequestErrorMessage(error: unknown): string {
  const { code, combined } = getErrorParts(error);

  if (code === '23505' || combined.includes('duplicate') || combined.includes('already pending')) {
    return 'You already have a pending membership request for this organization.';
  }

  if (combined.includes('already a member') || combined.includes('membership exists')) {
    return 'You are already a member of this organization.';
  }

  if (code === '42501' || combined.includes('permission denied') || combined.includes('not authorized')) {
    return 'You are not allowed to request membership for this organization.';
  }

  if (isNetworkFailure(combined)) {
    return 'Network error while submitting request. Please try again.';
  }

  return 'Unable to request membership right now.';
}

export function resolveInviteReviewErrorMessage(error: unknown): string {
  const { code, combined } = getErrorParts(error);

  if (combined.includes('already reviewed') || combined.includes('status is not pending') || combined.includes('not found')) {
    return 'This membership request was already processed.';
  }

  if (code === '42501' || combined.includes('permission denied') || combined.includes('not authorized')) {
    return 'You do not have permission to review this request.';
  }

  if (isNetworkFailure(combined)) {
    return 'Network error while updating membership request. Please try again.';
  }

  return 'Unable to update membership request.';
}