import assert from 'node:assert/strict';
import { test } from 'node:test';
import { productImage, productSrcSet } from './cloudinary';

test('las imágenes de producto usan calidad alta y una variante de 2400 px', () => {
  const srcSet = productSrcSet('products/laptop');

  assert.match(productImage('products/laptop'), /q_auto:best/);
  assert.match(srcSet, /w_2400[^ ]* 2400w/);
  assert.match(srcSet, /q_auto:best/);
});
