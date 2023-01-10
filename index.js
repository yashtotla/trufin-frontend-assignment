/**
 *
 * @param {Array} urls
 * @param {Number} maxNum
 * @returns {Promise}
 */

// function multiRequest(urls = [], maxNum = 1) {
//   const len = urls.length;
//   const res = new Array(len).fill(0);
//   let sendCount = 0;
//   let finishCount = 0;

//   return new Promise((resolve, reject) => {
//     while (sendCount < maxNum && sendCount < len) {
//       next();
//     }

//     function next() {
//       let current = sendCount++;
//       if (finishCount >= len) {
//         resolve(res);
//         return;
//       }
//       if (current < len) {
//         const url = urls[current];

//         fetch(url).then(
//           (result) => {
//             result.text().then((result) => {
//               finishCount++;
//               res[current] = result;
//               if (current < len) {
//                 next();
//               }
//             });
//           },
//           (err) => {
//             finishCount++;
//             res[current] = err;
//             if (current < len) {
//               next();
//             }
//           }
//         );
//       }
//     }
//   });
// }

// async function runInParallel(urls, concurrency) {
//   return new Promise((resolve, reject) => {
//     const resData = [];
//     const chunks = sliceIntoChunks(urls, concurrency);
//     for (let i = 0; i < chunks.length; i++) {
//       (async () => {
//         await new Promise((childResolve, childReject) => {
//           for (let j = 0; j < chunks[i].length; j++) {
//             fetchUrlData(chunks[i][j])
//               .then((res) => {
//                 resData.push(res);
//                 if (j === chunks[i].length - 1) {
//                   childResolve(true);
//                 }
//               })
//               .catch((err) => {
//                 reject(err);
//               });
//           }
//         });
//         if (resData.length === urls.length) {
//           resolve(resData);
//         }
//       })();
//     }
//   });
// }

// const fetchUrlData = (url) => {
//   return new Promise((resolve, reject) => {
//     fetch(url)
//       .then((res) => {
//         resolve(res.url);
//       })
//       .catch((err) => {
//         reject(err);
//       });
//   });
// };

// function sliceIntoChunks(arr, chunkSize) {
//   const res = [];
//   for (let i = 0; i < arr.length; i += chunkSize) {
//     const chunk = arr.slice(i, i + chunkSize);
//     res.push(chunk);
//   }
//   return res;
// }

// const isRunInParallelError = (object) => {
//   return "message" in object;
// };

// const runInParallel = async (urls, concurrency) => {
//   let fetchPromises = [];
//   let batchedResponses = [];
//   if (concurrency === 0) {
//     return [];
//   }
//   for (let i = 0; i < urls.length; i++) {
//     const batchIndex = Math.floor(i / concurrency);
//     if (!fetchPromises[batchIndex]) {
//       fetchPromises[batchIndex] = [];
//     }
//     const promise = fetchUrlText(urls[i]);
//     fetchPromises[batchIndex].push(promise);
//     if ((i + 1) % concurrency === 0 || i === urls.length - 1) {
//       const result = await Promise.all(fetchPromises[batchIndex]).catch((err) => {
//         return {
//           message: err,
//         };
//       });
//       if (isRunInParallelError(result)) {
//         return result;
//       }
//       batchedResponses.push(result);
//     }
//   }
//   return batchedResponses.flat();
// };

// const fetchUrlText = async (url) => fetch(url)
//   .then((res) => res.text())
//   .catch((error) => Promise.reject(`Failed to fetch "${url}": "${error}"`));

// async function testRunInParallel() {
//     const res = await runInParallel(["https://api.tvmaze.com/search/shows?q=cars"], 1);
//     console.log(res);
// }
// testRunInParallel();

// import fetch from "node-fetch";
// export interface RunInParallelError {
//   message: string;
// }
// const isRunInParallelError = (object: any): object is RunInParallelError => {
//   return "message" in object;
// };
// export const runInParallel = async (
//   urls: string[],
//   concurrency: number
// ): Promise<string[] | RunInParallelError> => {
//   let fetchPromises: Promise<string>[][] = [];
//   let batchedResponses: string[][] = [];
//   if (concurrency === 0) {
//     return [];
//   }
//   for (let i = 0; i < urls.length; i++) {
//     const batchIndex = Math.floor(i / concurrency);
//     if (!fetchPromises[batchIndex]) {
//       fetchPromises[batchIndex] = [];
//     }
//     const promise = fetchUrlText(urls[i]);
//     fetchPromises[batchIndex].push(promise);
//     if ((i + 1) % concurrency === 0 || i === urls.length - 1) {
//       const result: string[] | RunInParallelError = await Promise.all(
//         fetchPromises[batchIndex]
//       ).catch((err) => {
//         return {
//           message: err,
//         };
//       });
//       if (isRunInParallelError(result)) {
//         return result;
//       }
//       batchedResponses.push(result);
//     }
//   }
//   return batchedResponses.flat();
// };
// const fetchUrlText = async (url: string): Promise<string> =>
//   fetch(url)
//     .then((res) => res.text())
//     .catch((error) => Promise.reject(`Failed to fetch "${url}": "${error}"`));
class Deferred {
  constructor() {
    this._resolve = () => undefined;
    this._promise = new Promise((resolve) => {
      this._resolve = resolve;
    });
  }
  promise() {
    return this._promise;
  }
  resolve(value) {
    this._resolve(value);
  }
}
async function runInParallel(urls, concurrency) {
  // points to the available job
  let jobIndex = 0;
  const results = urls.map(() => new Deferred());
  function doJobRecursive() {
    if (jobIndex === urls.length) {
      return;
    }
    const thisJobIndex = jobIndex;
    fetch(urls[thisJobIndex]).then(async (res) => {
      const text = await res.text();
      results[thisJobIndex].resolve(text);
      // move onto the next job once this one finishes
      doJobRecursive();
    });
    // current job index points to the job being worked on, move to the next job
    jobIndex++;
  }
  // schedule x concurrent jobs
  // each job, upon finishing, starts another job
  for (let i = 0; i < concurrency; i++) {
    doJobRecursive();
  }
  return Promise.all(results.map((deferred) => deferred.promise()));
}
// Test code
// runInParallel(Array.from(Array(1)).map((_, index) => `https://example.com/${index}`), 50).then(console.log);
// runInParallel(Array.from(Array(10)).map((_, index) => `https://example.com/${index}`), 50).then(console.log);
// runInParallel(Array.from(Array(2222)).map((_, index) => `https://example.com/${index}`), 50).then(console.log);
//
// runInParallel(Array.from(Array(10000)).map((_, index) => `https://example.com/${index}`), 500).then(console.log);
//
// runInParallel(Array.from(Array(100)).map((_, index) => `https://example.com/${index}`), 1).then(console.log);
function fetchMock(str) {
  console.log("start", str);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log("done", str);
      resolve({
        text() {
          return Promise.resolve(str);
        },
      });
    });
  });
}

let urls = new Array(10).fill("https://catfact.ninja/fact");

let limit = [10, 5, 2, 1];

limit.forEach((l, i) => {
  setTimeout(() => {
    console.time(`${l} parallel requests`);
    // multiRequest(urls, l).then((data) => {
    runInParallel(urls, l).then((data) => {
      console.log(data);
      console.timeEnd(`${l} parallel requests`);
    });
  }, i * 5000);
});
