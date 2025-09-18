
import { browser, expect } from '@wdio/globals';
import ProfilePage from '../pageobjects/profile.page.js';

describe('Change Password', () => {
  beforeEach(async () => {
    await ProfilePage.goToProfilePage();
  });

  it('should succeed with valid new password and confirm password', async () => {
    await ProfilePage.clearAndType(ProfilePage.inputNewPassword, 'Newpass1@');
    await ProfilePage.clearAndType(ProfilePage.inputConfirmPassword, 'Newpass1@');
    const toast = await ProfilePage.clickUpdateExpectToastText();
    await ProfilePage.expectMsgIncludesOneOf(toast.toLowerCase(), [
      'password changed successfully',
      'password updated successfully',
      'password changed',
      'profile updated successfully'
    ]);
  });

  it('should fail when current password is incorrect', async () => {
    await expect(ProfilePage.lblCurrentPassword).toBeDisplayed();
    const toast = await ProfilePage.changePassword({
      current: 'Newpass2!',
      password: 'Newpass1@',
      confirm: 'Newpass1@'
    });
    expect((toast || '').toLowerCase().includes('success')).toBe(false);
  });

  it('should fail when new password is missing an uppercase letter', async () => {
    await ProfilePage.expectPolicyReject({ pwd: 'newpass1@', confirm: 'newpass1@', includes: 'uppercase' });
  });

  it('should fail when new password is missing a lowercase letter', async () => {
    await ProfilePage.expectPolicyReject({ pwd: 'NEWPASS1@', confirm: 'NEWPASS1@', includes: 'lower' });
  });

  it('should fail when new password is missing a digit', async () => {
    await ProfilePage.expectPolicyReject({ pwd: 'Newpass@', confirm: 'Newpass@', includes: 'digit' });
  });

  it('should fail when new password is missing a special character', async () => {
    await ProfilePage.expectPolicyReject({ pwd: 'Newpass1', confirm: 'Newpass1', includes: 'special' });
  });

  it('should fail when new password has repeating characters', async () => {
    await ProfilePage.expectPolicyReject({ pwd: 'Newpaaaass1', confirm: 'Newpaaaaass1', includes: 'repeat' });
  });

  it('should fail when using a commonly used password', async () => {
    await ProfilePage.expectPolicyReject({ pwd: 'iloveyou', confirm: 'iloveyou', includes: 'common' });
  });

  it('should fail when new password contains username or email', async () => {
    await ProfilePage.expectPolicyReject({ pwd: 'Group4@123', confirm: 'Group4@123', includes: 'name' });
  });

  it('should fail when confirm password does not match new password', async () => {
    await ProfilePage.clearAndType(ProfilePage.inputNewPassword, 'Newpass1@');
    await ProfilePage.clearAndType(ProfilePage.inputConfirmPassword, 'Newpass1');
    const toast = await ProfilePage.clickUpdateExpectToastText({ timeout: 6000 });

    if (toast) {
    const t = toast.toLowerCase();
    const looksMismatch = t.includes('do not match') || t.includes('not match') || t.includes('match');
    expect(looksMismatch).toBe(true);
  } else {
  
    const confirmEl = await ProfilePage.inputConfirmPassword;
    await browser.execute(el => el?.reportValidity?.(), confirmEl);
    const msg = await ProfilePage.getNativeValidationText(confirmEl);
    expect((msg || '').toLowerCase()).toContain('match');
  }});

  it('should fail when reusing the current password', async () => {
    await ProfilePage.expectPolicyReject({ pwd: 'Newpass1!', confirm: 'Newpass1!', includes: 'same' });
  });
});
