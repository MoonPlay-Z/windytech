import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { productSchema } from './validation';

const images = (count: number) =>
  Array.from({ length: count }, (_, index) => ({
    cloudinaryPublicId: `windytech/productos/foto-${index}`,
    alt: `Foto ${index + 1}`,
    isPrimary: index === 0,
    position: index,
  }));

const product = (count: number) => ({
  price: 100,
  translations: [
    {
      locale: 'es',
      slug: 'producto-de-prueba',
      name: 'Producto de prueba',
      summary: '',
      descriptionMd: '',
      seoTitle: '',
      seoDescription: '',
    },
  ],
  images: images(count),
});

describe('límite de imágenes por producto', () => {
  it('acepta 6 imágenes', () => {
    const result = productSchema.safeParse(product(6));
    assert.equal(result.success, true);
  });

  it('rechaza 7 imágenes', () => {
    const result = productSchema.safeParse(product(7));
    assert.equal(result.success, false);
    if (!result.success) {
      assert.ok(
        result.error.issues.some((issue) => issue.message.includes('Máximo 6 imágenes')),
        result.error.issues.map((issue) => issue.message).join(', '),
      );
    }
  });
});
