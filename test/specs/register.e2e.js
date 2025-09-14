import { expect, browser, $ } from '@wdio/globals'
import RegisterPage from '../pageobjects/register.page.js'

describe('Test Register', () => {
    beforeEach( async function () {
        //open url
        await RegisterPage.open();
    })

    it('register with valid credentials', async () => {
        //register new account
        await RegisterPage.register("David", "david@email.com", "David@1", "David@1");

        //assert navigate to homepage
        await expect(browser).toHaveUrl('http://localhost:3000/');
    })

    afterEach( async function () {
        //clean up data
    })
})