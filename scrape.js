import * as cheerio from 'cheerio';
import fetch from 'node-fetch';
 
async function getWastePrice() {
    
    try {
        const response = await fetch('https://www.ทําลายเอกสารฟรี.com/price');
        const body = await response.text();
        const $ = cheerio.load(body);

        const wrapper = $('td[data-label="ประเภท"]');
        console.log(wrapper.length);

        


    } catch (error) {
        console.log(error);
    }


}

getWastePrice();