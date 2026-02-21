type NotificationDisplayInput = {
    message: string;
    category: string;
    payload: unknown;
};

function asObject(value: unknown): Record<string, unknown> | null {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        return null;
    }

    return value as Record<string, unknown>;
}

function asNonEmptyString(value: unknown): string | null {
    if (typeof value !== 'string') {
        return null;
    }

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
}

function roleToLabel(role: string): string {
    return role
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

function resolveDecisionWord(payloadObj: Record<string, unknown>): string | null {
    const decisionWord = asNonEmptyString(payloadObj.decision_word)?.toLowerCase();
    if (decisionWord === 'approved' || decisionWord === 'denied') {
        return decisionWord;
    }

    const status = asNonEmptyString(payloadObj.status)?.toLowerCase();
    if (status === 'accepted') return 'approved';
    if (status === 'declined') return 'denied';

    return null;
}

function resolvePositionLabel(payloadObj: Record<string, unknown>): string | null {
    const positionLabel = asNonEmptyString(payloadObj.position_label);
    if (positionLabel) return positionLabel;

    const selectedJobTitleName = asNonEmptyString(payloadObj.selected_job_title_name);
    if (selectedJobTitleName) return selectedJobTitleName;

    const requestedRole = asNonEmptyString(payloadObj.requested_role);
    if (requestedRole) return roleToLabel(requestedRole);

    return null;
}

function resolveMemberRemovedMessage(payloadObj: Record<string, unknown>): string | null {
    const organizationName = asNonEmptyString(payloadObj.organization_name);
    if (!organizationName) return null;

    const effectiveSuffix = ' Effective immediately.';
    const reason = asNonEmptyString(payloadObj.reason);
    if (reason) {
        return `You have been removed from ${organizationName}. Reason: ${reason}${effectiveSuffix}`;
    }

    return `You have been removed from ${organizationName}.${effectiveSuffix}`;
}

function resolveMemberJobTitleChangedMessage(payloadObj: Record<string, unknown>): string | null {
    const organizationName = asNonEmptyString(payloadObj.organization_name);
    if (!organizationName) return null;

    const effectiveSuffix = ' Effective immediately.';
    const positionLabel = resolvePositionLabel(payloadObj) ?? asNonEmptyString(payloadObj.selected_job_title_name);
    const reason = asNonEmptyString(payloadObj.reason);

    if (positionLabel && reason) {
        return `Your position in ${organizationName} has been changed to ${positionLabel}. Reason: ${reason}${effectiveSuffix}`;
    }

    if (positionLabel) {
        return `Your position in ${organizationName} has been changed to ${positionLabel}.${effectiveSuffix}`;
    }

    if (reason) {
        return `Your position in ${organizationName} has been changed. Reason: ${reason}${effectiveSuffix}`;
    }

    return `Your position in ${organizationName} has been changed.${effectiveSuffix}`;
}

export function getNotificationDisplayMessage(notification: NotificationDisplayInput): string {
    const payloadObj = asObject(notification.payload);
    if (!payloadObj) {
        return notification.message;
    }

    const eventName = asNonEmptyString(payloadObj.event);
    if (eventName !== 'membership_request_reviewed' && eventName !== 'member_removed' && eventName !== 'member_job_title_changed' && notification.category !== 'workflow_update') {
        return notification.message;
    }

    if (eventName === 'member_removed') {
        return resolveMemberRemovedMessage(payloadObj) ?? notification.message;
    }

    if (eventName === 'member_job_title_changed') {
        return resolveMemberJobTitleChangedMessage(payloadObj) ?? notification.message;
    }

    const organizationName = asNonEmptyString(payloadObj.organization_name);
    const decisionWord = resolveDecisionWord(payloadObj);

    if (!organizationName || !decisionWord) {
        return notification.message;
    }

    const positionLabel = resolvePositionLabel(payloadObj);
    if (positionLabel) {
        return `Your request to join ${organizationName} has been ${decisionWord} for the position of ${positionLabel}.`;
    }

    return `Your request to join ${organizationName} has been ${decisionWord}.`;
}
