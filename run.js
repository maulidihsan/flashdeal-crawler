const crawler = require('./service/crawler');

Promise.all([
    crawler.crawl('https://www.blibli.com/beli--handphone/54593'),
    crawler.crawl('https://www.blibli.com/komputer/53270'),
    crawler.crawl('https://www.blibli.com/make-up/53203'),
    crawler.crawl('https://www.blibli.com/pakaian-wanita/54912')
])
.then(() => process.exit(0))
.catch(err => console.error(err.message));