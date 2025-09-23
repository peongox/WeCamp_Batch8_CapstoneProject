import { expect, browser, $ } from '@wdio/globals';
import ProfilePage from '../pageobjects/profile.page.js';
import paypalUsers from '../data/usersPaypalTestData.json' with { type: "json" };
import LoginPage from '../pageobjects/login.page.js';
import data from '../data/profileEditData.json';
import loginTestData from '../data/loginTestData.json' assert {type: "json"};
import HomePage from '../pageobjects/home.page.js';
import ProductSummary from '../pageobjects/productSummary.page.js';
import CartPage from '../pageobjects/cart.page.js';
import navComp from '../pageobjects/components/nav.comp.js';
import checkoutPage from '../pageobjects/paypalcheckout.js';
import RegisterPage from '../pageobjects/register.page.js';
import shippingForm from '../data/shippingForm.json' with { type: "json" };
import axios from 'axios'
import adminOrder from '../pageobjects/admin.orders.page.js'
import orderDetailPage from '../pageobjects/orderDetail.page.js';

describe ('Test E2E', async () => {

    it('User_Login_PlaceOrder_PayOrder_ViewOrders', async () => {
        //login
        const {email, password} = loginTestData[0]
        await LoginPage.open();
        await LoginPage.login(email, password)
        
        // place order
        const indexProductToBuy = 3
        const productId = await HomePage.getProductId(indexProductToBuy)
        await HomePage.clickOnProduct(indexProductToBuy) 
        await expect(browser).toHaveUrl(`http://localhost:3000/product/${productId}`)
        await ProductSummary.clickAddToCart()

        await $('//button[text()="Proceed To Checkout"]').click();
        await browser.fillShippingForm(shippingForm.address, shippingForm.city, shippingForm.postalcode, shippingForm.country);
        
        await $('//button[text()="Continue"]').click()
        await $('//button[text()="Continue"]').click()
        await browser.setupInterceptor()
        await $('//button[text()="Place Order"]').click()

        await browser.waitUntil(
            async () => (await browser.getUrl()).includes('/order/'),
            {
                timeout: 5000,
                timeoutMsg: 'Expected to be on order detail page within 5s'
            }
        )

        await browser.expectRequest('POST', '/api/orders', 201)
        let creatOrderReq = await browser.getRequest(0)
        orderId = creatOrderReq.response.body._id
        console.log('look', orderId)

        await expect(browser).toHaveUrl(`http://localhost:3000/order/${orderId}`)

        // pay order
        const savedTotalAmount = await checkoutPage.getTotalAmount();
        const savedShippingAddress = await checkoutPage.getShippingAddress();
        await checkoutPage.clickPayPalBtn()
        await browser.waitUntil(async () => (await browser.getWindowHandles()).length > 1, {
                timeout: 10000,
                timeoutMsg: 'Expected new PayPal window to appear after 10s',
            });

        const originalWindowHandle = await browser.getWindowHandle()
        const windowHandles = await browser.getWindowHandles()
        const newWindowHandle = windowHandles.find(handle => handle !== originalWindowHandle)

        if (newWindowHandle) {
            await browser.switchToWindow(newWindowHandle);
            await expect(browser).toHaveUrl(expect.stringContaining('sandbox.paypal.com/'));
        } else {
            throw new Error("New PayPal window did not open.");
        }

        await expect(browser).toHaveUrl(expect.stringContaining('sandbox.paypal.com/'))
        await checkoutPage.loginToPayPal(paypalUsers.paypal_test[0].email, paypalUsers.paypal_test[0].password)
            
        const PshippingAddress = await (await checkoutPage.PayPalshippingAddress).getText();
        const PtotalAmount = await checkoutPage.getPayPalTotalAmount();
        
        await expect(PtotalAmount).toEqual(savedTotalAmount);
        await expect(PshippingAddress).toContain(savedShippingAddress)
        await checkoutPage.clickPayPalCheckoutBtn()
        await browser.waitUntil(async () => {
            const handles = await browser.getWindowHandles();
            return handles.length === 1;
        }, {
            timeout: 15000,
            timeoutMsg: 'Expected PayPal pop-up window to close within 15 seconds'
        });

        await browser.switchToWindow(windowHandles[0])

        await expect(browser).toHaveUrl(expect.stringContaining('order'))

        // view order
        await navComp.profileBtn.click()
        await expect (browser).toHaveUrl('http://localhost:3000/profile')

        await browser.waitUntil(
            async () => (await ProfilePage.orderDetailsEle).length > 0,
            {
                timeout: 5000,
                timeoutMsg: 'Expected at least 1 order row within 5s'
            }
        )

        const rows = await ProfilePage.orderDetailsEle
        await expect(rows).toBeElementsArrayOfSize({ gte: 1 })

        // view details
        let orderIdHistory = await ProfilePage.orderId.getText()
        await ProfilePage.viewOrderDetails()
        await expect(browser).toHaveUrl(`http://localhost:3000/order/${orderIdHistory}`)
    })

    it('User_Register_UpdateProfile', async () => {
        // register
        const registerName = Date.now()
        await RegisterPage.open()
        await expect(browser).toHaveUrl('http://localhost:3000/register')

        browser.setupInterceptor()
        await RegisterPage.register(`${registerName}`,`${registerName}@mail.com`,'Valid@2102','Valid@2102')
        await browser.pause(3000)

        browser.expectRequest('POST', '/api/users', 201)
        let createUserReq = await browser.getRequest(0)
        userId = createUserReq.response.body._id

        await expect(browser).toHaveUrl('http://localhost:3000/')
        await expect(RegisterPage.NavComponent.dropDownMenu).toHaveText(`${registerName}`);

        // go to profile
        await navComp.profileBtn.click()
        await expect (browser).toHaveUrl('http://localhost:3000/profile')

        // change name and email  
        const newName = Date.now()
        const successText  = 'Profile updated successfully';    
        await ProfilePage.clearAndType(ProfilePage.inputName, `${newName}`);
        await ProfilePage.clearAndType(ProfilePage.inputEmail,`${newName}@mail.com`);
        
        const toastText = await ProfilePage.clickUpdateExpectToastText();
        await ProfilePage.expectMsgIncludesOneOf(toastText, [successText]);

        const usernameLink = await $('#username');
        await expect(usernameLink).toHaveText(`${newName}`);

        // change password
        await expect(ProfilePage.lblCurrentPassword).toBeDisplayed()
        await ProfilePage.clearAndType(ProfilePage.inputNewPassword, 'Newpass1@');
        await ProfilePage.clearAndType(ProfilePage.inputConfirmPassword, 'Newpass1@');
        const toast = await ProfilePage.clickUpdateExpectToastText();
        await ProfilePage.expectMsgIncludesOneOf(toast.toLowerCase(), [
            'password changed successfully',
            'password updated successfully',
            'password changed',
            'profile updated successfully'
        ]);

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

    it('Admin_Login_MarkOrderDelivered', async () => {
        // login as admin
        await browser.url('http://localhost:3000/login')
        await browser.login(paypalUsers.admins[0].email, paypalUsers.admins[0].password)
        await browser.pause(1000)

        // view order list 
        await browser.url('http://localhost:3000/admin/orderlist')
        await expect(browser).toHaveUrl('http://localhost:3000/admin/orderlist')

        // view paid order detail
        await adminOrder.viewFirstPaidOrder()
        
        await expect(orderDetailPage.MarkasDlvrdBtn).toBeDisplayed()
    
        // mark as delivered
        await orderDetailPage.clickMarkasDlvrdBtn()

        await browser.waitUntil(
        async () => !(await orderDetailPage.MarkasDlvrdBtn.isExisting()),
            {
                timeout: 1000,
                timeoutMsg: 'Expected "Mark as Delivered" button to disappear within .5s'
            }
        );

        await expect(orderDetailPage.MarkasDlvrdBtn).not.toBeExisting()
        await expect(orderDetailPage.DeliveryStatus).toHaveText(expect.stringContaining('Delivered on'))
    })

    afterEach(async function () {
        await navComp.logOutBtn.click()
        
        await expect(browser).toHaveUrl('http://localhost:3000/login')
    })
})