import assert from 'node:assert/strict';
import test, { describe } from 'node:test';
import {
  EMPTY_LIVE_STATS,
  liveValueChanged,
  newOrderIds,
  orderTone,
  parseLiveStats,
} from './live';

describe('métricas en vivo', () => {
  test('parsea todas las claves y normaliza valores ausentes', () => {
    const stats = parseLiveStats({ products: 12, newQuotes: '3', posts: null });
    assert.equal(stats?.products, 12);
    assert.equal(stats?.newQuotes, 3);
    assert.equal(stats?.posts, 0);
    assert.equal(stats?.orders, 0);
  });

  test('rechaza payloads que no son objetos', () => {
    assert.equal(parseLiveStats(null), null);
    assert.equal(parseLiveStats([]), null);
    assert.equal(parseLiveStats('12'), null);
  });

  test('el objeto vacío tiene todas las claves a cero', () => {
    assert.deepEqual(parseLiveStats({}), EMPTY_LIVE_STATS);
  });
});

describe('órdenes en vivo', () => {
  test('detecta solo las órdenes nuevas', () => {
    assert.deepEqual(newOrderIds([1, 2, 3], [2, 3, 4, 5]), [4, 5]);
  });

  test('ignora IDs inválidos', () => {
    assert.deepEqual(newOrderIds([1], [1, Number.NaN]), []);
  });

  test('asigna el tono correcto según el estado', () => {
    assert.equal(orderTone('PAID'), 'success');
    assert.equal(orderTone('pending'), 'pending');
    assert.equal(orderTone('CANCELLED'), 'danger');
    assert.equal(orderTone('revision'), 'neutral');
  });
});

describe('cambios de valor', () => {
  test('ignora espacios y solo anima cambios reales', () => {
    assert.equal(liveValueChanged(' 12 ', '12'), false);
    assert.equal(liveValueChanged('12', '13'), true);
    assert.equal(liveValueChanged(null, '0'), true);
  });
});
