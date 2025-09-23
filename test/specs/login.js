import { expect, browser, $ } from '@wdio/globals';
import LoginPage from "../pageobjects/login.page.js";
import loginTestData from '../data/loginTestData.json' assert {type: "json"};

describe('Test Login', () => {
    beforeEach(async function () {
        //open url
        await LoginPage.open();
    })

    loginTestData.forEach((data) => {
        it(`Log in with email: ${data.email} should ${data.expectedStatus ? 'logged in successfully' : 'logged in unsuccessfully'}`, async () => {
            await LoginPage.login(data.email, data.password);

            if (data.expectedStatus) {

                //assert navigate to homepage
                await expect(browser).toHaveUrl('http://localhost:3000/', { message: 'Expected to be navigated to homepge but stayed on login page' });

                //assert the account's username
                await expect(LoginPage.NavComponent.dropDownMenu).toHaveText(data.username);
            }

            else {
                //assert the url is still the same
                await expect(browser).toHaveUrl('http://localhost:3000/login', { message: 'Expected to stay on login page but be navigated to somewhere else' });
                
                //assert a toast message to be displayed
                //await expect(LoginPage.toastMsg).toBeExisting({ wait: 100, message: 'The email format is incorrect' });

            }
        })
    })

    afterEach(async function () {
        //log out
        try {
            if (await LoginPage.NavComponent.dropDownMenu.isDisplayed({ timeout: 200 })) {
                await LoginPage.logout();
            }
        } catch (error) {
            console.log("skipped logout, user is not logged in");
        }
    })
})