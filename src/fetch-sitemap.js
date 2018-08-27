const fetch = require('fetch-retry');
const xml2js = require('xml2js');

async function fetchSitemap(options) {
    let { sitemapUrl, headers } = options;
    let data = await fetch(sitemapUrl, {
        method: 'GET',
        headers
    });
    data = await data.text();
    data = await parseString(data);
    data = getUrls(data);
    return data;
}

function parseString(str) {
    return new Promise((resolve, reject) => {
        xml2js.parseString(str, (err, res) => {
            if (err) return reject(err);
            resolve(res);
        });
    });
}

function getUrls(data) {
    let arr = [];
    for (let i = 0, len = data.urlset.url.length; i < len; i++) {
        arr.push(data.urlset.url[i].loc[0]);
    }
    return arr;
}

module.exports = fetchSitemap;