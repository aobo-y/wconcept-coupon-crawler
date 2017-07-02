'use strict'

module.exports = async function throttle(argsAry, throttleNum, handler, reportNumber) {
  let index = 0
  const results = []

  async function run(argsIndex) {
    const res = await handler(argsAry[argsIndex])
    results.push(res)

    if (reportNumber && index % reportNumber === 0) {
      console.log(`have done: ${index}`)
    }
    if (index < argsAry.length) {
      await run(index++)
    }
  }

  const promises = []
  for (let i = 0; i < throttleNum && i < argsAry.length; i++) {
    promises.push(run(index++))
  }

  await Promise.all(promises)

  return results
}
