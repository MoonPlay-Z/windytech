-- El sitio se publica únicamente en español: se eliminan las traducciones
-- en inglés que quedaban de la versión bilingüe.

DELETE FROM product_translations WHERE locale = 'en';
DELETE FROM post_translations WHERE locale = 'en';
DELETE FROM category_translations WHERE locale = 'en';
DELETE FROM project_translations WHERE locale = 'en';
DELETE FROM service_plan_translations WHERE locale = 'en';

-- Las cotizaciones también se emiten en español.
UPDATE quotes SET locale = 'es' WHERE locale <> 'es';

-- La etiqueta en inglés de las variantes ya no se usa.
ALTER TABLE product_variants DROP COLUMN IF EXISTS label_en;
