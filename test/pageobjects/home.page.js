class HomePage {
    get productLinks () {return $$('.row .col-xl-3 .card-body a')}

    async clickOnProduct (productNo) {
        await this.productLinks[productNo].click()
    }

    async getProductId (productNo) {
        const linkElement = await this.productLinks[productNo]
        const href = await linkElement.getAttribute('href')
        const id = href.split('/').pop()
        return id
    }
}

export default new HomePage ()