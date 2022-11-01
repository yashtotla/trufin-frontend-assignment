/**
 * 
 * @param {Array} urls 
 * @param {Number} maxNum 
 * @returns {Promise}
 */

// function multiRequest(urls = [], maxNum = 1) {

//     const len = urls.length;
//     const res = new Array(len).fill(0);
//     let sendCount = 0;
//     let finishCount = 0;

//     return new Promise((resolve, reject) => {

//         while (sendCount < maxNum && sendCount < len) {
//             next();
//         }

//         function next() {

//             let current = sendCount++;
//             if (finishCount >= len) {
//                 resolve(res);
//                 return;
//             }
//             if (current < len) {
//                 const url = urls[current];

//                 fetch(url).then(result => {
//                     result.text().then(result => {
//                         finishCount++;
//                         res[current] = result;
//                         if (current < len) {
//                             next()
//                         }
//                     })
//                 }, err => {
//                     finishCount++;
//                     res[current] = err;
//                     if (current < len) {
//                         next()
//                     }
//                 });
//             }
//         }
//     });
// }

/**
 * Fetches multiple text resources in parallel
 * @param urls The array of URLs to fetch from
 * @param concurrency An optional limit to the number of concurrent fetches
 * @returns An array of text bodies from the response to each respective fetch
 */
async function runInParallel (urls, concurrency) {
    const results = []

    const batchSize = concurrency ?? urls.length
    if (!Number.isInteger(batchSize)) throw new Error('Error: attempted to run a parallel fetch with a non-integer batch size')
    if (batchSize <= 0) throw new Error('Error: attempted to run a parallel fetch with a non-positive batch size')

    let requestsMade = 0
    while(requestsMade < urls.length) {
        const batch = urls
            .slice(requestsMade, Math.min(requestsMade + batchSize, urls.length))
            .map(url => fetch(url).then(response => response.text()))

        try {
            const batchResults = await Promise.all(batch)
            results.concat(batchResults)
            requestsMade += batch.length
        } catch {
            throw new Error('Error: batch fetch failed')
        }
    }

    return results
}


let urls = new Array(10).fill("https://catfact.ninja/fact")

let limit = [10, 5, 2, 1]

limit.forEach((l, i) => {
    setTimeout(() => {
        console.time(`${l} parallel requests`)
        runInParallel(urls, l).then((data) => {
            console.log(data)
            console.timeEnd(`${l} parallel requests`)
        })
    }, i * 5000)
})
