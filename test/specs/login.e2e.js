import { expect, browser, $ } from '@wdio/globals'
import LoginPage from "../pageobjects/login.page.js";

describe('Test Login', () => {
    beforeEach( async function () {
        //open url
        await LoginPage.open();
    })

    it('logs in using valid credentials', async () => {
        //log in
        await LoginPage.login("john@email.com", "123456");

        //assert navigate to homepage
        await expect(browser).toHaveUrl(`http://localhost:3000/`);

        //assert username (chua biet cach lay duoc ten theo acc dang login)
        await expect($('#username')).toHaveText("John Doe");
    })

    afterEach( async function () {
        //log out
        await LoginPage.logout();
    })
})