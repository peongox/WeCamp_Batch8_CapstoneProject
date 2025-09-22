import ProfilePage from '../pageobjects/profile.page.js';
import LoginPage from '../pageobjects/login.page.js';
import data from '../data/profileEditData.json';
import {expect, browser, $, $$ } from '@wdio/globals';
import loginTestData from '../data/loginTestData.json' assert {type: "json"};
import shippingData from '../data/shippingTestData.json' assert {type: "json"};
import HomePage from '../pageobjects/home.page.js';
import ProductSummary from '../pageobjects/productSummary.page.js';
import CartPage from '../pageobjects/cart.page.js';
import navComp from '../pageobjects/components/nav.comp.js';
import CheckoutPage from '../pageobjects/checkout.page.js';
import RegisterPage from '../pageobjects/register.page.js';
import axios from 'axios'

describe ('Profile - View order history', async () => {
    let userId = ''; 
    before(async function () {
        await browser.url('http://localhost:3000/register?redirect=/')
        browser.setupInterceptor()
        await RegisterPage.register(Date.now(),`${Date.now()}@mail.com`,'Valid@2102','Valid@2102')
        await browser.pause(3000)

        browser.expectRequest('POST', '/api/users', 201)
        let createUserReq = await browser.getRequest(0)
        userId = createUserReq.response.body._id

        await expect(browser).toHaveUrl('http://localhost:3000/')
    })

    beforeEach(async () => {
        // click product
        const productId = await HomePage.getProductId(0)
        await HomePage.clickOnProduct(0) // click first product
        await expect(browser).toHaveUrl(`http://localhost:3000/product/${productId}`)

        // add to cart
        await ProductSummary.clickAddToCart()
        await expect(browser).toHaveUrl('http://localhost:3000/cart')
        await expect(CartPage.cartItems).toBeElementsArrayOfSize({gte: 1})

        // checkout - fill in shipping 
        await CartPage.clickProceed()
        await expect(browser).toHaveUrl('http://localhost:3000/shipping')
        for (const data of shippingData) {
            await CheckoutPage.fillForm(await CheckoutPage.shippingForm, data)
        }

        // proceed to payment method
        await CheckoutPage.toNextStep()
        await expect(browser).toHaveUrl('http://localhost:3000/payment')
        await expect(CheckoutPage.breadcrumbs[2]).toHaveHref('/payment')
        await expect(CheckoutPage.title).toHaveText('Payment Method')

        // proceed to place order
        await CheckoutPage.toNextStep()
        await expect(browser).toHaveUrl('http://localhost:3000/placeorder')
        await CheckoutPage.placeOrder()
        await expect(browser).toHaveUrl(expect.stringMatching(/\/order\/.+/))  
    })

    it('Should display order history', async () => {
        // open profile page
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

        // assertion
        await expect(rows).toBeElementsArrayOfSize({ gte: 1 })

    })

    it('Should allow check order details', async () => {
        // open profile page
        await navComp.profileBtn.click()
        await expect (browser).toHaveUrl('http://localhost:3000/profile')
        let orderIdHistory = await ProfilePage.orderId.getText()

        // view details
        await ProfilePage.viewOrderDetails()
        await expect(browser).toHaveUrl(`http://localhost:3000/order/${orderIdHistory}`)
    })

    afterEach(async () => {
        await browser.url('http://localhost:3000/')
        await expect(browser).toHaveUrl('http://localhost:3000/')
    })

    after(async () => {
        // logout
        await navComp.logOutBtn.click()
        await expect(browser).toHaveUrl('http://localhost:3000/login')

        // delete created user
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
})