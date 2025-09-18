import {expect, browser, $, $$ } from '@wdio/globals';
import LoginPage from "../pageobjects/login.page.js";
import loginTestData from '../data/loginTestData.json' assert {type: "json"};
import shippingData from '../data/shipping data.json' assert {type: "json"};
import HomePage from '../pageobjects/home.page.js';
import ProductSummary from '../pageobjects/product-summary.page.js';
import CartPage from '../pageobjects/cart.page.js';
import navComp from '../pageobjects/components/nav.comp.js';
import CheckoutPage from '../pageobjects/checkout.page.js';
import ProfilePage from '../pageobjects/profile.page.js'
import OrderDetails from '../pageobjects/order-details.page.js'

describe ('Test profile page', async () => {

    before(async () => {
        await browser.url('http://localhost:3000/login')
        await expect(browser).toHaveUrl('http://localhost:3000/login')

        const {email, password} = loginTestData[0]
        await LoginPage.login(email, password)
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

    it ('Should display order history', async () => {
        // open profile page
        await navComp.profileBtn.click()
        await expect (browser).toHaveUrl('http://localhost:3000/profile')
        let orderIdHistory = await ProfilePage.orderId.getText()

        // check order history
        await expect(orderIdHistory).toBe(`${orderIdHistory}`)
    })

    it ('Should allow check order details', async () => {
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
})