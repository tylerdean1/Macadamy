import { describe, expect, it } from 'vitest';
import { getNotificationDisplayMessage } from './notificationMessages';

describe('notificationMessages', () => {
    it('formats membership review notifications using org, decision, and position', () => {
        const message = getNotificationDisplayMessage({
            message: 'fallback',
            category: 'workflow_update',
            payload: {
                event: 'membership_request_reviewed',
                organization_name: 'Acme Builders',
                decision_word: 'approved',
                position_label: 'Project Manager',
            },
        });

        expect(message).toBe('Your request to join Acme Builders has been approved for the position of Project Manager.');
    });

    it('derives decision/position from status and requested role when needed', () => {
        const message = getNotificationDisplayMessage({
            message: 'fallback',
            category: 'workflow_update',
            payload: {
                event: 'membership_request_reviewed',
                organization_name: 'Northwind',
                status: 'declined',
                requested_role: 'org_user',
            },
        });

        expect(message).toBe('Your request to join Northwind has been denied for the position of Org User.');
    });

    it('returns original message when payload does not contain expected review metadata', () => {
        const message = getNotificationDisplayMessage({
            message: 'Original message',
            category: 'general',
            payload: { project_id: 'abc' },
        });

        expect(message).toBe('Original message');
    });

    it('formats member removal notifications with reason', () => {
        const message = getNotificationDisplayMessage({
            message: 'fallback',
            category: 'workflow_update',
            payload: {
                event: 'member_removed',
                organization_name: 'Acme Builders',
                reason: 'Repeated policy violations',
            },
        });

        expect(message).toBe('You have been removed from Acme Builders. Reason: Repeated policy violations Effective immediately.');
    });

    it('formats member title-change notifications with selected title and reason', () => {
        const message = getNotificationDisplayMessage({
            message: 'fallback',
            category: 'workflow_update',
            payload: {
                event: 'member_job_title_changed',
                organization_name: 'Northwind',
                selected_job_title_name: 'Estimator',
                reason: 'Role restructuring',
            },
        });

        expect(message).toBe('Your position in Northwind has been changed to Estimator. Reason: Role restructuring Effective immediately.');
    });

    it('formats member-left notifications for org admins', () => {
        const message = getNotificationDisplayMessage({
            message: 'fallback',
            category: 'workflow_update',
            payload: {
                event: 'member_left_organization',
                organization_name: 'Acme Builders',
                affected_profile_name: 'Tyler Jones',
                actor_name: 'Tyler Jones',
            },
        });

        expect(message).toBe('Tyler Jones left Acme Builders.');
    });

    it('formats member-left notifications with distinct actor context when present', () => {
        const message = getNotificationDisplayMessage({
            message: 'fallback',
            category: 'workflow_update',
            payload: {
                event: 'member_left_organization',
                organization_name: 'Acme Builders',
                affected_profile_name: 'Tyler Jones',
                actor_name: 'System Bot',
            },
        });

        expect(message).toBe('Tyler Jones left Acme Builders. Reported by System Bot.');
    });

    it('formats member-rejoined notifications for org members', () => {
        const message = getNotificationDisplayMessage({
            message: 'fallback',
            category: 'workflow_update',
            payload: {
                event: 'member_rejoined_organization',
                organization_name: 'Acme Builders',
                affected_profile_name: 'Tyler Jones',
                actor_name: 'Tyler Jones',
            },
        });

        expect(message).toBe('Tyler Jones rejoined Acme Builders.');
    });

    it('formats member-rejoined notifications with distinct actor context when present', () => {
        const message = getNotificationDisplayMessage({
            message: 'fallback',
            category: 'workflow_update',
            payload: {
                event: 'member_rejoined_organization',
                organization_name: 'Acme Builders',
                affected_profile_name: 'Tyler Jones',
                actor_name: 'Org Admin',
            },
        });

        expect(message).toBe('Tyler Jones rejoined Acme Builders. Processed by Org Admin.');
    });

    it('formats org-wide member title change broadcast with previous and current title', () => {
        const message = getNotificationDisplayMessage({
            message: 'fallback',
            category: 'workflow_update',
            payload: {
                event: 'member_job_title_changed_broadcast',
                affected_profile_name: 'Tyler Jones',
                previous_job_title_name: 'Estimator',
                selected_job_title_name: 'Project Manager',
            },
        });

        expect(message).toBe("Tyler Jones's title was just changed from Estimator to Project Manager!");
    });

    it('formats member permission role change notifications with previous and current role', () => {
        const message = getNotificationDisplayMessage({
            message: 'fallback',
            category: 'workflow_update',
            payload: {
                event: 'member_permission_role_changed',
                organization_name: 'Northwind',
                previous_permission_role: 'worker',
                updated_permission_role: 'hr',
            },
        });

        expect(message).toBe('Your role in Northwind has been changed from Worker to Hr.');
    });
});
