/**
 *
 * @param {Array} urls
 * @param {Number} maxNum
 * @returns {Promise}
 */

export default function multiRequest(urls = [], maxNum = 1) {
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

        fetch(url).then(
          (result) => {
            result.text().then((result) => {
              finishCount++;
              res[current] = result;
              if (current < len) {
                next();
              }
            });
          },
          (err) => {
            finishCount++;
            res[current] = err;
            if (current < len) {
              next();
            }
          }
        );
      }
    }
  });
}

/** 
- How would you test the solution?
    I would use jest to test the solution and I would mock the "fetch" function's implementation
  to use a setTimeout with 500ms (for example) and to resolve the promise after that time passes.
  I would test that if I call the function with 5 urls and concurrency = 2, at first, my mocked fetch
  function has only been called twice, and after waiting more than 500ms, it would be called 4 times.

    I would also test that the code doesn't throw any error if concurrency is greater than the length
  of the urls array.

- Is the solution able to cover any possible cases?
    It takes into consideration the case when concurrency is greater than the number of urls
  and the case when one of the requests fails.


- Is it optimal? 
    I believe it is optimal because each request starts another request when it is finished
  (vs waiting for *concurrency* number of requests to finish before starting the next
  *concurrency* number of requests)
*/

// const startRequest = async (urls, responses) => {
//   const url = urls.pop();

//   try {
//     const res = await fetch(url);
//     const text = await res.text();
//     responses.push(text);
//   } catch {}

//   if (urls.length) {
//     await startRequest(urls, responses);
//   }
// };

// export async function runInParallel(urls, concurrency) {
//   const responses = [];
//   const req = [];

//   let maxConcurrency = Math.min(urls.length, concurrency);
//   for (let i = 0; i < maxConcurrency; i++) {
//     req.push(startRequest(urls, responses));
//   }

//   await Promise.all(req);
//   return responses;
// }
