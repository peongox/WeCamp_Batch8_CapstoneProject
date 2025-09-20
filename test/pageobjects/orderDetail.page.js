import { $, expect } from '@wdio/globals';
import Page from './page';

class orderDetailPage extends Page {
    get MarkasDlvrdBtn () {
        return $('//button[contains(., "Mark As Delivered")]');
    }
    get DeliveryStatus () {
        return $('/html/body/div/main/div/div/div[1]/div/div[1]/div');
    }

    async clickMarkasDlvrdBtn () {
        await (await this.MarkasDlvrdBtn).click()
    }
}
export default new orderDetailPage();