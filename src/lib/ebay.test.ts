import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { stripEbayMentions, stripEbaySource, stripEbaySpecs } from './ebay';
import { EbayError, ebayErrorMessage, parseEbayApiError } from './ebay-errors';

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

describe('errores de eBay con causa concreta', () => {
  it('identifica un token inválido', () => {
    const error = parseEbayApiError(
      401,
      '{"errors":[{"errorId":1001,"message":"Invalid access token"}]}',
    );
    assert.equal(error.code, 'EBAY_TOKEN_INVALID');
    assert.match(error.message, /token/i);
  });

  it('identifica un refresh token caducado', () => {
    const error = parseEbayApiError(
      400,
      '{"error":"invalid_grant","error_description":"refresh token has expired"}',
    );
    assert.equal(error.code, 'EBAY_TOKEN_EXPIRED');
  });

  it('identifica credenciales de aplicación inválidas', () => {
    const error = parseEbayApiError(
      401,
      '{"error":"invalid_client","error_description":"client authentication failed"}',
    );
    assert.equal(error.code, 'EBAY_BAD_CREDENTIALS');
    assert.match(error.message, /EBAY_CLIENT_ID/);
  });

  it('no confunde un codigo de autorizacion invalido con un refresh token caducado', () => {
    const error = parseEbayApiError(
      400,
      '{"error":"invalid_grant","error_description":"The authorization code is invalid"}',
    );
    assert.equal(error.code, 'EBAY_INVALID_GRANT');
  });

  it('identifica permisos insuficientes, límite de peticiones e items no encontrados', () => {
    assert.equal(parseEbayApiError(403, '{"errors":[{"message":"Insufficient scope"}]}').code, 'EBAY_FORBIDDEN');
    assert.equal(parseEbayApiError(429, '{"errors":[{"message":"Rate limit exceeded"}]}').code, 'EBAY_RATE_LIMIT');
    assert.equal(parseEbayApiError(404, '{"errors":[{"message":"Item not found"}]}').code, 'EBAY_ITEM_NOT_FOUND');
  });

  it('identifica errores del servicio y respuestas mal formadas', () => {
    assert.equal(parseEbayApiError(503, 'Service Unavailable').code, 'EBAY_UNAVAILABLE');
    assert.equal(
      parseEbayApiError(200, '{"errors":[{"message":"Bad request"}]}').code,
      'EBAY_BAD_REQUEST',
    );
  });

  it('expone código y mensaje seguro en la capa HTTP', () => {
    const info = ebayErrorMessage(new EbayError('EBAY_NOT_CONFIGURED', 'Faltan credenciales.'));
    assert.deepEqual(info, { code: 'EBAY_NOT_CONFIGURED', message: 'Faltan credenciales.' });
    const unknown = ebayErrorMessage(new Error('fallo sin clasificar'));
    assert.equal(unknown.code, 'EBAY_UNKNOWN');
    assert.equal(unknown.message, 'fallo sin clasificar');
  });
});
