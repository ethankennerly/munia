import { readFileSync } from 'fs';

const file = process.argv[2];
const r = JSON.parse(readFileSync(file, 'utf8'));
const a = r.audits;

const lcp = a['largest-contentful-paint'];
const lcpItem = lcp.details?.items?.[0];
console.log('LCP element type:', lcpItem?.type ?? 'n/a');
console.log('LCP element:', lcpItem?.node?.snippet ?? lcpItem?.url ?? 'n/a');
console.log('LCP node label:', lcpItem?.node?.nodeLabel ?? 'n/a');

// Unused JS breakdown
const unusedJs = a['unused-javascript'];
console.log('\nUnused JS (top 10):');
(unusedJs?.details?.items ?? []).slice(0, 10).forEach(item => {
  console.log(' ', Math.round((item.wastedBytes ?? 0) / 1024), 'KB wasted -', item.url?.replace(/.*\//, '')?.substring(0, 80));
});

// Network requests
const netReqs = a['network-requests'];
console.log('\nSlow network requests (>500ms):');
(netReqs?.details?.items ?? []).filter(i => i.endTime - i.startTime > 500).forEach(i => {
  console.log(' ', Math.round(i.endTime - i.startTime), 'ms -', i.url?.substring(0, 80));
});

// Long tasks
const longTasks = a['long-tasks'];
console.log('\nLong tasks:');
(longTasks?.details?.items ?? []).slice(0, 10).forEach(i => {
  console.log(' ', Math.round(i.duration), 'ms at', i.startTime);
});
