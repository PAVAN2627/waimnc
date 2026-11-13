import { describe, it, expect } from 'vitest';
import { STRONG_PASSWORD_REGEX } from './auth.controller';

describe('Password Policy Validation', () => {
  it('accepts strong, compliant passwords', () => {
    expect(STRONG_PASSWORD_REGEX.test('WaiCouncil@2026!')).toBe(true);
    expect(STRONG_PASSWORD_REGEX.test('P@ssw0rdSecure#9')).toBe(true);
    expect(STRONG_PASSWORD_REGEX.test('MahaCivic$1234Admin')).toBe(true);
  });

  it('rejects passwords shorter than 8 characters', () => {
    expect(STRONG_PASSWORD_REGEX.test('P@ss1')).toBe(false);
  });

  it('rejects passwords without uppercase letters', () => {
    expect(STRONG_PASSWORD_REGEX.test('waicouncil@2026!')).toBe(false);
  });

  it('rejects passwords without lowercase letters', () => {
    expect(STRONG_PASSWORD_REGEX.test('WAICOUNCIL@2026!')).toBe(false);
  });

  it('rejects passwords without numbers', () => {
    expect(STRONG_PASSWORD_REGEX.test('WaiCouncil@Admin!')).toBe(false);
  });

  it('rejects passwords without special characters', () => {
    expect(STRONG_PASSWORD_REGEX.test('WaiCouncil2026Pass')).toBe(false);
  });
});
