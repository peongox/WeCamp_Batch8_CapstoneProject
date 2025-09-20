function getRandomInt(max) {
    return Math.floor(Math.random() * max);
};

browser.addCommand('login', async function (email, password) {
    await this.url('http://localhost:3000/login');

    const emailInput = await $('#email'); 
    const passwordInput = await $('#password');
    const loginButton = await $('//*[@id="root"]/main/div/div/div/div/form/button');

    await emailInput.setValue(email);
    await passwordInput.setValue(password);
    await loginButton.click();
});

browser.addCommand('fillShippingForm', async function (address, city, postalCode, country) {
    await this.url('http://localhost:3000/shipping');

    const addressInput = await $('#address');
    const cityInput = await $('#city');
    const postalCodeInput = await $('#postalCode');
    const countryInput = await $('#country');

    await addressInput.setValue(address);
    await cityInput.setValue(city);
    await postalCodeInput.setValue(postalCode);
    await countryInput.setValue(country);
});

browser.addCommand('addRandomProducts', async function () {
    const numProductsToAdd = getRandomInt(3) + 1; 
    const productCards = await $$('div.row div[class="col-xl-3 col-lg-4 col-md-6 col-sm-12"]');

    if (productCards.length === 0) {
        throw new Error('No products found on the page.');
    }

    console.log('🥵🥵🥵', `Adding ${numProductsToAdd} random products to the cart..`);

    for (let i = 0; i < numProductsToAdd; i++) {
        const randomIndex = getRandomInt(productCards.length);

        const randomProductLink = await productCards[randomIndex].$('a');

        await randomProductLink.click();
        
        const addToCartButton = await $('//button[text()="Add To Cart"]'); 
        await addToCartButton.click();

        await $('img[alt="ProShop"]').click();
        await $('div.row').waitForExist();
    }
});


