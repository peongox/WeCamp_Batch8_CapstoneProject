class NavComponent {
    //define selectors
    get cartBtn () {
        return $('//*[@id="basic-navbar-nav"]/div/a');
    }

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
}

export default new NavComponent();