const fs = require('fs');
const csv = require('csvtojson');

async function fetchProducts(options) {
    let { input } = options;
    let products, inputData;
    inputData = await fs.readFileSync(input, 'utf8');
    products = await csv().fromString(inputData);
    return products;
}

module.exports = fetchProducts;