import ProfilePage from '../pageobjects/profile.page.js';
import data from '../data/profileEditData.json';
import {expect, browser, $, $$ } from '@wdio/globals';
import navComp from '../pageobjects/components/nav.comp.js';
import RegisterPage from '../pageobjects/register.page.js';
import axios from 'axios'

describe('Profile - Edit name', () => {
    const updateBtnSel = '#root > main > div > div > div.col-md-3 > form > button';
    const successText  = 'Profile updated successfully';    
    let userId = '';

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
  
  it('Update both name and email (valid)', async () => {
    await ProfilePage.clearAndType(ProfilePage.inputName, data[0].name);
    await ProfilePage.clearAndType(ProfilePage.inputEmail, data[0].email);

    const toastText = await ProfilePage.clickUpdateExpectToastText();
    await ProfilePage.expectMsgIncludesOneOf(toastText, [successText]);

    const usernameLink = await $('#username');
    await expect(usernameLink).toHaveText(data[0].name);
  });

  it('Update only name (valid)', async () => {
    await ProfilePage.clearAndType(ProfilePage.inputName, data[1].name);
    const toastText = await ProfilePage.clickUpdateExpectToastText();
    await ProfilePage.expectMsgIncludesOneOf(toastText, [successText]);

    const usernameLink = await $('#username');
    await expect(usernameLink).toHaveText(data[1].name);
  });

  it('Update only email (valid)', async () => {
    await ProfilePage.clearAndType(ProfilePage.inputEmail, data[2].email);
    const toastText = await ProfilePage.clickUpdateExpectToastText();
    await ProfilePage.expectMsgIncludesOneOf(toastText, [successText]);
  });

  it('Valid email with allowed chars + MLD', async () => {
    await ProfilePage.clearAndType(ProfilePage.inputEmail, data[3].email);
    const toastText = await ProfilePage.clickUpdateExpectToastText();
    await ProfilePage.expectMsgIncludesOneOf(toastText, [successText]);
  });

  it('Trim spaces in name & email', async () => {
    const rawName = data[4].name;
    const rawEmail = data[4].email;
    const expName = rawName.trim();
    const expEmail = rawEmail.trim();

    await ProfilePage.clearAndType(ProfilePage.inputName, rawName);
    await ProfilePage.clearAndType(ProfilePage.inputEmail, rawEmail);

    const toastText = await ProfilePage.clickUpdateExpectToastText();
    await ProfilePage.expectMsgIncludesOneOf(toastText, [successText]);

    await expect(await ProfilePage.inputName.getValue()).toBe(expName);
    const usernameLink = await $('#username');
    await expect(usernameLink).toHaveText(expName);
    await expect(await ProfilePage.inputEmail.getValue()).toBe(expEmail);
  });

  it('Accept uppercase email', async () => {
    await ProfilePage.clearAndType(ProfilePage.inputEmail, data[5].email);
    const toastText = await ProfilePage.clickUpdateExpectToastText();
    await ProfilePage.expectMsgIncludesOneOf(toastText, [successText]);
  });

  it('Click update with no changes → error toast appears', async () => {
    await ProfilePage.clickUpdate();
    const toast = await ProfilePage.waitForToastText({ timeout: 5000 });
    await expect(!!toast).toBe(true);
    await expect(toast.toLowerCase()).toContain('unsuccessfully');
  });

  it("Invalid email: missing '@'", async () => {
    await ProfilePage.clearAndType(ProfilePage.inputEmail, data[7].email);
    await ProfilePage.clickUpdate();
    const msg = await ProfilePage.getValidationMessage('#email');
    await expect(msg).toContain("include an '@'");
  });

  it("Invalid email: multiple '@'", async () => {
    await ProfilePage.clearAndType(ProfilePage.inputEmail, data[8].email);
    await ProfilePage.clickUpdate();
    const msg = await ProfilePage.getValidationMessage('#email');
    await expect(msg).toContain("should not contain the symbol '@'");
  });

  it("Invalid email: nothing after '@'", async () => {
    await ProfilePage.clearAndType(ProfilePage.inputEmail, data[9].email);
    await ProfilePage.clickUpdate();
    const msg = await ProfilePage.getValidationMessage('#email');
    await expect(msg).toContain("Please enter a part following '@'");
  });

  it("Invalid email: nothing before '@'", async () => {
    await ProfilePage.clearAndType(ProfilePage.inputEmail, data[10].email);
    await ProfilePage.clickUpdate();
    const msg = await ProfilePage.getValidationMessage('#email');
    await expect(msg).toContain("Please enter a part followed by '@'");
  });

  it("Invalid email: missing dot", async () => {
    await ProfilePage.clearAndType(ProfilePage.inputEmail, data[11].email);
    await ProfilePage.clickUpdate();
    const msg = await ProfilePage.getValidationMessage('#email');
    await ProfilePage.expectMsgIncludesOneOf(msg, ["wrong position", "'.'", "invalid email"]);
  });

  it('Invalid email: domain starts with dot', async () => {
  await ProfilePage.clearAndType(ProfilePage.inputEmail, data[12].email);
  await ProfilePage.clickUpdate();
  await expect(await ProfilePage.getValidationMessage('#email'))
    .toMatch(/start with '\.'|wrong position|invalid email/i);
  });


  it("Invalid email: domain ends with dot", async () => {
    await ProfilePage.clearAndType(ProfilePage.inputEmail, data[13].email);
    await ProfilePage.clickUpdate();
    const msg = await ProfilePage.getValidationMessage('#email');
    await ProfilePage.expectMsgIncludesOneOf(msg, ["end with '.'", "wrong position", "invalid email"]);
  });

  it("Invalid email: spaces in email", async () => {
    await ProfilePage.clearAndType(ProfilePage.inputEmail, data[14].email);
    await ProfilePage.clickUpdate();
    const msg = await ProfilePage.getValidationMessage('#email');
    await ProfilePage.expectMsgIncludesOneOf(msg, [
      "should not contain the symbol ' '",
      "should not contain spaces",
      "spaces"
    ]);
  });

  it('Empty name', async () => {
    await ProfilePage.clearAndType(ProfilePage.inputEmail, data[15].email);
    await ProfilePage.clickUpdate();
    const msg = await ProfilePage.getValidationMessage('#email');
    await expect(msg.toLowerCase()).toContain('required');
  });

  it('Empty email', async () => {
    await ProfilePage.clearAndType(ProfilePage.inputName, data[16].name);
    await ProfilePage.clickUpdate();
    const msg = await ProfilePage.getValidationMessage('#email');
    await expect(msg.toLowerCase()).toContain('required');
  });

  it('Whitespace-only name', async () => {
    await ProfilePage.clearAndType(ProfilePage.inputName, data[17].name);
    await ProfilePage.clearAndType(ProfilePage.inputEmail, data[17].email);
    await ProfilePage.clickUpdate();
    const msgName = await ProfilePage.getValidationMessage(ProfilePage.inputName);
    const msgEmail = await ProfilePage.getValidationMessage('#email');
    await expect(`${msgName} ${msgEmail}`.toLowerCase()).toContain('required');
  });

  it('Whitespace-only email', async () => {
    await ProfilePage.clearAndType(ProfilePage.inputName, data[18].name);
    await ProfilePage.clearAndType(ProfilePage.inputEmail, data[18].email);
    await ProfilePage.clickUpdate();
    const msg = await ProfilePage.getValidationMessage('#email');
    await expect(msg.toLowerCase()).toContain('required');
  });

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
})