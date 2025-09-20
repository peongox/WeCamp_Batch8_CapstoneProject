import { $, expect, browser } from '@wdio/globals';
import checkoutPage from '../pageobjects/paypalcheckout.js';
import users from '../data/users.json' with { type: "json" };
import shippingForm from '../data/shippingForm.json' with { type: "json" };

async function prepareForCheckout() {
    await browser.url('http://localhost:3000/');
    await browser.login(users.customers[0].email, users.customers[0].password);
    await browser.pause(1000);
    await browser.addRandomProducts();
    await $('a[href="/cart"]').click();
    await $('//button[text()="Proceed To Checkout"]').click();
    await browser.fillShippingForm(shippingForm.address, shippingForm.city, shippingForm.postalcode, shippingForm.country);
    
    await $('//button[text()="Continue"]').click();
    await $('//button[text()="Continue"]').click();
    await $('//button[text()="Place Order"]').click();
}

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

