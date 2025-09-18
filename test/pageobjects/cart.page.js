class CartPage {
    // Get elements 
    get cartItems () {return $$('.col-md-8 .list-group-item .row')}
    get totalItems () {return $('.col-md-4 .list-group-item h2')}
    get totalValue () {return $('.col-md-4 .list-group-item')}
    get proceedButton () {return $('.btn-block')}
    get productDetails () {return $$('.col-md-8 .list-group-item .row div')}
    get cartNavBar () {return $('.nav-link span')}
    get qtyDropdown () {return $('.row .col-md-2 .form-control')}
    get bin () {return $('.row .col-md-2 button')}

    // Get elements when cart empty
    get cartEmptyAlert () {return $('.col-md-8 .alert-info')}
    get returnHomePage () {return $('.col-md-8 .alert-info a')}

    // Actions
    async clickProceed () {
        await this.proceedButton.click()
    }

    async removeItem () {
        await this.bin.click()
    }

    async clickReturnHome () {
        await this.returnHomePage.click()
    }

    async getItemDetails () {
        let items = await this.cartItems
        let details = [];

        for (let [index, row] of items.entries()) {
            const cols = await row.$$('div')

            const picture = await cols[0].$('img').getAttribute('src'); 
            const link = await cols[1].$('a').getAttribute('href')
            const name = await cols[1].getText()      
            const value = await $(cols[2]).getText()          
            
            details.push({
                picture,
                link,
                name,
                value,
            })
        }  
        return details
    }
}

export default new CartPage ()