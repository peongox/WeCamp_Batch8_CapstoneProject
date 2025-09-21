
import { $, browser, expect } from '@wdio/globals';
import ProfilePage from '../pageobjects/profile.page.js';
import RegisterPage from '../pageobjects/register.page.js'
import loginTestData from '../data/loginTestData.json';
import LoginPage from '../pageobjects/login.page.js';
import navComp from '../pageobjects/components/nav.comp.js';
import axios from 'axios'

describe('Change Password', () => {
  let userId = ''
  before(async function () {
      await browser.url('http://localhost:3000/register?redirect=/')
      browser.setupInterceptor()
      await RegisterPage.register(Date.now(),`${Date.now()}@mail.com`,'Valid@2102','Valid@2102')
      await browser.pause(3000)

      browser.expectRequest('POST', '/api/users', 201)
      let createUserReq = await browser.getRequest(0)
      userId = createUserReq.response.body._id

      await expect(browser).toHaveUrl('http://localhost:3000/')
      await ProfilePage.goToProfilePage();
  })
  
  beforeEach(async () => {
    await ProfilePage.goToProfilePage();
  });

  it('Should succeed with valid new password and confirm password', async () => {
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

  it('Should fail when current password is incorrect', async () => {
    console.log('look here', await browser.getUrl())
    await expect(ProfilePage.lblCurrentPassword).toBeDisplayed();
    const toast = await ProfilePage.changePassword({
      current: 'Newpass2!',
      password: 'Newpass1@',
      confirm: 'Newpass1@'
    });
    expect((toast || '').toLowerCase().includes('success')).toBe(false);
  });

  // it('Should fail when new password is missing an uppercase letter', async () => {
  //   await ProfilePage.expectPolicyReject({ pwd: 'newpass1@', confirm: 'newpass1@', includes: 'uppercase' });
  // });

  // it('Should fail when new password is missing a lowercase letter', async () => {
  //   await ProfilePage.expectPolicyReject({ pwd: 'NEWPASS1@', confirm: 'NEWPASS1@', includes: 'lower' });
  // });

  // it('Should fail when new password is missing a digit', async () => {
  //   await ProfilePage.expectPolicyReject({ pwd: 'Newpass@', confirm: 'Newpass@', includes: 'digit' });
  // });

  // it('Should fail when new password is missing a special character', async () => {
  //   await ProfilePage.expectPolicyReject({ pwd: 'Newpass1', confirm: 'Newpass1', includes: 'special' });
  // });

  // it('Should fail when new password has repeating characters', async () => {
  //   await ProfilePage.expectPolicyReject({ pwd: 'Newpaaaass1', confirm: 'Newpaaaaass1', includes: 'repeat' });
  // });

  // it('Should fail when using a commonly used password', async () => {
  //   await ProfilePage.expectPolicyReject({ pwd: 'iloveyou', confirm: 'iloveyou', includes: 'common' });
  // });

  // it('Should fail when new password contains username or email', async () => {
  //   await ProfilePage.expectPolicyReject({ pwd: 'Group4@123', confirm: 'Group4@123', includes: 'name' });
  // });

  // it('Should fail when confirm password does not match new password', async () => {
  //   await ProfilePage.clearAndType(ProfilePage.inputNewPassword, 'Newpass1@');
  //   await ProfilePage.clearAndType(ProfilePage.inputConfirmPassword, 'Newpass1');
  //   const toast = await ProfilePage.clickUpdateExpectToastText({ timeout: 6000 });

  //   if (toast) {
  //   const t = toast.toLowerCase();
  //   const looksMismatch = t.includes('do not match') || t.includes('not match') || t.includes('match');
  //   expect(looksMismatch).toBe(true);
  // } else {
  
  //   const confirmEl = await ProfilePage.inputConfirmPassword;
  //   await browser.execute(el => el?.reportValidity?.(), confirmEl);
  //   const msg = await ProfilePage.getNativeValidationText(confirmEl);
  //   expect((msg || '').toLowerCase()).toContain('match');
  // }});

  // it('Should fail when reusing the current password', async () => {
  //   await ProfilePage.expectPolicyReject({ pwd: 'Newpass1!', confirm: 'Newpass1!', includes: 'same' });
  // });
 
  after(async function () {
      // logout
      await navComp.logOutBtn.click()
      await expect(browser).toHaveUrl('http://localhost:3000/login')
      
      // delete created user
        const adminToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGNlYzgyMTk4ZGMzYzYyNTY4Y2NjMjkiLCJpYXQiOjE3NTgzODIxODUsImV4cCI6MTc2MDk3NDE4NX0.sBzf-vbhSFGIXjtej8Fo2VKHBchOv6I4QTBIuTh3M_Y';  
        await axios.delete(
            `http://localhost:3000/api/users/${userId}`,
            {
                headers: {
                    'Accept': '*/*',
                    'Accept-Language': 'en-US,en;q=0.9,vi;q=0.8',
                    'Connection': 'keep-alive',
                    'DNT': '1',
                    'Origin': 'http://localhost:3000',
                    'Referer': 'http://localhost:3000/admin/userlist',
                    'Sec-Fetch-Dest': 'empty',
                    'Sec-Fetch-Mode': 'cors',
                    'Sec-Fetch-Site': 'same-origin',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
                    'sec-ch-ua': '"Chromium";v="140", "Not=A?Brand";v="24", "Google Chrome";v="140"',
                    'sec-ch-ua-mobile': '?0',
                    'sec-ch-ua-platform': '"Windows"',
                    'Cookie': `jwt=${adminToken}`
                }
            }
        )
  })
});
