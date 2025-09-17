import { expect, browser, $, $$ } from '@wdio/globals';
import axios from 'axios'
import LoginPage from "../pageobjects/login.page.js";
import loginTestData from '../data/loginTestData.json' assert {type: "json"};
import products from '../data/products.json' assert {type: "json"};
import HomePage from '../pageobjects/home.page.js';
import ProductSummary from '../pageobjects/product-summary.page.js';
import CartPage from '../pageobjects/cart.page.js';
import navComp from '../pageobjects/components/nav.comp.js';
import homePage from '../pageobjects/home.page.js';

describe ('Test place an order', () => {
    // Login
    before(async function () {
        const {email, password} = loginTestData[0]
        await LoginPage.open();
        await LoginPage.login(email, password)

        await expect(browser).toHaveUrl('http://localhost:3000/')
    })

    it ('Should add product to cart successfully', async () => {
        // click product
        await HomePage.productLinks[0].click() // 1 product

        // check layout product summary
        await expect(browser).toHaveUrl('http://localhost:3000/product/68b01890b91374502e2c79e6')
        await expect(ProductSummary.productName).toBeDisplayed()
        await expect(ProductSummary.productName).toHaveText('Airpods Wireless Bluetooth Headphones')

        // add to cart
        await ProductSummary.clickAddToCart()

        // check cart count nav bar
        await expect(CartPage.cartNavBar).toHaveText('1')

        // check layout cart 
        const ItemDetails = await CartPage.getItemDetails()
        await expect(browser).toHaveUrl('http://localhost:3000/cart')
        await expect(CartPage.cartItems).toBeElementsArrayOfSize(1)
        await expect(ItemDetails[0].link).toBe('/product/68b01890b91374502e2c79e6')
        await expect(ItemDetails[0].name).toBe('Airpods Wireless Bluetooth Headphones')
        await expect(ItemDetails[0].value).toBe("$89.99")
    })

    for (let i = 0; i < products.length; i++) {
        const stockValue = Object.values(products[i])[0]

        it(`Should block checkout when stock is ${stockValue}`, async () => {
            // update stock value via api
            const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGIwMTg5MGI5MTM3NDUwMmUyYzc5ZTIiLCJpYXQiOjE3NTgwNDUwMDAsImV4cCI6MTc2MDYzNzAwMH0.DVqs2_RQMsCZASvLucx0cCgybRcf_4aF9gEax5SrTKE';
            const payload = {   
                "productId": "68b01890b91374502e2c79e7",
                "name": "iPhone 13 Pro 256GB Memory",
                "price": 599.99,
                "image": "/images/phone.jpg",
                "brand": "Apple",
                "category": "Electronics",
                "description": "Introducing the iPhone 13 Pro. A transformative triple-camera system that adds tons of capability without complexity. An unprecedented leap in battery life",
                "countInStock": stockValue
            }       

            const response = await axios.put(
                'http://localhost:3000/api/products/68b01890b91374502e2c79e7',
                payload,
                {
                    headers: {
                        'Accept': '*/*',
                        'Accept-Language': 'en-US,en;q=0.9,vi;q=0.8',
                        'Connection': 'keep-alive',
                        'DNT': '1',
                        'Origin': 'http://localhost:3000',
                        'Referer': 'http://localhost:3000/admin/product/68b01890b91374502e2c79e7/edit',
                        'Sec-Fetch-Dest': 'empty',
                        'Sec-Fetch-Mode': 'cors',
                        'Sec-Fetch-Site': 'same-origin',
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
                        'content-type': 'application/json',
                        'sec-ch-ua': '"Not)A;Brand";v="8", "Chromium";v="138", "Google Chrome";v="138"',
                        'sec-ch-ua-mobile': '?0',
                        'sec-ch-ua-platform': '"Windows"',
                        'Cookie': `jwt=${token}`
                    }
                }
            )

            await expect(response.status).toBe(200)
            await expect(response.data.countInStock).toBe(stockValue)

            // click product
            await HomePage.productLinks[1].waitForDisplayed({ timeout: 5000 })
            await HomePage.productLinks[1].click()
            
            // check layout product summary 
            await expect(browser).toHaveUrl('http://localhost:3000/product/68b01890b91374502e2c79e7')
            await expect(ProductSummary.productName).toBeDisplayed()
            await expect(ProductSummary.productName).toHaveText('iPhone 13 Pro 256GB Memory')
            await expect(ProductSummary.productStatus).toHaveText('Out Of Stock')

            // check add-to-cart btn disabled
            await expect (ProductSummary.addToCartbtn).toBeDisabled()
        })
    }

    it('Should allow changing product quantity in cart', async () => {
        // click product
        await homePage.productLinks[0].click()

        // add to cart
        await ProductSummary.clickAddToCart()

        // get qty
        const initialQty = await CartPage.qtyDropdown.getValue()
        await CartPage.qtyDropdown.selectByAttribute('value', 5)
        const newQty = await CartPage.qtyDropdown.getValue()
        await expect (newQty).not.toEqual(initialQty)
    })

    // return home
    afterEach(async function () {
        await browser.url('http://localhost:3000/cart')
        if ((await CartPage.cartItems).length > 0) {
            await CartPage.removeItem()
        }
        await browser.url('http://localhost:3000')
        await expect(browser).toHaveUrl('http://localhost:3000/')
    })

    // logout
    after(async function () {
        await navComp.logOutBtn.click()

        await expect(browser).toHaveUrl('http://localhost:3000/login')
    })
})