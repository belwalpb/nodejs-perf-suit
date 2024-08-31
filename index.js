const http = require('http');
const { performance } = require('perf_hooks');

const requestUrls = [
  'http://example.com/path1',
  'http://example.com/path2',
  'http://example.com/path3',
  // Add more URLs as needed
];

const stats = {
  '2XX': 0,
  '4XX': 0,
  '5XX': 0,
  'other': 0,
  minTime: Infinity,
  maxTime: 0,
  totalTime: 0,
  requestCount: 0,
};

function getRandomUrl() {
  const randomIndex = Math.floor(Math.random() * requestUrls.length);
  return requestUrls[randomIndex];
}

function sendRequest() {
  return new Promise((resolve) => {
    const url = getRandomUrl();
    const startTime = performance.now();

    http.get(url, (res) => {
      const endTime = performance.now();
      const duration = endTime - startTime;

      if (res.statusCode >= 200 && res.statusCode < 300) {
        stats['2XX']++;
      } else if (res.statusCode >= 400 && res.statusCode < 500) {
        stats['4XX']++;
      } else if (res.statusCode >= 500 && res.statusCode < 600) {
        stats['5XX']++;
      } else {
        stats['other']++;
      }

      stats.minTime = Math.min(stats.minTime, duration);
      stats.maxTime = Math.max(stats.maxTime, duration);
      stats.totalTime += duration;
      stats.requestCount++;

      resolve();
    }).on('error', () => {
      stats['other']++;
      resolve();
    });
  });
}

async function sendConcurrentRequests() {
  const promises = [];
  for (let i = 0; i < 100; i++) {
    promises.push(sendRequest());
  }
  await Promise.all(promises);
}

async function main() {
  const endTime = Date.now() + 30 * 60 * 1000; // 30 minutes from now

  while (Date.now() < endTime) {
    await sendConcurrentRequests();
  }

  console.log('2XX requests:', stats['2XX']);
  console.log('4XX requests:', stats['4XX']);
  console.log('5XX requests:', stats['5XX']);
  console.log('Other requests:', stats['other']);
  console.log('Min Time:', stats.minTime, 'ms');
  console.log('Average Time:', stats.totalTime / stats.requestCount, 'ms');
  console.log('Max Time:', stats.maxTime, 'ms');
}

main();