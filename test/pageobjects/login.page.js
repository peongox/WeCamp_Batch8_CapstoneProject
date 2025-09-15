import Page from "../pageobjects/page.js";

class LoginPage extends Page {
    //define selectors
    get emailField() {
        return $("#email");
    }

    get passwordField() {
        return $("#password");
    }

    get signInBtn() {
        return $('//*[@id="root"]/main/div/div/div/div/form/button');
    }

    get errorMsg() {
        return $('.Toastify__toast-container--top-right');
    }

    //define methods
    async login(email, password) {
        await this.emailField.setValue(email);
        await this.passwordField.setValue(password);
        await this.signInBtn.click();
    }

    async logout() {
        await this.NavComponent.logOutBtn.click();
    }

    open() {
        return super.open("login");
        //return Page.prototype.open.call('login'); ---another way to call the class directly---
        //return Page.open('login'); ---error due to calling a class, not an instance---
    }
}

export default new LoginPage();
