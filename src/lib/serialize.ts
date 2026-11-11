import { productImage, productSrcSet } from './cloudinary';
import { priceFor, primaryImage, type CatalogProduct } from './catalog';
import type { RateResult } from './rate';

/** Representación pública de un producto: solo lo que necesita la web. */
export function productJson(product: CatalogProduct, rate: RateResult | null) {
  const now = new Date();
  const base = priceFor(product, null, now);
  const image = primaryImage(product);

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    brand: product.brand,
    model: product.model,
    condition: product.condition,
    availability: product.availability,
    specs: product.specs,
    shortDescription: product.shortDescription,
    badge: base.badge,
    image: image
      ? {
          publicId: image.cloudinaryPublicId,
          alt: image.alt || product.name,
          url: productImage(image.cloudinaryPublicId, 800),
          srcSet: productSrcSet(image.cloudinaryPublicId),
        }
      : null,
    price: {
      usdCents: base.unitCents,
      listCents: base.listCents,
      compareAtCents: base.compareAtCents,
      discountCents: base.discountCents,
      vesCents: rate ? Math.round(base.unitCents * rate.rate) : null,
      rate: rate?.rate ?? null,
      rateDate: rate?.date ?? null,
      taxIncluded: false,
    },
    variants: product.variants.map((variant) => {
      const variantPrice = priceFor(product, variant.id, now);
      return {
        id: variant.id,
        sku: variant.sku,
        attributes: variant.attributes,
        availability: variant.availability,
        label: variant.labelEs,
        imagePublicId: variant.imagePublicId,
        price: {
          usdCents: variantPrice.unitCents,
          listCents: variantPrice.listCents,
          compareAtCents: variantPrice.compareAtCents,
          vesCents: rate ? Math.round(variantPrice.unitCents * rate.rate) : null,
        },
      };
    }),
  };
}
