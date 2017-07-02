# wconcept-coupon-crawler


<img width="425" alt="coupon" src="/wconcept-coupon.png">

This project is to crawl [wconcept](http://us.wconcept.com/), an online retailer built on Magento, to find coupons.

My girlfriend found wconcept was holding a special event:
```
Find hidden discount coupons thoughout our site by navigating through different categories and tabs!

The bigger the discount, the harder to find.
```

So I am "asked" to make this to crawl all its pages to find coupons.

## Run

Find coupons in all urls which are pre-crawled under `/data`
```
npm start
```
Re-crawl urls and save to `/data`
```
node crawlURLs.js
```

## License

MIT
