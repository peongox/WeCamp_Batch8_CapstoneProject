import { $, expect, browser } from '@wdio/globals';
import checkoutPage from '../pageobjects/paypalcheckout.js';
import users from '../data/usersPaypalTestData.json' with { type: "json" };
import shippingForm from '../data/shippingForm.json' with { type: "json" };
import HomePage from '../pageobjects/home.page.js';
import ProductSummary from '../pageobjects/productSummary.page.js';
import navComp from '../pageobjects/components/nav.comp.js';
import LoginPage from "../pageobjects/login.page.js";
import loginTestData from '../data/loginTestData.json' assert {type: "json"};
import shippingData from '../data/shippingTestData.json' assert {type: "json"}
import CartPage from '../pageobjects/cart.page.js';
import CheckoutPage from '../pageobjects/checkout.page.js';

async function prepareForCheckout() {
    await browser.url('http://localhost:3000/');
    await browser.login(users.customers[0].email, users.customers[0].password);
    await browser.pause(1000);

    const productId = await HomePage.getProductId(0)
    await HomePage.clickOnProduct(0) 
    await expect(browser).toHaveUrl(`http://localhost:3000/product/${productId}`)
    await ProductSummary.clickAddToCart()

    await $('//button[text()="Proceed To Checkout"]').click();
    await browser.fillShippingForm(shippingForm.address, shippingForm.city, shippingForm.postalcode, shippingForm.country);
    
    await $('//button[text()="Continue"]').click();
    await $('//button[text()="Continue"]').click();
    await $('//button[text()="Place Order"]').click();
}

describe ('Checkout page', () => {

    before(async () => {
        await browser.url('http://localhost:3000/login')
        await expect(browser).toHaveUrl('http://localhost:3000/login')

        const {email, password} = loginTestData[0]
        await LoginPage.login(email, password)
        await expect(browser).toHaveUrl('http://localhost:3000/')
    })

    it('Should allow checkout when cart is not empty', async () => {
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
    
    it('Should block checkout when cart is empty', async () => {
        await browser.url('http://localhost:3000/cart')
        await expect(CartPage.cartItems).toBeElementsArrayOfSize(0)
        await expect(CartPage.proceedButton).toBeDisabled()
    })

    it('Should allow place order after entering shipping details', async () => {
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

    it('Should block place order when not entering shipping detail', async () => {
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
        //clean cart
        await browser.url('http://localhost:3000/cart')
        if ((await CartPage.cartItems).length > 0) {
            await CartPage.removeItem()
        }

        // return to homepage
        await browser.url('http://localhost:3000')
        await expect(browser).toHaveUrl('http://localhost:3000/')
    })

    after(async function () {
            await navComp.logOutBtn.click()
    
            await expect(browser).toHaveUrl('http://localhost:3000/login')
    })
})

describe('PayPal Payment', () => {
    let savedTotalAmount;
    let savedShippingAddress;

    describe('Successfully pay with PayPal', () => {
        before(async () => {
            await prepareForCheckout();
        });
        it('TC_PP_01 Verify that Customer can be directed to PayPal Sign In pop-up window', async () => {
            savedTotalAmount = await checkoutPage.getTotalAmount();
            savedShippingAddress = await checkoutPage.getShippingAddress();

            const originalWindowHandle = await browser.getWindowHandle()
            await checkoutPage.clickPayPalBtn()
            await browser.waitUntil(async () => (await browser.getWindowHandles()).length > 1, {
                timeout: 10000,
                timeoutMsg: 'Expected new PayPal window to appear after 10s',
            });
            const windowHandles = await browser.getWindowHandles()
            const newWindowHandle = windowHandles.find(handle => handle !== originalWindowHandle)
            if (newWindowHandle) {
                await browser.switchToWindow(newWindowHandle);
                await expect(browser).toHaveUrl(expect.stringContaining('sandbox.paypal.com/'));
            } else {
                throw new Error("New PayPal window did not open.");
            }

            await expect(browser).toHaveUrl(expect.stringContaining('sandbox.paypal.com/'))
        });

        it('TC_PP_02 Verify that the data of the payment is displayed correctly on PayPal Payment Details page', async () => {
            await checkoutPage.loginToPayPal(users.paypal_test[0].email, users.paypal_test[0].password)
            
            const PshippingAddress = await (await checkoutPage.PayPalshippingAddress).getText();
            const PtotalAmount = await checkoutPage.getPayPalTotalAmount();
            
            await expect(PtotalAmount).toEqual(savedTotalAmount);
            await expect(PshippingAddress).toContain(savedShippingAddress)
        });

        it('TC_PP_03 Verify that PayPal payment is processed successfully', async () => {
            await checkoutPage.clickPayPalCheckoutBtn()

            await browser.waitUntil(async () => {
                const handles = await browser.getWindowHandles();
                return handles.length === 1;
            }, {
                timeout: 15000,
                timeoutMsg: 'Expected PayPal pop-up window to close within 15 seconds'
            });

            const windowHandles = await browser.getWindowHandles()
            await browser.switchToWindow(windowHandles[0])

            await expect(browser).toHaveUrl(expect.stringContaining('order'))
        });

        it('TC_PP_04 Verify that payment status is updated correctly on Order Summary page', async () => {
            await expect(checkoutPage.toastMessage).toBeDisplayed()
            await expect(checkoutPage.toastMessage).toBeExisting()
            await expect(checkoutPage.paymentStatus).toHaveText(expect.stringContaining('Paid on'))
        });
    });

    describe('Unsuccessfully pay with PayPal', () => {
        before(async () => {
            await browser.reloadSession();
            await prepareForCheckout();
        });
        it('TC_PP_05 Verify that payment status is shown correctly after cancelling payment', async () => {
            const originalWindowHandle = await browser.getWindowHandle()
            await checkoutPage.clickPayPalBtn()
            await browser.waitUntil(async () => (await browser.getWindowHandles()).length > 1, {
                timeout: 10000,
                timeoutMsg: 'Expected new PayPal window to appear after 10s',
            });
            const windowHandles = await browser.getWindowHandles()
            const newWindowHandle = windowHandles.find(handle => handle !== originalWindowHandle)
            if (newWindowHandle) {
                await browser.switchToWindow(newWindowHandle);
            } else {
                throw new Error("New PayPal window did not open.");
            }

            await checkoutPage.loginToPayPal(users.paypal_test[0].email, users.paypal_test[0].password)
            await checkoutPage.clickPayPalCancelBtn()

            await browser.switchToWindow(originalWindowHandle)
            await expect(checkoutPage.paymentStatus).toHaveText('Not Paid')
        })
    });

})