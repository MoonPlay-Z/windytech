import assert from 'node:assert/strict';
import test, { describe } from 'node:test';
import {
  CITIES,
  VENEZUELA_STATES,
  citiesOfState,
  cityBySlug,
  stateEntityType,
} from '../data/ciudades';

describe('entidades federales de Venezuela', () => {
  test('incluye los 23 estados, el Distrito Capital y las Dependencias Federales', () => {
    assert.equal(VENEZUELA_STATES.length, 25);
    assert.equal(VENEZUELA_STATES.filter((item) => item.type === 'state').length, 23);
    assert.equal(VENEZUELA_STATES.filter((item) => item.type === 'district').length, 1);
    assert.equal(VENEZUELA_STATES.filter((item) => item.type === 'federal').length, 1);
  });

  test('capitales correctas de los estados corregidos', () => {
    const capital = (name: string) =>
      VENEZUELA_STATES.find((item) => item.name === name)?.capital;
    assert.equal(capital('Aragua'), 'Maracay');
    assert.equal(capital('Carabobo'), 'Valencia');
    assert.equal(capital('Barinas'), 'Barinas');
    assert.equal(capital('Portuguesa'), 'Guanare');
    assert.equal(capital('Zulia'), 'Maracaibo');
  });

  test('Distrito Capital no se anuncia como un estado en el schema', () => {
    assert.equal(stateEntityType('Distrito Capital'), 'AdministrativeArea');
    assert.equal(stateEntityType('Dependencias Federales'), 'AdministrativeArea');
    assert.equal(stateEntityType('Portuguesa'), 'State');
  });

  test('cada entidad tiene cinco ciudades y la capital entre ellas', () => {
    for (const entity of VENEZUELA_STATES) {
      assert.equal(entity.cities.length, 5, entity.name);
      assert.ok(entity.cities.includes(entity.capital), entity.name);
      assert.equal(new Set(entity.cities).size, 5, entity.name);
    }
  });

  test('Portuguesa incluye Acarigua y Agua Blanca', () => {
    const cities = citiesOfState('Portuguesa');
    assert.ok(cities.includes('Acarigua'));
    assert.ok(cities.includes('Agua Blanca'));
    assert.equal(cities.length, 5);
  });
});

describe('fichas de ciudad', () => {
  test('todos los estados de las fichas existen en la lista oficial', () => {
    const names = new Set(VENEZUELA_STATES.map((item) => item.name));
    for (const city of CITIES) {
      assert.ok(names.has(city.state), `${city.name} tiene un estado inválido: ${city.state}`);
    }
  });

  test('no hay slugs ni nombres repetidos', () => {
    assert.equal(new Set(CITIES.map((city) => city.slug)).size, CITIES.length);
    assert.equal(new Set(CITIES.map((city) => city.name)).size, CITIES.length);
  });

  test('coordenadas dentro del territorio venezolano', () => {
    for (const city of CITIES) {
      assert.ok(city.latitude > 0 && city.latitude < 13, city.name);
      assert.ok(city.longitude > -74 && city.longitude < -59, city.name);
    }
  });

  test('Portuguesa es un estado, no una ciudad de Barinas', () => {
    assert.equal(cityBySlug('guanare')?.state, 'Portuguesa');
    assert.equal(cityBySlug('portuguesa'), undefined);
    assert.ok(!CITIES.some((city) => city.name === 'Portuguesa'));
  });

  test('sin zonas de otros estados ni localidades inventadas', () => {
    const invalidas = [
      'San Juan de los Morros', // Guárico
      'Cruz de Pacairí', // Miranda
      'Guaicaipuro', // Miranda
      'Tanakuy',
      'Los Places',
      'Boca de Tocuyo',
      'Orizalco',
      'El Chiringuito',
    ];
    for (const city of CITIES) {
      for (const zone of city.zones) {
        assert.ok(!invalidas.includes(zone), `${city.name} incluye zona inválida: ${zone}`);
      }
    }
  });
});
