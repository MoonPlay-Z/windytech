DO $$
DECLARE
  product_id INTEGER;
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM product_translations
    WHERE slug IN (
      'laptop-lenovo-core-i5-12-gen-8gb-128gb-m2',
      'lenovo-core-i5-12th-gen-laptop-8gb-128gb-m2'
    )
  ) THEN
    INSERT INTO products (
      brand,
      model,
      condition,
      price_cents,
      availability,
      is_active,
      is_featured,
      specs
    )
    VALUES (
      'Lenovo',
      'Core i5 12.ª gen · 8 GB RAM · 128 GB M.2',
      'NEW',
      45000,
      'IN_STOCK',
      true,
      false,
      '{"Tipo":"Laptop","Procesador":"Intel Core i5, 12.ª generación","Memoria RAM":"8 GB","Almacenamiento":"128 GB M.2"}'::jsonb
    )
    RETURNING id INTO product_id;

    INSERT INTO product_translations (
      product_id,
      locale,
      slug,
      name,
      short_description,
      description_md,
      seo_title,
      seo_description
    )
    VALUES
      (
        product_id,
        'es',
        'laptop-lenovo-core-i5-12-gen-8gb-128gb-m2',
        'Laptop Lenovo Core i5 12.ª gen · 8 GB RAM · 128 GB M.2',
        'Laptop Lenovo con Intel Core i5 de 12.ª generación, 8 GB de RAM y almacenamiento M.2 de 128 GB.',
        '## Especificaciones\n- Procesador: Intel Core i5, 12.ª generación\n- Memoria RAM: 8 GB\n- Almacenamiento: 128 GB M.2\n- Condición: nueva',
        'Laptop Lenovo Core i5 12.ª gen | Windytech',
        'Laptop Lenovo nueva con Core i5 de 12.ª generación, 8 GB de RAM y 128 GB M.2.'
      ),
      (
        product_id,
        'en',
        'lenovo-core-i5-12th-gen-laptop-8gb-128gb-m2',
        'Lenovo Core i5 12th Gen Laptop · 8 GB RAM · 128 GB M.2',
        'Lenovo laptop with a 12th-generation Intel Core i5, 8 GB RAM, and 128 GB M.2 storage.',
        '## Specifications\n- Processor: 12th-generation Intel Core i5\n- Memory: 8 GB RAM\n- Storage: 128 GB M.2\n- Condition: new',
        'Lenovo Core i5 12th Gen Laptop | Windytech',
        'New Lenovo laptop with a 12th-generation Core i5, 8 GB RAM, and 128 GB M.2 storage.'
      );
  END IF;
END $$;
