import { describe, expect, it } from 'vitest';
import { resolveInviteRequestErrorMessage, resolveInviteReviewErrorMessage } from './inviteErrorMessages';

describe('inviteErrorMessages', () => {
  describe('resolveInviteRequestErrorMessage', () => {
    it('maps duplicate/pending errors', () => {
      expect(resolveInviteRequestErrorMessage({ code: '23505' })).toBe('You already have a pending membership request for this organization.');
      expect(resolveInviteRequestErrorMessage({ message: 'duplicate key value violates unique constraint' })).toBe('You already have a pending membership request for this organization.');
      expect(resolveInviteRequestErrorMessage({ details: 'already pending request exists' })).toBe('You already have a pending membership request for this organization.');
    });

    it('maps already-member errors', () => {
      expect(resolveInviteRequestErrorMessage({ message: 'User is already a member' })).toBe('You are already a member of this organization.');
      expect(resolveInviteRequestErrorMessage({ details: 'membership exists for this profile' })).toBe('You are already a member of this organization.');
    });

    it('maps permission errors', () => {
      expect(resolveInviteRequestErrorMessage({ code: '42501' })).toBe('You are not allowed to request membership for this organization.');
      expect(resolveInviteRequestErrorMessage({ message: 'permission denied for function' })).toBe('You are not allowed to request membership for this organization.');
    });

    it('maps network failures', () => {
      expect(resolveInviteRequestErrorMessage({ message: 'Failed to fetch' })).toBe('Network error while submitting request. Please try again.');
      expect(resolveInviteRequestErrorMessage({ message: 'NetworkError when attempting to fetch resource.' })).toBe('Network error while submitting request. Please try again.');
      expect(resolveInviteRequestErrorMessage({ message: 'ERR_CONNECTION_RESET' })).toBe('Network error while submitting request. Please try again.');
    });

    it('returns fallback for unknown cases', () => {
      expect(resolveInviteRequestErrorMessage({ message: 'something else' })).toBe('Unable to request membership right now.');
      expect(resolveInviteRequestErrorMessage(null)).toBe('Unable to request membership right now.');
    });
  });

  describe('resolveInviteReviewErrorMessage', () => {
    it('maps already-processed errors', () => {
      expect(resolveInviteReviewErrorMessage({ message: 'already reviewed' })).toBe('This membership request was already processed.');
      expect(resolveInviteReviewErrorMessage({ details: 'status is not pending' })).toBe('This membership request was already processed.');
      expect(resolveInviteReviewErrorMessage({ message: 'invite not found' })).toBe('This membership request was already processed.');
    });

    it('maps permission errors', () => {
      expect(resolveInviteReviewErrorMessage({ code: '42501' })).toBe('You do not have permission to review this request.');
      expect(resolveInviteReviewErrorMessage({ message: 'permission denied for relation' })).toBe('You do not have permission to review this request.');
    });

    it('maps network failures', () => {
      expect(resolveInviteReviewErrorMessage({ message: 'Failed to fetch' })).toBe('Network error while updating membership request. Please try again.');
      expect(resolveInviteReviewErrorMessage({ message: 'NetworkError when attempting to fetch resource.' })).toBe('Network error while updating membership request. Please try again.');
    });

    it('returns fallback for unknown cases', () => {
      expect(resolveInviteReviewErrorMessage({ message: 'random error' })).toBe('Unable to update membership request.');
      expect(resolveInviteReviewErrorMessage(undefined)).toBe('Unable to update membership request.');
    });
  });
});
