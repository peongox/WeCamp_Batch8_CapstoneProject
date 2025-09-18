import { expect, browser, $, $$ } from '@wdio/globals';
import LoginPage from "../pageobjects/login.page.js";
import loginTestData from '../data/loginTestData.json' assert {type: "json"};
import shippingData from '../data/shipping data.json' assert {type: "json"}
import HomePage from '../pageobjects/home.page.js';
import ProductSummary from '../pageobjects/product-summary.page.js';
import CartPage from '../pageobjects/cart.page.js';
import CheckoutPage from '../pageobjects/checkout.page.js';

describe ('Test checkout page', () => {

    before(async () => {
        await browser.url('http://localhost:3000/login')
        await expect(browser).toHaveUrl('http://localhost:3000/login')

        const {email, password} = loginTestData[0]
        await LoginPage.login(email, password)
        await expect(browser).toHaveUrl('http://localhost:3000/')
    })

    it ('Should allow checkout when cart is not empty', async () => {
        // click product
        const productId = await HomePage.getProductId(0)
        await HomePage.clickOnProduct(0) // click first product
        await expect(browser).toHaveUrl(`http://localhost:3000/product/${productId}`)

        // add to cart
        await ProductSummary.clickAddToCart()
        await expect(CartPage.cartItems).toBeElementsArrayOfSize({gte: 1})

        // proceed to checkout
        await CartPage.clickProceed()

        // check layout shipping
        await expect(browser).toHaveUrl('http://localhost:3000/shipping')
        await expect((CheckoutPage.breadcrumbs)[1]).toHaveText('Shipping')
        await expect((CheckoutPage.breadcrumbs)[1]).toHaveHref('/shipping')
        await expect((CheckoutPage.breadcrumbs)[2]).toHaveText('Payment')
        await expect((CheckoutPage.breadcrumbs)[2]).not.toHaveHref('/shipping')

        let empty = await CheckoutPage.isFormEmpty(await CheckoutPage.shippingForm)
        await expect(empty).toBe(true)
    })
    
    it ('Should block checkout when cart is empty', async () => {
        await browser.url('http://localhost:3000/cart')
        await expect(CartPage.cartItems).toBeElementsArrayOfSize(0)
        await expect(CartPage.proceedButton).toBeDisabled()
    })

    it ('Should allow place order after entering shipping details', async () => {
        // click product
        const productId = await HomePage.getProductId(0)
        await HomePage.clickOnProduct(0) // click first product
        await expect(browser).toHaveUrl(`http://localhost:3000/product/${productId}`)

        // add to cart
        await ProductSummary.clickAddToCart()
        await expect(browser).toHaveUrl('http://localhost:3000/cart')
        await expect(CartPage.cartItems).toBeElementsArrayOfSize({gte: 1})

        // proceed to checkout
        await CartPage.clickProceed()
        await expect(browser).toHaveUrl('http://localhost:3000/shipping')
        await expect(CheckoutPage.title).toHaveText('Shipping')
        await expect((CheckoutPage.breadcrumbs)[1]).toHaveText('Shipping')
        await expect((CheckoutPage.breadcrumbs)[1]).toHaveHref('/shipping')
        await expect((CheckoutPage.breadcrumbs)[2]).toHaveText('Payment')
        await expect((CheckoutPage.breadcrumbs)[2]).not.toHaveHref('/shipping')

        let empty = await CheckoutPage.isFormEmpty(await CheckoutPage.shippingForm)
        await expect(empty).toBe(true)

        // fill in shipping details
        for (const data of shippingData) {
            await CheckoutPage.fillForm(await CheckoutPage.shippingForm, data)
        }
        
        // asert not empty
        empty = await CheckoutPage.isFormEmpty(await CheckoutPage.shippingForm)
        await expect(empty).not.toBe(true)

        //proceed to payment
        await CheckoutPage.toNextStep()
        await expect(browser).toHaveUrl('http://localhost:3000/payment')
        await expect(CheckoutPage.breadcrumbs[2]).toHaveHref('/payment')
        await expect(CheckoutPage.title).toHaveText('Payment Method')

        //proceed to place order
        await CheckoutPage.toNextStep()
        await expect(browser).toHaveUrl('http://localhost:3000/placeorder')
        await CheckoutPage.placeOrder()
        await expect(browser).toHaveUrl(expect.stringContaining('/order/'))
    })

    it ('Should block place order when not entering shipping detail', async () => {
        // click product
        const productId = await HomePage.getProductId(0)
        await HomePage.clickOnProduct(0) // click first product
        await expect(browser).toHaveUrl(`http://localhost:3000/product/${productId}`)

        // add to cart
        await ProductSummary.clickAddToCart()
        await expect(browser).toHaveUrl('http://localhost:3000/cart')
        await expect(CartPage.cartItems).toBeElementsArrayOfSize({gte: 1})

        // proceed to checkout
        await CartPage.clickProceed()
        await expect(browser).toHaveUrl('http://localhost:3000/shipping')
        await expect(CheckoutPage.title).toHaveText('Shipping')
        await expect((CheckoutPage.breadcrumbs)[1]).toHaveText('Shipping')
        await expect((CheckoutPage.breadcrumbs)[1]).toHaveHref('/shipping')
        await expect((CheckoutPage.breadcrumbs)[2]).toHaveText('Payment')
        await expect((CheckoutPage.breadcrumbs)[2]).not.toHaveHref('/shipping')

        let empty = await CheckoutPage.isFormEmpty(await CheckoutPage.shippingForm)

        if (!empty) {
            await CheckoutPage.emptyForm(await CheckoutPage.shippingForm)
            empty = await CheckoutPage.isFormEmpty(await CheckoutPage.shippingForm)
            await expect(empty).toBe(true)
        }

        //proceed to payment
        await CheckoutPage.toNextStep()

        // assertion
        await expect(browser).toHaveUrl('http://localhost:3000/shipping')
        const errorMessage = await CheckoutPage.inputShipping[0].getProperty('validationMessage')
        await expect(errorMessage).toBe('Please fill out this field.')
    })

    afterEach(async function () {
        await browser.url('http://localhost:3000/cart')
        if ((await CartPage.cartItems).length > 0) {
            await CartPage.removeItem()
        }
        await browser.url('http://localhost:3000')
        await expect(browser).toHaveUrl('http://localhost:3000/')
    })
})