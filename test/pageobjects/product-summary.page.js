class ProductSummary {
    get qty () {return $$('.list-group-item .form-control')}
    get productName () {return $('.col-md-3 .list-group-item h3')}
    get addToCartbtn () {return $('.row .list-group-item .btn-block')}
    get productStatus () {return $$('.list-group-item .row div')[3]}

    async clickAddToCart () {
        await this.addToCartbtn.click()
    }
}

export default new ProductSummary()