// Run: npm test
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { formatINR, formatTime, isSet, sizeLine } from './format.ts';

test('Indian rupee format', () => {
  assert.equal(formatINR(3500), '₹3,500');
  assert.equal(formatINR(13500), '₹13,500');
  assert.equal(formatINR(150000), '₹1,50,000');
});

test('size fallback never invents dimensions', () => {
  assert.equal(sizeLine(44, 25), '44 in high × 25 in wide');
  assert.equal(sizeLine(null, null), 'Size on request');
  assert.equal(sizeLine(44, null), 'Size on request');
});

test('TODO values count as unset', () => {
  assert.equal(isSet('TODO'), false);
  assert.equal(isSet('TODO: paste link'), false);
  assert.equal(isSet(null), false);
  assert.equal(isSet('https://maps.app.goo.gl/x'), true);
});

test('24h to 12h time', () => {
  assert.equal(formatTime('10:00'), '10:00 am');
  assert.equal(formatTime('21:30'), '9:30 pm');
});

test('open days label', async () => {
  const { daysLabel } = await import('./format.ts');
  assert.equal(daysLabel('TODO'), '');
  assert.equal(daysLabel(['Monday', 'Tuesday']), 'Monday, Tuesday');
  assert.equal(daysLabel(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']), 'Every day');
});
