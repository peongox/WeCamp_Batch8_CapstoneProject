import { expect, browser, $ } from '@wdio/globals'
import LoginPage from "../pageobjects/login.page.js";

describe('Test Login', () => {
    beforeEach( async function () {
        await LoginPage.open();
    })

    it('logs in using valid credentials', async () => {
        //await LoginPage.open()
        await LoginPage.login("john@email.com", "123456");
        ////assert navigate vao trong chu
        await expect(browser).toHaveUrl(`http://localhost:3000/`);
        ////assert them username cua account do (chua biet cach lay duoc ten theo acc dang login)
        await expect($('#username')).toHaveText("John Doe");
        
        //await LoginPage.logout();
    })

    afterEach( async function () {
        //log out
        await LoginPage.logout();
    })
})