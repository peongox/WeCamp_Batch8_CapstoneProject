import Page from '../pageobjects/page.js'

class RegisterPage extends Page {
    //define selectors
    get nameField () {
        return $('#name');
    }

    get emailField () {
        return $('#email');
    }

    get passField () {
        return $('#password');
    }

    get confirmPassField () {
        return $('#confirmPassword');
    }

    get registerBtn () {
        return $('//*[@id="root"]/main/div/div/div/div/form/button');
    }

    //define methods
    async register (name, email, pass, confirmPass) {
        await this.nameField.setValue(name);
        await this.emailField.setValue(email);
        await this.passField.setValue(pass);
        await this.confirmPassField.setValue(confirmPass);
        await this.registerBtn.click();
    }
    
    open () {
        return super.open('register');
    }
}

export default new RegisterPage();