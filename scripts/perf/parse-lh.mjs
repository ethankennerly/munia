import { readFileSync } from 'fs';

const file = process.argv[2];
const r = JSON.parse(readFileSync(file, 'utf8'));
const a = r.audits;

const lcp = a['largest-contentful-paint'];
const fcp = a['first-contentful-paint'];
const tbt = a['total-blocking-time'];
const cls = a['cumulative-layout-shift'];
const ttfb = a['server-response-time'];
const speed = a['speed-index'];
const score = r.categories.performance.score;

console.log('Performance score:', Math.round(score * 100));
console.log('LCP:  ', lcp.displayValue, '  score:', lcp.score);
console.log('FCP:  ', fcp.displayValue, '  score:', fcp.score);
console.log('TBT:  ', tbt.displayValue, '  score:', tbt.score);
console.log('CLS:  ', cls.displayValue, '  score:', cls.score);
console.log('TTFB: ', ttfb.displayValue, '  score:', ttfb.score);
console.log('Speed:', speed.displayValue, '  score:', speed.score);

const lcpItem = lcp.details?.items?.[0];
if (lcpItem) {
  console.log('\nLCP element:', lcpItem.node?.snippet ?? lcpItem.url ?? 'n/a');
  if (lcpItem.phases) {
    console.log('LCP phases:');
    for (const [k, v] of Object.entries(lcpItem.phases)) {
      console.log(' ', k, ':', v);
    }
  }
}

// Top opportunities
console.log('\nTop opportunities:');
for (const [id, audit] of Object.entries(a)) {
  if (audit.details?.type === 'opportunity' && audit.details?.overallSavingsMs > 100) {
    console.log(`  ${id}: ${Math.round(audit.details.overallSavingsMs)}ms savings`);
  }
}
