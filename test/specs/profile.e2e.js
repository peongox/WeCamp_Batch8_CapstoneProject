import ProfilePage from '../pageobjects/profile.page.js';
import data from '../data/profileEditData.json';
import {expect, browser, $, $$ } from '@wdio/globals';
import LoginPage from "../pageobjects/login.page.js";
import loginTestData from '../data/loginTestData.json' assert {type: "json"};
import shippingData from '../data/shipping data.json' assert {type: "json"};
import HomePage from '../pageobjects/home.page.js';
import ProductSummary from '../pageobjects/product-summary.page.js';
import CartPage from '../pageobjects/cart.page.js';
import navComp from '../pageobjects/components/nav.comp.js';
import CheckoutPage from '../pageobjects/checkout.page.js';

describe ('View order history', async () => {

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

    after(async () => {
        await navComp.logOutBtn.click()
        await expect(browser).toHaveUrl('http://localhost:3000/login')
    })
})

const updateBtnSel = '#root > main > div > div > div.col-md-3 > form > button';
const successText  = 'Profile updated successfully';

describe('Profile Edit - simple style', () => {

  beforeEach(async () => {
    await ProfilePage.goToProfilePage();
  });

  it('Update both name and email (valid)', async () => {
    await ProfilePage.clearAndType(ProfilePage.inputName, data[0].name);
    await ProfilePage.clearAndType(ProfilePage.inputEmail, data[0].email);

    const toastText = await ProfilePage.clickUpdateExpectToastText();
    await ProfilePage.expectMsgIncludesOneOf(toastText, [successText]);

    const usernameLink = await $('#username');
    await expect(usernameLink).toHaveText(data[0].name);
  });

  it('Update only name (valid)', async () => {
    await ProfilePage.clearAndType(ProfilePage.inputName, data[1].name);
    const toastText = await ProfilePage.clickUpdateExpectToastText();
    await ProfilePage.expectMsgIncludesOneOf(toastText, [successText]);

    const usernameLink = await $('#username');
    await expect(usernameLink).toHaveText(data[1].name);
  });

  it('Update only email (valid)', async () => {
    await ProfilePage.clearAndType(ProfilePage.inputEmail, data[2].email);
    const toastText = await ProfilePage.clickUpdateExpectToastText();
    await ProfilePage.expectMsgIncludesOneOf(toastText, [successText]);
  });

  it('Valid email with allowed chars + MLD', async () => {
    await ProfilePage.clearAndType(ProfilePage.inputEmail, data[3].email);
    const toastText = await ProfilePage.clickUpdateExpectToastText();
    await ProfilePage.expectMsgIncludesOneOf(toastText, [successText]);
  });

  it('Trim spaces in name & email', async () => {
    const rawName = data[4].name;
    const rawEmail = data[4].email;
    const expName = rawName.trim();
    const expEmail = rawEmail.trim();

    await ProfilePage.clearAndType(ProfilePage.inputName, rawName);
    await ProfilePage.clearAndType(ProfilePage.inputEmail, rawEmail);

    const toastText = await ProfilePage.clickUpdateExpectToastText();
    await ProfilePage.expectMsgIncludesOneOf(toastText, [successText]);

    await expect(await ProfilePage.inputName.getValue()).toBe(expName);
    const usernameLink = await $('#username');
    await expect(usernameLink).toHaveText(expName);
    await expect(await ProfilePage.inputEmail.getValue()).toBe(expEmail);
  });

  it('Accept uppercase email', async () => {
    await ProfilePage.clearAndType(ProfilePage.inputEmail, data[5].email);
    const toastText = await ProfilePage.clickUpdateExpectToastText();
    await ProfilePage.expectMsgIncludesOneOf(toastText, [successText]);
  });

  it('Click update with no changes → error toast appears', async () => {
    await ProfilePage.clickUpdate();
    const toast = await ProfilePage.waitForToastText({ timeout: 5000 });
    await expect(!!toast).toBe(true);
    await expect(toast.toLowerCase()).toContain('unsuccessfully');
  });

  it("Invalid email: missing '@'", async () => {
    await ProfilePage.clearAndType(ProfilePage.inputEmail, data[7].email);
    await ProfilePage.clickUpdate();
    const msg = await ProfilePage.getValidationMessage('#email');
    await expect(msg).toContain("include an '@'");
  });

  it("Invalid email: multiple '@'", async () => {
    await ProfilePage.clearAndType(ProfilePage.inputEmail, data[8].email);
    await ProfilePage.clickUpdate();
    const msg = await ProfilePage.getValidationMessage('#email');
    await expect(msg).toContain("should not contain the symbol '@'");
  });

  it("Invalid email: nothing after '@'", async () => {
    await ProfilePage.clearAndType(ProfilePage.inputEmail, data[9].email);
    await ProfilePage.clickUpdate();
    const msg = await ProfilePage.getValidationMessage('#email');
    await expect(msg).toContain("Please enter a part following '@'");
  });

  it("Invalid email: nothing before '@'", async () => {
    await ProfilePage.clearAndType(ProfilePage.inputEmail, data[10].email);
    await ProfilePage.clickUpdate();
    const msg = await ProfilePage.getValidationMessage('#email');
    await expect(msg).toContain("Please enter a part followed by '@'");
  });

  it("Invalid email: missing dot", async () => {
    await ProfilePage.clearAndType(ProfilePage.inputEmail, data[11].email);
    await ProfilePage.clickUpdate();
    const msg = await ProfilePage.getValidationMessage('#email');
    await ProfilePage.expectMsgIncludesOneOf(msg, ["wrong position", "'.'", "invalid email"]);
  });

  it('Invalid email: domain starts with dot', async () => {
  await ProfilePage.clearAndType(ProfilePage.inputEmail, data[12].email);
  await ProfilePage.clickUpdate();
  await expect(await ProfilePage.getValidationMessage('#email'))
    .toMatch(/start with '\.'|wrong position|invalid email/i);
  });


  it("Invalid email: domain ends with dot", async () => {
    await ProfilePage.clearAndType(ProfilePage.inputEmail, data[13].email);
    await ProfilePage.clickUpdate();
    const msg = await ProfilePage.getValidationMessage('#email');
    await ProfilePage.expectMsgIncludesOneOf(msg, ["end with '.'", "wrong position", "invalid email"]);
  });

  it("Invalid email: spaces in email", async () => {
    await ProfilePage.clearAndType(ProfilePage.inputEmail, data[14].email);
    await ProfilePage.clickUpdate();
    const msg = await ProfilePage.getValidationMessage('#email');
    await ProfilePage.expectMsgIncludesOneOf(msg, [
      "should not contain the symbol ' '",
      "should not contain spaces",
      "spaces"
    ]);
  });

  it('Empty name', async () => {
    await ProfilePage.clearAndType(ProfilePage.inputEmail, data[15].email);
    await ProfilePage.clickUpdate();
    const msg = await ProfilePage.getValidationMessage('#email');
    await expect(msg.toLowerCase()).toContain('required');
  });

  it('Empty email', async () => {
    await ProfilePage.clearAndType(ProfilePage.inputName, data[16].name);
    await ProfilePage.clickUpdate();
    const msg = await ProfilePage.getValidationMessage('#email');
    await expect(msg.toLowerCase()).toContain('required');
  });

  it('Whitespace-only name', async () => {
    await ProfilePage.clearAndType(ProfilePage.inputName, data[17].name);
    await ProfilePage.clearAndType(ProfilePage.inputEmail, data[17].email);
    await ProfilePage.clickUpdate();
    const msgName = await ProfilePage.getValidationMessage(ProfilePage.inputName);
    const msgEmail = await ProfilePage.getValidationMessage('#email');
    await expect(`${msgName} ${msgEmail}`.toLowerCase()).toContain('required');
  });

  it('Whitespace-only email', async () => {
    await ProfilePage.clearAndType(ProfilePage.inputName, data[18].name);
    await ProfilePage.clearAndType(ProfilePage.inputEmail, data[18].email);
    await ProfilePage.clickUpdate();
    const msg = await ProfilePage.getValidationMessage('#email');
    await expect(msg.toLowerCase()).toContain('required');
  });
});