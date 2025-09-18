const { $, $$, browser } = require('@wdio/globals');

module.exports = {
  /**
   * 
   * 
   * @param {string} email
   * @param {string} password
   */
  login: async function (email, password) {
    if (!email || !password) {
      throw new Error('LoginPage.login requires email and password');
    }

    await browser.url('/login');
    const emailSelectors = [
      '#email',
      'input[type="email"]',
      'input[name="email"]',
      'input#email',
      'input[name="username"]'
    ];
    const passwordSelectors = [
      '#password',
      'input[type="password"]',
      'input[name="password"]',
      'input#pwd',
      'input[name="pass"]'
    ];
    const submitSelectors = [
      'button=Sign In', 'button=Sign in', 'button=Log in', 'button=Login',
      'button[type="submit"]', 'button[class*="login"]'
    ];

    let emailEl = null;
    for (const sel of emailSelectors) {
      const el = await $(sel);
      if (await el.isExisting()) { emailEl = el; break; }
    }
    if (!emailEl) throw new Error('LoginPage: email input not found');

    await emailEl.waitForDisplayed({ timeout: 3000 });
    await emailEl.click();
    await emailEl.clearValue().catch(() => {});
    await emailEl.setValue(String(email));

    let pwdEl = null;
    for (const sel of passwordSelectors) {
      const el = await $(sel);
      if (await el.isExisting()) { pwdEl = el; break; }
    }
    if (!pwdEl) throw new Error('LoginPage: password input not found');

    await pwdEl.waitForDisplayed({ timeout: 3000 });
    await pwdEl.click();
    await pwdEl.clearValue().catch(() => {});
    await pwdEl.setValue(String(password));

    let clicked = false;
    for (const sel of submitSelectors) {
      const btn = await $(sel);
      if (await btn.isExisting() && await btn.isClickable()) {
        await btn.click();
        clicked = true;
        break;
      }
    }

    if (!clicked) {
      try {
        await pwdEl.addValue(['Enter']);
      } catch (e) {

      }
    }


    await browser.waitUntil(async () => {
      try {
        const nav = await $('nav');
        if (!await nav.isExisting()) return false;
        const txt = await nav.getText();
        return txt && (txt.includes('Sign Out') || txt.includes('Profile') || txt.includes('Sign out'));
      } catch {
        return false;
      }
    }, { timeout: 15000, timeoutMsg: 'Login did not reach expected nav state' });
  },


  openLoginPage: async function () {
    await browser.url('/login');
    const emailInput = await $('#email');
    if (await emailInput.isExisting()) {
      await emailInput.waitForDisplayed({ timeout: 10000 });
      return;
    }

    await browser.pause(500);
  }
};
