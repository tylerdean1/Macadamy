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

function resolveMemberLeftOrganizationMessage(payloadObj: Record<string, unknown>): string | null {
    const organizationName = asNonEmptyString(payloadObj.organization_name);
    const memberName = asNonEmptyString(payloadObj.affected_profile_name);
    const actorName = asNonEmptyString(payloadObj.actor_name);

    if (!organizationName || !memberName) {
        return null;
    }

    if (actorName && actorName !== memberName) {
        return `${memberName} left ${organizationName}. Reported by ${actorName}.`;
    }

    return `${memberName} left ${organizationName}.`;
}

function resolveMemberJobTitleChangedBroadcastMessage(payloadObj: Record<string, unknown>): string | null {
    const memberName = asNonEmptyString(payloadObj.affected_profile_name);
    const previousTitle = asNonEmptyString(payloadObj.previous_job_title_name) ?? 'Unassigned';
    const currentTitle = asNonEmptyString(payloadObj.selected_job_title_name) ?? asNonEmptyString(payloadObj.current_job_title_name) ?? 'Unassigned';

    if (!memberName) {
        return null;
    }

    return `${memberName}'s title was just changed from ${previousTitle} to ${currentTitle}!`;
}

    function resolveMemberRoleChangedMessage(payloadObj: Record<string, unknown>): string | null {
        const organizationName = asNonEmptyString(payloadObj.organization_name);
        if (!organizationName) return null;

        const updatedRole = asNonEmptyString(payloadObj.updated_permission_role)
            ?? asNonEmptyString(payloadObj.selected_permission_role)
            ?? asNonEmptyString(payloadObj.permission_role);
        const previousRole = asNonEmptyString(payloadObj.previous_permission_role);

        const updatedRoleLabel = updatedRole ? roleToLabel(updatedRole) : null;
        const previousRoleLabel = previousRole ? roleToLabel(previousRole) : null;

        if (updatedRoleLabel && previousRoleLabel) {
            return `Your role in ${organizationName} has been changed from ${previousRoleLabel} to ${updatedRoleLabel}.`;
        }

        if (updatedRoleLabel) {
            return `Your role in ${organizationName} has been changed to ${updatedRoleLabel}.`;
        }

        return `Your role in ${organizationName} has been changed.`;
    }

export function getNotificationDisplayMessage(notification: NotificationDisplayInput): string {
    const payloadObj = asObject(notification.payload);
    if (!payloadObj) {
        return notification.message;
    }

    const eventName = asNonEmptyString(payloadObj.event);
    if (eventName !== 'membership_request_reviewed' && eventName !== 'member_removed' && eventName !== 'member_job_title_changed' && eventName !== 'member_left_organization' && eventName !== 'member_job_title_changed_broadcast' && eventName !== 'member_permission_role_changed' && notification.category !== 'workflow_update') {
        return notification.message;
    }

    if (eventName === 'member_removed') {
        return resolveMemberRemovedMessage(payloadObj) ?? notification.message;
    }

    if (eventName === 'member_job_title_changed') {
        return resolveMemberJobTitleChangedMessage(payloadObj) ?? notification.message;
    }

    if (eventName === 'member_left_organization') {
        return resolveMemberLeftOrganizationMessage(payloadObj) ?? notification.message;
    }

    if (eventName === 'member_job_title_changed_broadcast') {
        return resolveMemberJobTitleChangedBroadcastMessage(payloadObj) ?? notification.message;
    }

    if (eventName === 'member_permission_role_changed') {
        return resolveMemberRoleChangedMessage(payloadObj) ?? notification.message;
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
