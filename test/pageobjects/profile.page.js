// pageobjects/profile.page.js
import { $, browser, expect } from '@wdio/globals';
import Page from './page.js';

class ProfilePage extends Page {
  // Selectors
  get inputName()             { return $('//label[normalize-space()="Name"]/following-sibling::input'); }
  get inputEmail()            { return $('#email'); }
  get btnUpdate()             { return $('button=Update'); }
  get toast()                 { return $('//div[@role="alert" or contains(@class,"toast") or contains(@class,"alert")][1]'); }
  get lblCurrentPassword()    { return $('//label[normalize-space()="Current Password"]'); }
  get inputCurrentPassword()  { return $('#currentPassword'); }
  get inputNewPassword()      { return $('#password'); }
  get inputConfirmPassword()  { return $('#confirmPassword'); }

  // Utils
  n(s) { return (s || '').trim().toLowerCase(); }

  // Typing
  async clearAndType(el, text) {
  await el.waitForDisplayed({ timeout: 5000 });
  await el.click();
  await el.clearValue().catch(() => {});   
  await el.setValue(String(text));
  try { await el.addValue(['Tab']); } catch {}
}

  async clickUpdate() {
    await this.btnUpdate.scrollIntoView();
    await this.btnUpdate.waitForClickable({ timeout: 10000 });
    try {
      await this.btnUpdate.click();
    } catch {
      await browser.execute(el => el.click(), await this.btnUpdate);
    }
  }

  async waitForToastText({ timeout = 5000 } = {}) {
    try {
      await this.toast.waitForDisplayed({ timeout });
      await browser.waitUntil(
        async () => ((await this.toast.getText()).trim().length > 0),
        { timeout, interval: 200, timeoutMsg: 'Toast appeared but had no text' }
      );
      return (await this.toast.getText()).trim();
    } catch {
      return null; 
    }
  }

  async clickUpdateExpectToastText({ timeout = 10000 } = {}) {
    await this.clickUpdate();
    return await this.waitForToastText({ timeout });
  }

  async getValidationMessage(selectorOrEl) {
    return browser.execute((arg) => {
      const el = typeof arg === 'string' ? document.querySelector(arg) : arg;
      if (!el) return '';
      const invalid = el.validity && !el.validity.valid;
      return invalid ? (el.validationMessage || '') : '';
    }, selectorOrEl);
  }

  async getNativeValidationText(el) {
    const msg = await this.getValidationMessage(el);
    return (msg || '').trim();
  }

  async expectMsgIncludesOneOf(msg, substrings) {
    expect(typeof msg).toBe('string');
    const ok = substrings.some(s => msg.toLowerCase().includes(String(s).toLowerCase()));
    expect(ok).toBe(true);
  }

  // Change password helper
  async changePassword({ current, password, confirm, waitToastMs = 5000 } = {}) {
    if (typeof current === 'string') {
      await this.clearAndType(this.inputCurrentPassword, current);
    }
    if (typeof password === 'string') {
      await this.clearAndType(this.inputNewPassword, password);
    }
    if (typeof confirm === 'string') {
      await this.clearAndType(this.inputConfirmPassword, confirm);
    }
    await browser.keys('Tab');
    await this.clickUpdate();
    return await this.waitForToastText({ timeout: waitToastMs });
  }

  async expectPolicyReject({ pwd, confirm, includes }) {
  const toast = await this.changePassword({ password: pwd, confirm });

  if (toast) {
    await expect(this.n(toast)).toContain(includes || '');   // mặc định check có msg
    await expect(this.n(toast)).not.toContain('success');
    return;
  }
  const newMsg = await this.getNativeValidationText(this.inputNewPassword);
  const cfmMsg = await this.getNativeValidationText(this.inputConfirmPassword);
  const combined = [newMsg, cfmMsg].filter(Boolean).join(' | ');

  await expect(combined).not.toBe('');
  if (includes) {
    await expect(combined.toLowerCase()).toContain(includes.toLowerCase());
  }
}
  // Navigation
  async goToProfilePage() {
    await browser.url('/profile');
    await this.inputNewPassword.waitForDisplayed({ timeout: 10000 });
  }
}

export default new ProfilePage();
