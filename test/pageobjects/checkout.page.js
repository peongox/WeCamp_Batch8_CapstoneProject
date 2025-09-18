class CheckoutPage {
    get title () {return $('.col-md-6 h1')}
    get breadcrumbs () {return $$('.justify-content-center a')}
    get inputShipping () {return $$('.col-md-6 form input')}
    get continueBtn () {return $('.col-md-6 button')}

    async isFormEmpty (formSelector) {
        const inputField = await $$(formSelector + ' input')
        for (let i = 0; i < inputField.length; i++) {
            if ((await inputField[i].getValue()) !== '') return false;
        }
        return true
    }

    async fillForm (formSelector, data) {
        const inputField = await $$(formSelector + ' input') // get array of input elements

        for (const field of inputField)  {
            const nameAttr = await field.getAttribute('id') //get name of attribute (country)
            if (nameAttr && data[nameAttr] !== undefined) {
                await field.setValue(data[nameAttr])
            }
        }
    }

    async emptyForm (formSelector) {
        const inputField = await $$(formSelector + ' input') // get array of input elements

        for (const field of inputField)  {
             await field.setValue("")
        }
    }

    async toNextStep () {
        await this.continueBtn.click()
    }
}

export default new CheckoutPage()