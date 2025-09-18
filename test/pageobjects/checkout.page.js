import { $, expect } from '@wdio/globals';
import Page from './page';

class CheckoutPage extends Page {
    get PayPalBtn () {
        return $('div[aria-label="PayPal"] div[class="paypal-button-label-container"] img');
    }
    get PayPalEmailField () {
        return $('#email');
    }
    get PayPalPasswordField () {
        return $('#password');
    }
    get PayPalLoginBtn () {
        return $('#btnLogin');
    }
    get PayPalshippingAddress () {
        return $('p[class*="shipping-addresses"]');
    }
    get PayPalCheckoutBtn () {
        return $('button[class*="CheckoutButton"]');
    }
    get PayPalCancelBtn () {
        return $('a[class*="CancelLink"]');
    }

    get toastMessage () {
        return $('div[class*="Toastify__toast-body"]');
    }
    get paymentStatus () {
        return $('/html/body/div/main/div/div/div[1]/div/div[2]/div');
    }

    async getTotalAmount() {
        const element = await $('div.list-group-item:nth-child(5) > div:nth-child(1) > div:nth-child(2)');
        const text = await element.getText();
        const number = parseFloat(text.replace(/[^\d.-]/g, ''));
        return number;
    }

    async getPayPalTotalAmount() {
        const element = await $('span[class*="Cart_cartAmount"]');
        const text = await element.getText();
        const number = parseFloat(text.replace(/[^\d.-]/g, ''));
        return number;
    }

    async getShippingAddress() {
        const addresselement = await $('//p[contains(., "Address:")]');
        const fullAddress = await addresselement.getText();
        const parts = fullAddress
            .replace('Address:', '')
            .split(',')
            .map(p => p.trim());
        const cityOnly = parts[3].replace(/\s*\d+/, '').trim();
        return [parts[0], parts[1], parts[2], cityOnly].join(', ');
    }

    async clickPayPalBtn () {
         const payPalIframe = await $('iframe[title="PayPal"]');
         await payPalIframe.waitForExist({ timeout: 10000 });
         await browser.switchFrame(payPalIframe);
         await this.PayPalBtn.waitForClickable({ timeout: 10000 });
         await this.PayPalBtn.click();
         await browser.switchToParentFrame();
    }

    async loginToPayPal (email, password) {
        const emailInput = await $('#email'); 
        const passwordInput = await $('#password');
        const nextButton = await $('#btnNext');
        const loginButton = await $('#btnLogin');

        await emailInput.setValue(email);
        await nextButton.click();
        await passwordInput.setValue(password);
        await loginButton.click();
    }

    async clickPayPalCheckoutBtn () {
        await (await this.PayPalCheckoutBtn).click();
    }
    
    async clickPayPalCancelBtn () {
        await (await this.PayPalCancelBtn).click();
    }

}
export default new CheckoutPage();
