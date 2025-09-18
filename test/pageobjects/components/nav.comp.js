class NavComponent {
    //define selectors
    get cartBtn () {
        return $('//*[@id="basic-navbar-nav"]/div/a');
    }

    ////before sign in
    get signInBtn () {
        return $('#basic-navbar-nav > div > a:nth-child(3)');
    }

    ////after sign in
    get dropDownMenu () {
        return $('#username');
    }

    get profileBtn () {
        this.dropDownMenu.click();
        return $('//*[@id="basic-navbar-nav"]/div/div/div/a[1]');
    }

    get logOutBtn () {
        this.dropDownMenu.click();
        return $('//*[@id="basic-navbar-nav"]/div/div/div/a[2]');
    }

    //define methods (after login/register)
    async logout () {
        await this.logOutBtn.click();
    }
}

export default new NavComponent();