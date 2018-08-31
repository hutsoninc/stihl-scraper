const fetchSitemap = require('./fetch-sitemap');
const fetchProducts = require('./fetch-products');
const scrapePage = require('./scrape-page');
const fs = require('fs');

const options = {
    sitemapUrl: 'https://hutsonmayfield.stihldealer.net/sitemap.xml',
    headers: {},
    input: './data/products.csv',
    output: './data/out.json'
}

async function run() {

    let productsArr = [];

    console.log('Fetching Sitemap...');
    const urls = await fetchSitemap(options);

    console.log('Fetching Products Input...');
    const products = await fetchProducts(options);

    console.log('Matching URLs...');
    for (let i = 0, len = urls.length; i < len; i++) {

        let url = urls[i];

        let urlArr = url.split('/').filter(str => str != "");

        let obj = products.find(product => (
            product.id.toLowerCase() == urlArr[urlArr.length - 1].toLowerCase()
        ));

        if (obj) {
            productsArr.push({
                ...obj,
                sourceUrl: url,
                category: urlArr[urlArr.length - 3].toLowerCase(),
                subcategory: urlArr[urlArr.length - 2].toLowerCase()
            });
        }
    }

    console.log('Checking for missing products...');
    checkMissing(products, productsArr);

    console.log('Scraping data...');
    productsArr = await scrapePages(productsArr);

    console.log('Writing output...')
    fs.writeFile(options.output, JSON.stringify(productsArr), err => {
        if(err) console.log(err);
        process.exit();
    });

}

function checkMissing(originalArr, newArr) {
    let missingArr = []
    if(originalArr.length === newArr.length) return;
    for(let i = 0, len = originalArr.length; i < len; i++) {
        let obj = newArr.find(product => (
            product.id.toLowerCase() == originalArr[i].id.toLowerCase()
        ));

        if(obj === undefined){
            missingArr.push(originalArr[i].id);
            console.log("Product missing: " + originalArr[i].id);
        }
    }
    return;
}

async function scrapePages(products) {
    let resultArr = [];
    for(product of products) {
        result = await scrapePage(product);
        if(result) {
            resultArr.push(result);
        }
    }
    return resultArr;
}

run();