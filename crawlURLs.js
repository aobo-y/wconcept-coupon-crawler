'use strict'

const axios = require('axios')
const cheerio = require('cheerio')
const fs = require('fs')
const _ = require('lodash')

const throttle = require('./utils/throttle')

const baseURL = 'http://us.wconcept.com';
const startURL = '/new-in.html'
const config = {
  baseURL
}

async function crawl(url, selector, path) {
  const response = await axios.get(url, config)
  const contents = response.data
  const $ = cheerio.load(contents)

  const elements = $(selector)

  const results = [];
  elements.each((index, element) => {
    results.push(_.get(element, path))
  })

  return results
}

async function crawlNavURLs(url) {
  return await crawl(url, '#categories_nav_left a', 'attribs.href')
}

async function crawlPageURLs(url) {
  const amountsTexts = await crawl(url, 'p.amount', 'children.0.data')

  if (!amountsTexts[0]) return []

  const amountsText = amountsTexts[0].trim().replace('Total ', '')

  const pages = Math.ceil(Number(amountsText)/12)
  const results = []

  for (let i = 1; i <= pages; i++) {
    results.push(`${url}?p=${i}`)
  }
  return results
}

async function crawlProductsURLs(url) {
  return await crawl(url, '.products-grid .product-name > a', 'attribs.href')
}

async function start() {
  try {
    const navURLs = await crawlNavURLs(startURL)
    console.log(`nav links: ${navURLs.length}`)
    fs.writeFileSync('./data/navURLs.json', JSON.stringify(navURLs, null, 2))

    const results = await throttle(navURLs, 30, crawlPageURLs, 50)
    const pagesURLs = Array.prototype.concat.apply([], results)
    console.log(`pages links: ${pagesURLs.length}`)
    fs.writeFileSync('./data/pagesURLs.json', JSON.stringify(pagesURLs, null, 2))

    // const navURLs = JSON.parse(fs.readFileSync('./data/navURLs.json'))
    // const allPagesURLs = JSON.parse(fs.readFileSync('./data/pagesURLs.json'))
    // console.log(`nav links: ${navURLs.length}`)
    // console.log(`pages links: ${allPagesURLs.length}`)

    const prodResults = await throttle(pagesURLs, 45, crawlProductsURLs, 500)
    const prodURLs = Array.prototype.concat.apply([], prodResults)
    console.log(`products links: ${prodURLs.length}`)

    const distinctProdURLs = Array.from(new Set(prodURLs))
    console.log(`distinct products links: ${distinctProdURLs.length}`)

    fs.writeFileSync('./data/prodURLs.json', JSON.stringify(distinctProdURLs, null, 2))
  } catch (err) {
    console.error(err)
  }
}

start()
