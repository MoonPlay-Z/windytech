import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { stripEbayMentions, stripEbaySource, stripEbaySpecs } from './ebay';

describe('sanitizado del origen eBay para el catálogo público', () => {
  it('quita el pie "Importado desde eBay" de la descripción', () => {
    const text =
      'Equipo profesional Dell Latitude 7420.\n\n---\n\nImportado desde eBay: https://www.ebay.com/itm/110591463017';
    assert.equal(stripEbaySource(text), 'Equipo profesional Dell Latitude 7420.');
  });

  it('sustituye menciones y enlaces a eBay por la marca', () => {
    const text =
      'Guaranteed delivery dates are put by eBay. You can contact eBay at https://www.ebay.com/help. eBay\'s policy applies.';
    const cleaned = stripEbayMentions(text);
    assert.ok(!/ebay/i.test(cleaned), cleaned);
    assert.ok(cleaned.includes('Windytech'));
    assert.ok(cleaned.includes("Windytech's policy"));
  });

  it('oculta las especificaciones internas de eBay', () => {
    const specs = {
      Brand: 'Dell',
      Model: 'Latitude 7420',
      Fuente: 'eBay',
      'Vendedor eBay': 'testuser',
      'Item eBay': 'v1|110591463017|0',
    };
    assert.deepEqual(stripEbaySpecs(specs), { Brand: 'Dell', Model: 'Latitude 7420' });
  });

  it('deja intactos los textos sin eBay', () => {
    const text = 'Equipo con Core i7, 16 GB de RAM y 256 GB SSD.';
    assert.equal(stripEbayMentions(text), text);
  });
});
