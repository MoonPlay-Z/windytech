import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { chunkText, parseTranslationResponse, translateEbaySpecs, translateEbayText, translateEbayTitle, translateSpecKey } from './ebay-translate';

describe('traduccion automatica de importaciones de eBay (Google Translate)', () => {
  it('parseTranslationResponse extrae el texto traducido del payload de Google', () => {
    const data = [
      [
        [
          'Hola mundo, esto es una prueba.',
          'Hello world, this is a test',
          null,
          null,
          3,
          null,
          null,
          [[]],
          [[['e050167b38f2a566522b4157651fc616', 'en_es_2023q1.md']]],
        ],
      ],
      null,
      'en',
      null,
      null,
      null,
      null,
      [],
    ];
    assert.equal(parseTranslationResponse(data), 'Hola mundo, esto es una prueba.');
  });

  it('parseTranslationResponse devuelve null cuando no hay texto', () => {
    assert.equal(parseTranslationResponse([null, null]), null);
  });

  it('chunkText devuelve un solo chunk para textos cortos', () => {
    assert.deepEqual(chunkText('Dell Latitude 7420'), ['Dell Latitude 7420']);
  });

  it('chunkText divide textos largos en chunks dentro del maximo', () => {
    const longText = Array.from({ length: 150 }, (_, index) => `Linea ${index} del texto de prueba para chunking automatizado`).join('\n');
    const chunks = chunkText(longText);
    assert.ok(chunks.length > 1);
    assert.ok(chunks.every((chunk) => chunk.length <= 4500));
    assert.ok(chunks.join('\n').includes('Linea 0'));
  });

  it('translateEbayText devuelve el texto original cuando esta vacio', async () => {
    assert.equal(await translateEbayText('   '), '');
  });

  it('translateEbayTitle devuelve el titulo original cuando esta vacio', async () => {
    assert.equal(await translateEbayTitle('   '), '');
  });

  it('translateSpecKey traduce las claves de especificaciones conocidas', () => {
    assert.equal(translateSpecKey('Brand'), 'Marca');
    assert.equal(translateSpecKey('Model'), 'Modelo');
    assert.equal(translateSpecKey('Condition'), 'Condición');
    assert.equal(translateSpecKey('RAM'), 'RAM');
    assert.equal(translateSpecKey('Unknown Aspect'), 'Unknown Aspect');
  });

  it('translateEbaySpecs conserva las especificaciones aunque falle la traduccion', async () => {
    const specs = await translateEbaySpecs({ Brand: '', Model: '' });
    assert.ok(specs);
    assert.equal(Object.keys(specs).length, 2);
    assert.equal(specs.Marca, '');
    assert.equal(specs.Modelo, '');
  });
});
