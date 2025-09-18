class ProfilePage {
    get orderHeaders () {return $$('.table-sm thead tr th')}
    get orderDetailsEle () {return $$('.table-sm tbody tr')}
    get orderId () {return $('.table-sm tbody tr td')}
    get detailsBtn () {return $('.table-sm tbody a')}

    async viewOrderDetails () {
        await this.detailsBtn.click()
    }
    
    async getOrderDetails () {
        let orderRows = await this.orderDetailsEle
        const orderDetails = []

        for (const row of orderRows) {
            const cols = await row.$$('td')

            const id = await cols[0].getText()
            const date = await cols[1].getText() 
            const total = await cols[2].getText() 
            const link = await cols[5].$('a').getAttribute('href')          

            orderDetails.push({
                id,
                date,
                total,
                link
            })
        }
        return orderDetails
    }
}

export default new ProfilePage()