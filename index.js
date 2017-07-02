'use strict'

const axios = require('axios')
const fs = require('fs')

const throttle = require('./utils/throttle')
const requestURL = 'http://us.wconcept.com/magebirdpopup.php'
let cookie = [/* if any cookie */]

async function findCoupon(url) {
  const response = await axios.get(requestURL, {
    params: {
      rand: Math.floor(Math.random() * 100000000 + 1),
      storeId: 1,
      previewId: 0,
      templateId: 0,
      nocache: 1,
      filterId: 7,
      popup_page_id: 3,
      baseUrl: 'http://us.wconcept.com/',
      url
    },
    headers: {
      Accept: '*/*',
      Host: 'us.wconcept.com',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.115 Safari/537.36',
      'X-Requested-With': 'XMLHttpRequest',
      Cookie: cookie
    }
  })
  const body = response.data

  // cookie = response.headers['set-cookie']

  const matchResult = /(mb_popups = [^\n]*\n)/.exec(body)
  if (!matchResult[1]) return null

  const popupJSON = matchResult[1].trim().replace(/^mb_popups =  /, '').replace(/;$/, '')
  if (popupJSON === '[]') return null

  const popup = JSON.parse(popupJSON)

  const coupon = {
    url,
    popup: JSON.parse(popupJSON)
  }

  console.log('**********************************')
  console.log(url)
  console.log(popupJSON)
  console.log('**********************************')

  return coupon
}

async function start() {
  try {
    const navURLs = JSON.parse(fs.readFileSync('./data/navURLs.json'))
    const pagesURLs = JSON.parse(fs.readFileSync('./data/pagesURLs.json'))
    const prodsURLs = JSON.parse(fs.readFileSync('./data/prodURLs.json'))
    console.log(`nav links: ${navURLs.length}`)
    console.log(`pages links: ${pagesURLs.length}`)
    console.log(`prods links: ${prodsURLs.length}`)

    const allURLs = Array.from(new Set([].concat(navURLs, pagesURLs, prodsURLs)))

    const results = await throttle(allURLs, 50, findCoupon, 500)
    const couponResults = results.filter(r => Boolean(r))
    console.log(`found coupons: ${couponResults.length}`)
    console.log(JSON.stringify(couponResults, null, 2))
  } catch (err) {
    console.error(err)
  }
}

start()
