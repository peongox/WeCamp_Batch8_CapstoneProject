class ordersAdmin {
    get orderTableRow () {return $$('.table-sm tbody tr')}

    async findFirstPaidOrder () {
        await browser.waitUntil(
            async () => (await $$('.table-sm tbody tr')).length > 0,
            {
                timeout: 5000,
                timeoutMsg: 'Expected at least 1 order row within 5s'
            }
        )
        const rows = await this.orderTableRow
        const rowLength = await rows.length
        for(let i = 0; i < rowLength; i++) {
            const paidStatus = await rows[i].$('td:nth-child(5)')
            const deliveryStatus = await rows[i].$('td:nth-child(6)')
            const paidDate = await paidStatus.getText()
            const deliveryDate = await deliveryStatus.getText()
            if (paidDate.trim() !== '' && deliveryDate.trim() == '') return i 
        }
        return -1
    }

    async viewFirstPaidOrder () {
        const indexPaidOrder = await this.findFirstPaidOrder()
        if(indexPaidOrder == -1) throw new Error('No paid order found')
        else {
            const rows = await this.orderTableRow
            const viewDetailsBtn = await rows[indexPaidOrder].$('td:nth-child(7) a')
            await viewDetailsBtn.click()
        } 
    }
}

export default new ordersAdmin ()