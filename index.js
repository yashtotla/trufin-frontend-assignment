/**
 * 
 * @param {Array} urls 
 * @param {Number} maxNum 
 * @returns {Promise}
 */

function multiRequest(urls = [], maxNum = 1) {

    const len = urls.length;
    const res = new Array(len).fill(0);
    let sendCount = 0;
    let finishCount = 0;

    return new Promise((resolve, reject) => {

        while (sendCount < maxNum && sendCount < len) {
            next();
        }

        function next() {

            let current = sendCount++;
            if (finishCount >= len) {
                resolve(res);
                return;
            }
            if (current < len) {
                const url = urls[current];

                fetch(url).then(result => {
                    result.text().then(result => {
                        finishCount++;
                        res[current] = result;
                        if (current < len) {
                            next()
                        }
                    })
                }, err => {
                    finishCount++;
                    res[current] = err;
                    if (current < len) {
                        next()
                    }
                });
            }
        }
    });
}

let urls = new Array(10).fill("https://catfact.ninja/fact")

let limit = [10, 5, 2, 1]

limit.forEach((l, i) => {
    setTimeout(() => {
        console.time(`${l} parallel requests`)
        multiRequest(urls, l).then((data) => {
            console.log(data)
            console.timeEnd(`${l} parallel requests`)
        })
    }, i * 5000)
})
