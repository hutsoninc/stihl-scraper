const puppeteer = require('puppeteer');

async function scrapePage(product) {

    const browser = await puppeteer.launch({
        headless: true,
        ignoreHTTPSErrors: true
    });
    const page = await browser.newPage();

    let details = {};

    try {

        await page.goto(product.sourceUrl);

        // Wait for page content to load
        await page.waitForSelector('#product-details', { timeout: 0 });

        // Get product title
        details.title = await page.evaluate(() => {
            return document.getElementById('productNameContainer').querySelector('span[itemprop=name]').innerText.trim();
        });

        // Get product description
        if (await page.$('#read-more') !== null) {
            details.description = await page.evaluate(() => {
                return document.getElementById('read-more').querySelector('.modal-body').innerText.trim();
            });
        } else {
            details.description = '';
        }

        // Get image url
        details.image = await page.evaluate(() => {
            return document.getElementById('product-thumb-container').querySelector('img').src;
        });

        // Get product price
        details.price = await page.evaluate(() => {
            return document.getElementById('product-price').innerText.trim();
        });

        // Get specs
        if (await page.$('.specs-table-tab') !== null) {
            details.specs = await page.evaluate(() => {
                let dataTableBody = document.querySelector('table.specs-table-tab tbody');
                let rows = dataTableBody.querySelectorAll('tr');

                let result = [];

                for (let i = 0, len = rows.length; i < len; i++) {
                    let cols = rows[i].querySelectorAll('td');
                    result.push({
                        name: cols[0].innerText.trim(),
                        description: cols[1].innerText.trim()
                    });
                }

                return result;
            });
        } else {
            details.specs = []
        }

        await browser.close();

        console.log('Scraped ' + product.id);

        return {
            ...details,
            ...product
        }

    } catch (error) {
        console.log("Error " + product.id);
        console.log(error);
        browser.close();
    }
}

module.exports = scrapePage;