import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  productDetailImage,
  productDetailSrcSet,
  productImage,
  productSrcSet,
} from './cloudinary';

test('las imágenes de producto conservan el encuadre original y usan calidad alta', () => {
  const srcSet = productSrcSet('products/laptop');

  assert.match(productImage('products/laptop'), /q_auto:best/);
  assert.match(srcSet, /w_2400[^ ]* 2400w/);
  assert.match(srcSet, /q_auto:best/);
  assert.match(productImage('products/laptop'), /c_limit/);
  assert.doesNotMatch(productImage('products/laptop'), /ar_4:3|c_fill/);
  assert.doesNotMatch(srcSet, /ar_4:3|c_fill/);
});

test('la galería conserva el encuadre original y entrega variantes grandes', () => {
  const image = productDetailImage('products/phone', 1600);
  const srcSet = productDetailSrcSet('products/phone');

  assert.match(image, /c_limit/);
  assert.match(image, /w_1600/);
  assert.doesNotMatch(image, /ar_4:3|c_fill/);
  assert.match(srcSet, /w_2400[^ ]* 2400w/);
  assert.doesNotMatch(srcSet, /ar_4:3|c_fill/);
});
