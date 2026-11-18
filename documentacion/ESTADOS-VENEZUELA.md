# Estados y ciudades de Venezuela (referencia del sistema)

Venezuela se organiza en **23 estados**, más el **Distrito Capital** y las
**Dependencias Federales**. Esta lista es la fuente de verdad usada por
`src/data/ciudades.ts` para validar que cada ficha local pertenezca a una
entidad real.

> Nota: la Guayana Esequiba es un territorio en disputa. La legislación
> venezolana de 2023 lo declara entidad territorial, pero no figura entre los
> 23 estados reconocidos en el anexo de entidades federales, así que no se
> incluye aquí.

Fuentes: [Anexo:Entidades federales de Venezuela](https://es.wikipedia.org/wiki/Anexo:Entidades_federales_de_Venezuela)
y los artículos de cada estado (sección *Organización territorial / Municipios*).

## Lista oficial

| Entidad | Capital | Ciudades / municipios principales |
| --- | --- | --- |
| Amazonas | Puerto Ayacucho | Puerto Ayacucho, Alto Orinoco |
| Anzoátegui | Barcelona | Barcelona, Puerto La Cruz, El Tigre, Lechería |
| Apure | San Fernando | San Fernando, Guasdualito, Achaguas |
| Aragua | Maracay | Maracay, Turmero, La Victoria, Villa de Cura, Cagua |
| Barinas | Barinas | Barinas, Barinitas, Sabaneta, Santa Bárbara, Ciudad Bolivia, Obispos |
| Bolívar | Ciudad Bolívar | Ciudad Bolívar, Ciudad Guayana, Upata |
| Carabobo | Valencia | Valencia, Naguanagua, San Diego, Puerto Cabello, Guacara, Morón |
| Cojedes | San Carlos | San Carlos, Tinaquillo, El Tinaco |
| Delta Amacuro | Tucupita | Tucupita |
| Falcón | Coro | Coro, Punto Fijo, Puerto Cumarebo |
| Guárico | San Juan de los Morros | San Juan de los Morros, Calabozo, Valle de la Pascua, Zaraza |
| La Guaira | La Guaira | La Guaira, Maiquetía, Catia La Mar |
| Lara | Barquisimeto | Barquisimeto, Cabudare, El Tocuyo, Quíbor, Carora |
| Mérida | Mérida | Mérida, Ejido, Tovar, Santa Cruz de Mora |
| Miranda | Los Teques | Los Teques, Guarenas, Guatire, Cúa, Chacao, Baruta, El Hatillo |
| Monagas | Maturín | Maturín, Punta de Mata, Temer |
| Nueva Esparta | La Asunción | La Asunción, Porlamar, Pampatar, Juan Griego |
| Portuguesa | Guanare | Guanare, Araure, Ospino, Guanarito, Píritu, Agua Blanca |
| Sucre | Cumaná | Cumaná, Carúpano, Güiria |
| Táchira | San Cristóbal | San Cristóbal, San Antonio, Rubio, La Grita |
| Trujillo | Trujillo | Trujillo, Valera, Boconó |
| Yaracuy | San Felipe | San Felipe, Yaritagua, Nirgua |
| Zulia | Maracaibo | Maracaibo, Cabimas, Ciudad Ojeda, Machiques, Santa Rita, Los Puertos de Altagracia |
| Distrito Capital | Caracas | Caracas (municipio Libertador) |
| Dependencias Federales | Gran Roque | Gran Roque, islas Los Roques |

## Correcciones aplicadas al sistema

| Antes | Después | Motivo |
| --- | --- | --- |
| Ciudad «Portuguesa» dentro de Barinas | Ciudad «Guanare», estado Portuguesa | Portuguesa es un estado, no un municipio de Barinas |
| Ciudad «Valle de Aragua» | Ciudad «La Victoria» | El valle es una región, no una ciudad; La Victoria es ciudad real del estado |
| Zona «San Juan de los Morros» en Puerto Cabello | «Morón», «Güigüe», «Borburata» | San Juan de los Morros es la capital de Guárico |
| Zona «Guaicaipuro» en Aragua | «San Sebastián», «Zamora» | Guaicaipuro es un municipio de Miranda |
| Zona «Cruz de Pacairí» en Barinas | «Barinitas», «Sabaneta» | Cruz de Pacairí pertenece a Miranda |
| Zona «Tanakuy» en Mérida | «Ejido», «Tovar» | Localidad no verificable |
| Zonas «Orizalco», «El Chiringuito», «Los Places», «Boca de Tocuyo» | Municipios reales de cada estado | Localidades no verificables / de otros estados |
| `view-transition-name` de Caracas como `State` | `AdministrativeArea` | Distrito Capital no es un estado |
| Centro del área de servicio fijo en Caracas para todas las ciudades | Coordenadas por ciudad | Cada ficha usa su propio `GeoCircle` |

Las URLs antiguas `/valle-de-aragua/` y `/portuguesa/` redirigen 301 a
`/la-victoria/` y `/guanare/` (`astro.config.mjs`).

## Cobertura real

El pie de página y el esquema JSON-LD muestran **solo los estados donde hay
ficha de ciudad**: Aragua, Barinas, Carabobo, Distrito Capital, Lara, Mérida,
Portuguesa y Zulia. El resto de la tabla es referencia geográfica, no un
anuncio de cobertura.
