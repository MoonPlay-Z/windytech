# Estados y ciudades de Venezuela (referencia del sistema)

Venezuela se organiza en **23 estados**, más el **Distrito Capital** y las
**Dependencias Federales**. Esta lista es la fuente de verdad usada por
`src/data/ciudades.ts` para validar que cada ficha local pertenezca a una
entidad real.

Cada entidad registra **cinco ciudades o localidades principales** en
`VENEZUELA_STATES[].cities`. Son datos de referencia y validación: **no
declaran cobertura de servicio**. Las fichas con página propia están en
`CITIES`.

> Nota: la Guayana Esequiba es un territorio en disputa. La legislación
> venezolana de 2023 lo declara entidad territorial, pero no figura entre los
> 23 estados reconocidos en el anexo de entidades federales, así que no se
> incluye aquí.

Fuentes: [Anexo:Entidades federales de Venezuela](https://es.wikipedia.org/wiki/Anexo:Entidades_federales_de_Venezuela)
y los anexos de municipios de cada estado.

## Lista oficial (5 ciudades por entidad)

| Entidad | Capital | Cinco ciudades principales |
| --- | --- | --- |
| Amazonas | Puerto Ayacucho | Puerto Ayacucho, San Fernando de Atabapo, La Esmeralda, Maroa, Alto Orinoco |
| Anzoátegui | Barcelona | Barcelona, Puerto La Cruz, El Tigre, Lechería, Anaco |
| Apure | San Fernando | San Fernando, Guasdualito, Achaguas, Biruaca, El Amparo |
| Aragua | Maracay | Maracay, Turmero, La Victoria, Villa de Cura, Cagua |
| Barinas | Barinas | Barinas, Barinitas, Sabaneta, Santa Bárbara, Ciudad Bolivia |
| Bolívar | Ciudad Bolívar | Ciudad Bolívar, Ciudad Guayana, Upata, El Callao, Caicara del Orinoco |
| Carabobo | Valencia | Valencia, Naguanagua, San Diego, Puerto Cabello, Guacara |
| Cojedes | San Carlos | San Carlos, Tinaquillo, Tinaco, El Baúl, Las Vegas |
| Delta Amacuro | Tucupita | Tucupita, Pedernales, Curiapo, Casacoima, San José de Amacuro |
| Falcón | Coro | Coro, Punto Fijo, Puerto Cumarebo, Churuguara, Tucacas |
| Guárico | San Juan de los Morros | San Juan de los Morros, Calabozo, Valle de la Pascua, Zaraza, El Sombrero |
| La Guaira | La Guaira | La Guaira, Maiquetía, Catia La Mar, Macuto, Carayaca |
| Lara | Barquisimeto | Barquisimeto, Cabudare, El Tocuyo, Quíbor, Carora |
| Mérida | Mérida | Mérida, Ejido, Tovar, Santa Cruz de Mora, Mucuchíes |
| Miranda | Los Teques | Los Teques, Guarenas, Guatire, Cúa, Chacao |
| Monagas | Maturín | Maturín, Punta de Mata, Temer, Aguasay, Quiriquire |
| Nueva Esparta | La Asunción | La Asunción, Porlamar, Pampatar, Juan Griego, Las Nieves |
| Portuguesa | Guanare | **Guanare, Acarigua, Agua Blanca**, Araure, Ospino |
| Sucre | Cumaná | Cumaná, Carúpano, Güiria, Cumanacoa, Irapa |
| Táchira | San Cristóbal | San Cristóbal, San Antonio del Táchira, Rubio, La Grita, Táriba |
| Trujillo | Trujillo | Trujillo, Valera, Boconó, Betijoque, Escuque |
| Yaracuy | San Felipe | San Felipe, Yaritagua, Nirgua, Chivacoa, Cocorote |
| Zulia | Maracaibo | Maracaibo, Cabimas, Ciudad Ojeda, Machiques, Santa Rita |
| Distrito Capital | Caracas | Caracas, Libertador, Santa Rosalía, El Valle, La Vega |
| Dependencias Federales | Gran Roque | Gran Roque, Cayo de Agua, Dos Mosquises, Crasquí, Francisquí |

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
| Portuguesa sin Acarigua ni Agua Blanca | Incluidas en sus cinco ciudades | Requisito del catálogo local |

Las URLs antiguas `/valle-de-aragua/` y `/portuguesa/` redirigen 301 a
`/la-victoria/` y `/guanare/` (`astro.config.mjs`).

## Cobertura real

El pie de página y el esquema JSON-LD muestran **solo los estados donde hay
ficha de ciudad**: Aragua, Barinas, Carabobo, Distrito Capital, Lara, Mérida,
Portuguesa y Zulia. El resto de la tabla es referencia geográfica, no un
anuncio de cobertura.
