const HCCrawler = require('headless-chrome-crawler');
const MongoClient = require('mongodb').MongoClient;
const _ = require('underscore');
const urlConstruct = (base) => _.range(3).map((url, idx) => ({
  browserCache: false,
  obeyRobotsTxt: false,
  timeout: 120000,
  url: `${base}?o=7&r=120&i=${idx}`,
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36',
  waitUntil: 'networkidle2'
}));
const crawl = async (URL) => {
    const crawler = await HCCrawler.launch({
      // headless: false,
      maxConcurrency: 2,
      evaluatePage: (async () => {
        await new Promise((resolve, reject) => {
            let totalHeight = 0
            let distance = 100
            let timer = setInterval(() => {
              let scrollHeight = document.body.scrollHeight
              window.scrollBy(0, distance)
              totalHeight += distance
              if(totalHeight >= scrollHeight){
                clearInterval(timer)
                resolve()
              }
            }, 20)
        })
        return {
            link: $('a.single-product').map(function(){return $(this).attr('href')}),
            name: $('div.product-detail-wrapper').map(function(){return $(this).attr('onclick').toString().split("'")[7]}),
            merk: $('div.product-detail-wrapper').map(function(){return $(this).attr('onclick').toString().split("'")[11]}),
            harga: $('div.product-detail-wrapper').map(function(){return Number($(this).attr('onclick').toString().split("'")[9])}),
            image: $('div.product-image .img-lazy-container img').map(function(){return $(this).attr('src')}),
            kategori: $('span.kategori-title strong').text().trim().toLowerCase(),
        } 
      }),
      // Function to be called with evaluated results from browsers
      onSuccess: (res => {
        delete res.result.link['length'];
        delete res.result.link['context'];
        delete res.result.link['prevObject'];
        delete res.result.name['length'];
        delete res.result.name['context'];
        delete res.result.name['prevObject'];
        delete res.result.merk['length'];
        delete res.result.merk['context'];
        delete res.result.merk['prevObject'];
        delete res.result.harga['length'];
        delete res.result.harga['context'];
        delete res.result.harga['prevObject'];
        delete res.result.image['length'];
        delete res.result.image['prevObject'];
        const links = Object.values(res.result.link);
        const images = Object.values(res.result.image);
        const name = Object.values(res.result.name);
        const harga = Object.values(res.result.harga);
        const kategori = Object.values(_.range(links.length).map(() => res.result.kategori));
        const data = _.zip(links, images, name, harga, kategori).map(zip => _.object(['link', 'image', 'product_name', 'harga', 'kategori'], zip));
        MongoClient.connect('mongodb://foo:bar@127.0.0.1:27017?ssl=false&authSource=admin', { useNewUrlParser: true })
          .then(client => client.db('crawler').collection('products').insertMany(data))
          .then((ins) => console.log(`inserted ${res.result.kategori} ${ins.insertedCount} items`))
          .catch(err => console.log(err));
      }),
    });
    // Queue requests
    await crawler.queue(urlConstruct(URL));
    await crawler.onIdle(); // Resolved when no queue is left
    await crawler.close(); // Close the crawler
    return 'ok';
};

// crawl('https://www.blibli.com/komputer/53270')
//   .then(res => console.log('done'));
  
module.exports.crawl = crawl;