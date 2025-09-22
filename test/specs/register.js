import { expect, browser, $ } from '@wdio/globals';
import RegisterPage from '../pageobjects/register.page.js';
import homePage from '../pageobjects/home.page.js';
import axios from 'axios'

describe('Test Register', () => {
    beforeEach(async () => {
        //open url
        await RegisterPage.open();
        await expect(browser).toHaveUrl('http://localhost:3000/register')
    })

    let userId = ''
    it('Verify successful account registration with valid credentials', async () => {
        browser.setupInterceptor()
        const registerName = Date.now()
        await RegisterPage.register(`${registerName}`,`${registerName}@mail.com`,'Valid@2102','Valid@2102');
        await expect(RegisterPage.NavComponent.dropDownMenu).toHaveText(`${registerName}`);
        await expect(browser).toHaveUrl('http://localhost:3000/')

        await browser.waitUntil( async () => await homePage.productLinks[0].isExisting(), {
            timeout: 5000, timeoutMsg: 'Homepage fail to load'
        })

        console.log('look here', await browser.expectRequest('POST', '/api/users', 201))
        let createUserReq = await browser.getRequest(0)
        userId = createUserReq.response.body._id

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

    it('Verify failed account registration with invalid email', async () => {
        await RegisterPage.register("Adam Smith", "test", "123", "123");

        const message = await RegisterPage.emailField.getProperty('validationMessage');

        expect(message).toEqual(expect.stringContaining('@'));
        console.log('Validation message: ', message);
    })

    it('Verify failed account registration with invalid email and valid password', async () => {
        await RegisterPage.register("Adam Smith", "user@example", "John@7619", "John@7619");
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
