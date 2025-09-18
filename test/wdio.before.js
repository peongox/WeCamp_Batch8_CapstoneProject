
const LoginPage = require('./pageobjects/loginprofile.page');

function getCredentials() {
  const arr = require('./data/loginTestData.json');
  const rec = Array.isArray(arr) ? arr[0] : arr;
  return { email: rec.email, password: rec.password };
}

async function fallbackDirectLogin(email, password) {
  await browser.url('/login');

  const emailSelectors = ['#email', 'input[type="email"]', 'input[name="email"]', 'input#email'];
  const passwordSelectors = ['#password', 'input[type="password"]', 'input[name="password"]', 'input#pwd'];
  const loginBtnSelectors = ['button=Sign In','button=Sign in','button=Login','button[type="submit"]'];

  let emailEl = null;
  for (const sel of emailSelectors) {
    const el = await $(sel);
    if (await el.isExisting()) { emailEl = el; break; }
  }
  if (!emailEl) throw new Error('Email input not found for fallbackDirectLogin');
  await emailEl.setValue(email);

  let pwdEl = null;
  for (const sel of passwordSelectors) {
    const el = await $(sel);
    if (await el.isExisting()) { pwdEl = el; break; }
  }
  if (!pwdEl) throw new Error('Password input not found for fallbackDirectLogin');
  await pwdEl.setValue(password);

  let clicked = false;
  for (const sel of loginBtnSelectors) {
    const b = await $(sel);
    if (await b.isExisting() && await b.isClickable()) {
      await b.click();
      clicked = true;
      break;
    }
  }
  if (!clicked) await pwdEl.addValue(['Enter']);

  await browser.waitUntil(async () => {
    try {
      const nav = await $('nav');
      if (!await nav.isExisting()) return false;
      const text = await nav.getText();
      return text && (text.includes('Sign Out') || text.includes('Profile') || text.includes('Sign out'));
    } catch {
      return false;
    }
  }, { timeout: 15000, timeoutMsg: 'Fallback login did not reach expected nav state' });
}

module.exports = async function () {
  const { email, password } = getCredentials();

  await browser.url('/login');

  try {
    if (LoginPage && typeof LoginPage.login === 'function') {
      await LoginPage.login(email, password);
    } else {
      await fallbackDirectLogin(email, password);
    }
  } catch (err) {
    // try fallback once more
    await fallbackDirectLogin(email, password);
  }

  // final check
  await browser.waitUntil(async () => {
    try {
      const navText = await $('nav').getText();
      return navText.includes('Sign Out') || navText.includes('Profile') || navText.includes('Sign out');
    } catch {
      return false;
    }
  }, { timeout: 15000, timeoutMsg: 'Login fail hook before' });

  // go to profile and ensure ready
  await browser.url('/profile');
  await $('//label[normalize-space()="Name"]/following-sibling::input').waitForDisplayed({ timeout: 10000 });
};
