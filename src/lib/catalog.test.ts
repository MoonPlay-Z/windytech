import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { orderProductImages, type CatalogImage } from './catalog';

const image = (id: number, position: number, isPrimary = false): CatalogImage => ({
  id,
  productId: 1,
  variantId: null,
  cloudinaryPublicId: `products/${id}`,
  alt: `Imagen ${id}`,
  position,
  isPrimary,
});

describe('orden de imágenes de producto', () => {
  it('pone la imagen principal primero y mantiene el orden de las demás', () => {
    const images = [image(3, 2), image(2, 1, true), image(1, 0)];

    assert.deepEqual(orderProductImages(images).map((item) => item.id), [2, 1, 3]);
    assert.deepEqual(images.map((item) => item.id), [3, 2, 1]);
  });

  it('usa la posición como orden cuando no hay imagen principal', () => {
    assert.deepEqual(
      orderProductImages([image(3, 2), image(1, 0), image(2, 1)]).map((item) => item.id),
      [1, 2, 3],
    );
  });
});
