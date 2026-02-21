import { describe, expect, it } from 'vitest';
import { PROFILE_ERROR_MESSAGES } from './profileErrorMessages';

describe('profileErrorMessages', () => {
    it('exposes stable shared toast messages for profile flows', () => {
        expect(PROFILE_ERROR_MESSAGES.LOAD_OPTIONS).toBe('Unable to load profile options. Please refresh.');
        expect(PROFILE_ERROR_MESSAGES.ENTER_JOB_TITLE).toBe('Please enter a job title');
        expect(PROFILE_ERROR_MESSAGES.ADD_JOB_TITLE).toBe('Unable to add job title');
        expect(PROFILE_ERROR_MESSAGES.ENTER_FULL_NAME).toBe('Please enter your full name');
        expect(PROFILE_ERROR_MESSAGES.NETWORK_RETRY).toBe('Network error, try again in a minute.');
    });
});
