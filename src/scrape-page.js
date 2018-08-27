const puppeteer = require('puppeteer');

async function scrapePage(product) {

    const browser = await puppeteer.launch({
        headless: false,
        ignoreHTTPSErrors: true
    });
    const page = await browser.newPage();

    let details = {};

    try {

        await page.goto(product.sourceUrl);

        // Wait for page content to load
        await page.waitForSelector('.page_content', { timeout: 0 });
        
        // Get product title
        details.title = await page.evaluate(() => {
            return document.querySelector('.page_content').querySelector('h1').innerText.trim();
        });

        // Get image url
        await page.waitForSelector('.detail_image', { timeout: 0 });
        details.image = await page.evaluate(() => {
            return document.querySelector('.detail_image').src;
        });

        // Get specs
        await page.waitForSelector('.technical_data', { timeout: 0 });
        details.specs = await page.evaluate(() => {
            let dataTable = document.querySelector('.technical_data');
            let headers = dataTable.querySelectorAll('.col1');
            let info = dataTable.querySelectorAll('.col2');

            let result = [];

            for (let i = 0, len = headers.length; i < len; i++) {
                result.push({
                    name: headers[i].innerText.trim(),
                    description: info[i].innerText.trim()
                });
            }

            return result;
        });

        await browser.close();

        return {
            ...details,
            ...product
        }

    } catch (error) {
        console.log("ERROR - Product: " + JSON.stringify(product) + " - Error: " + error);
        browser.close();
    }
}

module.exports = scrapePage;