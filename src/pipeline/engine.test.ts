import test from 'node:test';
import assert from 'node:assert/strict';
import {
  filterRows,
  sortRows,
  checkHasCycle,
  parseCsvString,
  parseJsonString,
  getSampleSalesData
} from './engine';

test('getSampleSalesData returns structured rows and columns', () => {
  const { data, columns } = getSampleSalesData();
  assert.ok(data.length > 20, 'Should have at least 20 sample rows');
  assert.ok(columns.includes('produto'), 'Should include produto column');
  assert.ok(columns.includes('valor'), 'Should include valor column');
  assert.ok(columns.includes('categoria'), 'Should include categoria column');
});

test('parseCsvString parses valid CSV with numeric typing', () => {
  const csv = `id,name,score\n1,Alice,95.5\n2,Bob,82`;
  const { data, columns } = parseCsvString(csv);
  assert.equal(data.length, 2);
  assert.deepEqual(columns, ['id', 'name', 'score']);
  assert.equal(data[0].name, 'Alice');
  assert.equal(data[0].score, 95.5);
});

test('parseJsonString parses json array', () => {
  const json = JSON.stringify([
    { item: 'A', value: 10 },
    { item: 'B', value: 20 }
  ]);
  const { data, columns } = parseJsonString(json);
  assert.equal(data.length, 2);
  assert.deepEqual(columns, ['item', 'value']);
  assert.equal(data[1].value, 20);
});

test('filterRows gt / lt / eq / contains', () => {
  const rows = [
    { name: 'Alpha', price: 100, active: true },
    { name: 'Beta', price: 250, active: false },
    { name: 'Gamma', price: 50, active: true },
    { name: 'Delta Pro', price: 400, active: true }
  ];

  // Numeric Greater Than
  const gtResult = filterRows(rows, 'price', 'gt', '150');
  assert.equal(gtResult.length, 2);
  assert.equal(gtResult[0].name, 'Beta');
  assert.equal(gtResult[1].name, 'Delta Pro');

  // Numeric Less Than
  const ltResult = filterRows(rows, 'price', 'lt', '100');
  assert.equal(ltResult.length, 1);
  assert.equal(ltResult[0].name, 'Gamma');

  // Equality
  const eqResult = filterRows(rows, 'name', 'eq', 'beta');
  assert.equal(eqResult.length, 1);
  assert.equal(eqResult[0].name, 'Beta');

  // Contains (case insensitive)
  const containsResult = filterRows(rows, 'name', 'contains', 'pro');
  assert.equal(containsResult.length, 1);
  assert.equal(containsResult[0].name, 'Delta Pro');
});

test('sortRows handles ascending and descending for numbers and strings', () => {
  const rows = [
    { item: 'Zebra', value: 50 },
    { item: 'Apple', value: 200 },
    { item: 'Mango', value: 10 }
  ];

  // Numeric Ascending
  const numAsc = sortRows(rows, 'value', 'asc');
  assert.equal(numAsc[0].value, 10);
  assert.equal(numAsc[2].value, 200);

  // Numeric Descending
  const numDesc = sortRows(rows, 'value', 'desc');
  assert.equal(numDesc[0].value, 200);
  assert.equal(numDesc[2].value, 10);

  // String Ascending
  const strAsc = sortRows(rows, 'item', 'asc');
  assert.equal(strAsc[0].item, 'Apple');
  assert.equal(strAsc[2].item, 'Zebra');
});

test('checkHasCycle prevents cycles and self-connections', () => {
  // Self connection
  assert.equal(checkHasCycle('nodeA', 'nodeA', []), true);

  // Simple cycle: A -> B -> C -> A
  const existingEdges = [
    { source: 'A', target: 'B' },
    { source: 'B', target: 'C' }
  ];

  // Adding C -> A would cycle
  assert.equal(checkHasCycle('C', 'A', existingEdges), true);

  // Adding C -> D is valid
  assert.equal(checkHasCycle('C', 'D', existingEdges), false);
});
