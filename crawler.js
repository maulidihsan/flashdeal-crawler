const HCCrawler = require('headless-chrome-crawler');
const _ = require('underscore');
const moment = require('moment');

const URL = 'https://www.bukalapak.com/flash-deal';
const run = async () => {
    let response;
    const crawler = await HCCrawler.launch({
      // Function to be evaluated in browsers
      evaluatePage: (() => ({
        status: $('.u-txt--medium.u-fg--black').eq(0).text(),
        item: $('.c-card--flash-deal__ellipsis-2.u-txt--small.u-fg--black.u-mrgn-bottom--1').map(function(){return $(this).text()}),
        harga: $('.c-product-price__reduced.u-fg--red-brand').map(function(){return $(this).text()}),
        image: $('.c-card__img').map(function(){return $(this).attr('src')}),
        availability: $('.u-txt--tiny.u-fg--black').map(function(){return $(this).text()}),
        time: $('.u-txt--medium.u-fg--red-brand.u-txt--bold').text(),
        tes: $('.c-tab__link--secondary.u-txt--medium.u-txt--normal span').eq(2).text()
      })),
      // Function to be called with evaluated results from browsers
      onSuccess: (res => {
        delete res.result.item['length'];
        delete res.result.item['prevObject'];
        delete res.result.image['length'];
        delete res.result.image['prevObject'];
        delete res.result.harga['length'];
        delete res.result.harga['prevObject'];
        delete res.result.availability['length'];
        delete res.result.availability['prevObject'];
        
        const item = Object.values(res.result.item);
        const images = Object.values(res.result.image);
        const availability = Object.values(res.result.availability);

        let result;  
        if(!_.isEmpty(res.result.harga)) {
            const harga = Object.values(res.result.harga);
            result = _.zip(item, images, harga, availability).map(zip => _.object(['item', 'images', 'harga', 'stocks'], zip))
        } else {
            result = _.zip(item, images, availability).map(zip => _.object(['item', 'images', 'stocks'], zip))
        }
        const timer = res.result.time.split(':').map(x => x.trim());
        const timeleft = moment(Date.now()).add(Number(timer[0]), 'h').add(Number(timer[1]), 'm').add(Number(timer[2]), 's');
        response = result;
      }),
    });
    // Queue a request
    await crawler.queue(URL);
    await crawler.onIdle(); // Resolved when no queue is left
    await crawler.close(); // Close the crawler
    return response;
}

module.exports.run = run;