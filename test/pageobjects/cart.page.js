class CartPage {
    // Get elements 
    get cartItems () {return $$('.col-md-8 .list-group-item .row')}
    get totalItems () {return $('.col-md-4 .list-group-item h2')}
    get totalValue () {return $('.col-md-4 .list-group-item')}
    get proceedButton () {return $('.btn-block')}
    get productDetails () {return $$('.col-md-8 .list-group-item .row div')}

    // Get elements when cart empty
    get cartEmptyAlert () {return $('.col-md-8 .alert-info')}
    get returnHomePage () {return $('.col-md-8 .alert-info a')}

    // Actions
    async clickProceed () {
        await this.proceedButton.click()
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
            const name = await cols[1].getText()      
            const qty = await cols[2].getText()
            const value = await cols[3].getText()
            const bin = await cols[4]            
            
            details.push[{
                picture,
                name,
                qty,
                value,
                bin,
            }]
        }  
    }
}

export default CartPage