class CheckoutPage {
    get title () {return $('.col-md-6 h1')}
    get breadcrumbs () {return $$('.justify-content-center a')}
    get shippingForm () {return $('.col-md-6 form')}
    get inputShipping () {return $$('.col-md-6 form input')}
    get continueBtn () {return $('.col-md-6 button')}
    get placeOrderBtn () {return $('.btn-block')}

    async isFormEmpty (formElement) {
        const inputField = await formElement.$$('input')
        for (let i = 0; i < inputField.length; i++) {
            if ((await inputField[i].getValue()) !== '') return false;
        }
        return true
    }

    async fillForm (formElement, data) {
        const inputField = await formElement.$$('input') 

        for (const field of inputField)  {
            const nameAttr = await field.getAttribute('id') //get name of attribute (country)
            if (nameAttr && data[nameAttr] !== undefined) {
                await field.setValue(data[nameAttr])
            }
        }
    }

    async emptyForm (formElement) {
        const inputField = await formElement.$$('input') 

        for (const field of inputField)  {
             await field.setValue("")
        }
    }

    async toNextStep () {
        await this.continueBtn.click()
    }

    async placeOrder() {
        await this.placeOrderBtn.click()
    }
} 

export default new CheckoutPage()