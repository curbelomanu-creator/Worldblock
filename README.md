# Worldblock

Worldblock es un prototipo jugable de exploración medieval en primera persona construido con Three.js y ejecutable directamente en un navegador moderno.

## Controles

- **WASD** — mover
- **Mouse** — mirar
- **Space** — saltar; también permite saltar cuando montas un caballo
- **E** — montar/desmontar un caballo cercano
- **1–7** — seleccionar bloque o herramienta
- **5** — espada
- **6** — lazo para enlazar/soltar caballos
- **7** — cerca/corral
- **Click izquierdo** — romper bloque / atacar / usar lazo según la herramienta
- **Click derecho** — colocar bloque o cerca
- **Esc** — liberar el mouse

## Mundo

- Generación procedural por chunks de 16×16.
- Seed fija para regenerar el mismo terreno.
- Biomas de bosque, pradera, zonas secas y tierras altas.
- Bosques y árboles gigantes generados proceduralmente.
- Rocas y detalles de terreno procedurales.
- Pueblo medieval amurallado persistente con casas, caminos, plaza, torre, gran puerta, mercado, pozo, faroles, bancos, estandartes y decoración.

## Criaturas

- Aldeanos y trolls con patrullaje y reacción a golpes.
- Caballos salvajes montables y enlazables.
- Leones poco frecuentes.
- Elefantes muy raros.
- Sistema de vida, reacción, caída y desaparición al morir.

## Rendimiento

El mundo exterior usa streaming por chunks e `InstancedMesh` para evitar mantener todo el mapa cargado simultáneamente en memoria. Los chunks lejanos se descargan y vuelven a generarse desde la seed cuando regresas.

## Ejecutar

Abre `index.html` en Chrome u otro navegador moderno con conexión a Internet. Three.js se carga desde jsDelivr.
