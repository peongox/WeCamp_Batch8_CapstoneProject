import { expect, browser, $ } from '@wdio/globals';
import RegisterPage from '../pageobjects/register.page.js';

describe('Test Register', () => {
    beforeEach(async () => {
        //open url
        await RegisterPage.open();
    })

    it('Verify successful account registration with valid credentials', async () => {
        await RegisterPage.register("David Nguyen", "david@email.com", "Valid@2102", "Valid@2102");
        await expect(RegisterPage.NavComponent.dropDownMenu).toHaveText("David Nguyen");
    })
    
    // errror get element in undefeind
    it('Verify failed account registration with invalid email', async () => {
        await RegisterPage.register("Adam Smith", "test", "123", "123");
        await expect(RegisterPage.heading).toHaveText('Register');
    })
    
    //error
    it('Verify failed account registration with invalid email and valid password', async () => {
        await RegisterPage.register("Adam Smith", "user@@example.com", "John@7619", "John@7619");
        const validationMsg = await RegisterPage.emailField.getProperty('validationMessage');

        // assert validation message
        expect(validationMsg.length).toBeGreaterThan(0);
        await expect(RegisterPage.heading).toHaveText('Register');
    })

        //đang sai
        it('Verify failed account registration with valid email and invalid password', async () => {
            await RegisterPage.register("an", "an@example.com", "1", "1");
            // neu dang ky khong duoc, phai trong register, nhung truong truong hop nay
            // tai khoan da dang ky, thi duong dan /register se tra ve home 
            // Route guarding, register route will redirect back to home route
            //await expect(browser).toHaveUrl('http://localhost:3000/register');
            await expect(RegisterPage.heading).toHaveText('Register');
        })

    //đang sai, khong tim thay toastMsg
    it('Verify failed account registration with duplicated email', async () => {
        await RegisterPage.register("Adam Smith", "john@email.com", "Test@2102", "Test@2102");
        await expect(RegisterPage.toastMsg).toBeExisting({timeout: 300});
    })

    //đang sai, khong tim thay toastMsg
    it('Verify failed account registration when email and password are left empty', async () => {
        await RegisterPage.register("Adam Smith", "", "", "");
        await expect(RegisterPage.toastMsg).toBeExisting({timeout: 300});
    })

    afterEach(async () => {
        //logout after successfully registered
        try {
            if (RegisterPage.NavComponent.dropDownMenu.toBeDisplayed({ timeout: 200 })) {
                await RegisterPage.NavComponent.logout();
            }
        } catch (error) {
            console.log('skipped logout because user is not in homepage');
        }
    })

    after(async () => {
        // Reload session once after all tests
        await browser.reloadSession();
    });

})