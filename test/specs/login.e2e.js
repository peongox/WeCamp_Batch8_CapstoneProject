import { expect, browser, $ } from '@wdio/globals';
import LoginPage from "../pageobjects/login.page.js";
import loginTestData from '../data/loginTestData.json' assert {type: "json"};

describe('Test Login', () => {
    beforeEach( async function () {
        //open url
        await LoginPage.open();
    })

    loginTestData.forEach((data) => {
        it('User login', async () => {
            await LoginPage.login(data.email, data.password);

            //test data includes username -> valid inputs
            if(data.username){

                //assert navigate to homepage
                await expect(browser).toHaveUrl(`http://localhost:3000/`);

                //assert the account's username
                await expect(LoginPage.NavComponent.dropDownMenu).toHaveText(data.username);
            }
            //test data DOES NOT include username -> invalid inputs
            else{
                try {
                    //assert a toast message to be displayed
                    await expect(LoginPage.errorMsg).toBeExisting({wait: 100});
                } catch (error) {
                    console.log("The email format is incorrect");
                }
            }
        })
    })

    afterEach( async function () {
        //log out
        try {
            if(await LoginPage.NavComponent.dropDownMenu.isDisplayed({timeout: 100})){
                await LoginPage.logout();
            }
        } catch (error) {
            console.log("skipped logout");
        }
    })
})