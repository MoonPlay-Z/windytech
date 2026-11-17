import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { truncateText } from './text';

describe('truncateText', () => {
  it('deja intactos los textos cortos', () => {
    assert.equal(truncateText('Portátil Dell Latitude 7420'), 'Portátil Dell Latitude 7420');
  });

  it('recorta sin cortar palabras y añade puntos suspensivos', () => {
    const text =
      'Dell Latitude 7420 con Core i7, 16 GB de RAM y 256 GB SSD, ideal para trabajo profesional.';
    const result = truncateText(text, 60);
    assert.ok(result.length <= 61, result);
    assert.ok(result.endsWith('…'));
    assert.ok(!result.includes('  '));
    assert.ok(text.startsWith(result.slice(0, -1)));
  });

  it('normaliza espacios antes de medir', () => {
    assert.equal(truncateText('  Hola   mundo  '), 'Hola mundo');
  });
});
