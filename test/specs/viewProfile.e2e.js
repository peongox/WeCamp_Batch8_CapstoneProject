import { expect, browser, $ } from '@wdio/globals';
import ProfilePage from '../pageobjects/profile.page.js';
import LoginPage from '../pageobjects/login.page.js';

describe('Test View Profile', () => {
    before( async function () {
        await LoginPage.open();
        await LoginPage.login('john@email.com', '123456');
    });

    it('Verify navigation to profile page for logged-in user', async () => {
        await browser.pause(300);

        await ProfilePage.goToProfilePage();
        //await browser.pause(300);

        await expect(browser).toHaveUrl('http://localhost:3000/profile');

        await expect(ProfilePage.inputName).toBeDisplayed();
        await expect(ProfilePage.inputName).toHaveValue('John Doe');

        await expect(ProfilePage.inputEmail).toBeDisplayed();
        await expect(ProfilePage.inputEmail).toHaveValue('john@email.com');
    })

    it('Verify redirection to login page for non-logged-in user', async () => {
        await ProfilePage.goToProfilePage();

        await expect(browser).toHaveUrl('http://localhost:3000/login');
        await expect(LoginPage.emailField).toBeDisplayed();
        await expect(LoginPage.passwordField).toBeDisplayed();
    })

    afterEach( async function () {
        await browser.reloadSession();
    });
});