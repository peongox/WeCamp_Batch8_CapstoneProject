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

    it('Verify failed account registration with invalid email', async () => {
        await RegisterPage.register("Adam Smith", "test", "123", "123");

        const message = await RegisterPage.emailField.getProperty('validationMessage');

        expect(message).toEqual(expect.stringContaining('@'));
        console.log('Validation message: ', message);
    })

    it('Verify failed account registration with invalid email and valid password', async () => {
        await RegisterPage.register("Adam Smith", "user@@example.com", "John@7619", "John@7619");
        const message = await RegisterPage.emailField.getProperty('validationMessage');

        expect(message).toEqual(expect.stringContaining('@'));
        console.log('Validation message: ', message);
    })

    it('Verify failed account registration with valid email and invalid password', async () => {
        await RegisterPage.register("an", "an@example.com", "1", "1");
        
        const message = await RegisterPage.passField.getProperty('validationMessage');
        await expect(message).toEqual(expect.stringContaining('invalid password'));
        console.log('Validation message: ', message);
    })

    it('Verify failed account registration with duplicated email', async () => {
        await RegisterPage.register("Adam Smith", "john@email.com", "Test@2102", "Test@2102");
        await expect(RegisterPage.toastMsg).toBeExisting({timeout: 800});
        await expect(RegisterPage.toastMsg).toHaveText('User already exists');

    })

    it('Verify failed account registration when email and password are left empty', async () => {
        await RegisterPage.register("Adam Smith", "", "", "");
        await expect(RegisterPage.toastMsg).toBeExisting({wait: 800});
        await expect(RegisterPage.toastMsg).toHaveText(expect.stringContaining('User validation failed'));
        console.log(RegisterPage.toastMsg.getText());

    })

    afterEach(async () => {
            await browser.reloadSession();
    })
})
