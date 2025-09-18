//current order db capped at 90, there has been no new records of new orders, the order returns 500 internal server error

import { $, expect, browser } from '@wdio/globals';
import checkoutPage from '../pageobjects/checkout.page.js';
import orderDetailPage from '../pageobjects/orderDetail.page.js';
import users from '../data/users.json' with { type: "json" };
import shippingForm from '../data/shippingForm.json' with { type: "json" };

async function prepareForMD() {
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

    await checkoutPage.clickPayPalCheckoutBtn()
    await browser.waitUntil(async () => {
        const handles = await browser.getWindowHandles();
        return handles.length === 1;
    }, {
        timeout: 15000,
        timeoutMsg: 'Expected PayPal pop-up window to close within 15 seconds'
    });
    await browser.switchToWindow(originalWindowHandle)
}

describe('Mark as Delivered', () => {
    before(async () => {
        await prepareForMD();
    });
    it('TC_MD_02 Verify that User without Admin role cannot update the order’s delivery status ', async () => {
        await expect(orderDetailPage.MarkasDlvrdBtn).not.toBeDisplayed()
    })
    it('TC_MD_01 Verify that Admin can view Order Details page with "Mark as Delivered" button visible and can click the button to update the order’s delivery status', async () => {
        await browser.pause(3000)
        await $('#username').click()
        await $('//*[@id="basic-navbar-nav"]/div/div/div/a[2]').waitForExist({ timeout: 5000 })
        await $('//*[@id="basic-navbar-nav"]/div/div/div/a[2]').click()
        await browser.url('http://localhost:3000/')
        await browser.login(users.admins[0].email, users.admins[0].password)
        await browser.pause(1000)
        await browser.url('http://localhost:3000/admin/orderlist')
        await $('table a.btn-light:first-of-type').waitForDisplayed({ timeout: 2000 })
        await $('table a.btn-light:first-of-type').click()
        
        await expect(orderDetailPage.MarkasDlvrdBtn).toBeDisplayed()
        
        await orderDetailPage.clickMarkasDlvrdBtn()

        await browser.waitUntil(
        async () => !(await orderDetailPage.MarkasDlvrdBtn.isExisting()),
            {
                timeout: 500,
                timeoutMsg: 'Expected "Mark as Delivered" button to disappear within .5s'
            }
        );

        await expect(orderDetailPage.MarkasDlvrdBtn).not.toBeExisting()
        await expect(orderDetailPage.DeliveryStatus).toHaveText(expect.stringContaining('Delivered on'))
    });
})