# Rutina de cada mañana: preparar los temas que piden los profes

Esto lo lee la rutina programada de Claude (una vez al día, por la mañana). Hace falta la variable de entorno
`TEMAS_ROBOT` (la misma clave que en Vercel → Settings → Environment Variables → `TEMAS_ROBOT`).

## Pasos

1. **Publicadas**: `node temas-profe/robot.mjs lista /tmp/peticiones`.
   Para cada petición de `/tmp/peticiones/preparadas.json` cuyo `peticion` ya esté en `temas-profe/indice.json` de `main`
   (es decir, su PR ya se ha juntado), ejecuta `node temas-profe/robot.mjs publicada <id>`.
2. **Si no hay peticiones aprobadas, termina** (no abras PR).
3. Para cada carpeta `/tmp/peticiones/<id>/` (máximo 3 por mañana; las demás, al día siguiente):
   - Lee `peticion.json` (curso, asignatura, tema, titulo, apartados, alumnado, notas, texto, nota del admin) y mira **todas** las fotos.
   - Elige el id del tema: el siguiente libre de `x1…x99` (luego `y1…y99`, `z…`, `w…`, `v…`, `u…`) mirando `indice.json`.
   - Escribe `temas-profe/<temaId>.js` con el formato de `temas-profe/x1.js` (el tema de ejemplo) y del motor de FP Básica
     (`fpb/fpb.js`, `fpb/sociales-temas.js`, `fpb/sociales-banco.js`).
   - Añade su línea a `temas-profe/indice.json`: `{id, profe, curso, asignatura, tema, titulo, archivo, peticion: <id de la petición>, creado: "AAAA-MM-DD"}`.
   - Si las fotos no se leen o no hay material suficiente: `node temas-profe/robot.mjs error <id> "<qué falta>"` y sigue con la siguiente.
4. `node temas-profe/comprobar.mjs` tiene que salir **sin errores** (arregla los avisos que puedas).
5. Prueba en local: `node qa/servidor-prueba.mjs . 8790` y abre `#fpb-<temaId>` y un apartado en los 3 niveles (como admin todo se ve).
6. Un solo PR con todos los temas de la mañana, en una rama `claude/temas-profe-AAAA-MM-DD`, título
   «Temas de profes: <asignatura> <curso> tema N…». En el cuerpo: profe, petición y qué apartados tiene cada tema.
7. Para cada tema del PR: `node temas-profe/robot.mjs preparada <id> <temaId> temas-profe/<temaId>.js <url del PR>`
   (esto **borra las fotos** del servidor). No guardes las fotos en el repositorio.

## Cómo tiene que ser el tema

- **Con palabras nuestras**: resume y explica, no copies el libro. Solo se copia tal cual un texto corto si la actividad lo necesita (un poema, una cita).
- **Apartados**: los de la petición; si no vienen, los del libro (los títulos de las fotos). Entre 3 y 8.
- Cada apartado: `ic`, `titulo`, `idea` (una frase), `reglas` (3-6, frases cortas, palabras clave en `<b>`), `glosario`, `ejemplos` resueltos con `pasos` y `ojo` (el error típico).
- **Actividades** (`banco.manual[apartado]`): 8 o más por apartado, de los 3 niveles: nivel 1 con 2 opciones, nivel 2 con 3, nivel 3 con 4 opciones o relacionar (`REL`) y clasificar (`CLA`).
  Cada una con al menos 3 pistas de menos a más (`pi`), el porqué de cada opción mala (`p`) y «así se hace» (`r`).
  Las actividades del libro que salgan en las fotos, adaptadas a tocar (nada de escribir).
- `banco.parejas`: 2-4 parejas por apartado (para «Parejas en equipo»).
- **Alumnado** (`alumnado` de la petición, claves de `LYATemasProfe.DIFICULTADES`):
  - `facil`, `nee`: lectura fácil (frases de menos de 15 palabras, una idea por frase, nada de dobles negaciones), más ejemplos y más nivel 1.
  - `tdah`: enunciados muy cortos, una sola tarea por actividad, la palabra clave en negrita.
  - `dislexia`: frases cortas, opciones cortas y bien distintas entre sí.
  - `idioma`: vocabulario básico y glosario más largo.
  - `dibujos`: usa `img` con SVG sencillo hecho a mano o imágenes de Wikimedia Commons.
  - `normal`: nivel del curso, con más problemas de nivel 3.
  - Lo que diga `notas` (del profe) y `nota` (del admin) va por delante de todo esto.
- **Metodología** (`metodologia`): úsala para el enfoque. Gamificación: retos, puntos y una pequeña historia en los enunciados. Cooperativo: actividades pensadas para hacer en pareja o en equipo y parejas para el juego. ABP: un problema real que recorre el tema. Clase invertida: explicación corta para casa y más práctica. Paso a paso: más `ejemplos` y `guia`. DUA: la misma idea explicada de varias formas (texto, dibujo y ejemplo).
- **Tipos de actividad** (`actividades`): haz sobre todo los que pide. Test → `E` · Unir con flechas → `REL` · Clasificar → `CLA` · Completar huecos → `E` con la frase con «___» en el enunciado y las palabras como opciones · Verdadero o falso → `E` con `["Verdadero", "Falso"]` · Problemas paso a paso → `E` con `guia` · Con dibujos → `img` (SVG hecho a mano o Wikimedia Commons).
- **Juegos** (`juegos`): «¿Quién sabe más?» y «En la pizarra» usan las preguntas de elegir; «Parejas en equipo» usa `banco.parejas` (pon 3 o más por apartado si lo pide). Si hay `juegoOtro`, apúntalo en el cuerpo del PR como propuesta (no se construye solo).
- **Adaptar para todo su alumnado** (`adaptarClase` y `difsClase.dif`, p. ej. `{tdah: 2, dislexia: 1}`): crea `adaptado[<clave>]` para cada dificultad de `difsClase.dif` (menos `normal`). Cada versión lleva solo lo que cambia:
  `{tema: {intro?, aps: [{n, idea?, reglas?, glosario?, ejemplos?, ojo?}]}, banco: {manual: {<apartado>: [actividades]}}}` (un apartado de `manual` sustituye entero al normal; mínimo 3 actividades y mejor 6).
  Cada alumno con esa dificultad lo verá así si su profe tiene marcado «Temas» en «¿Qué se le adapta?». El modelo está en `temas-profe/x1.js` (versión `tdah`).
  Sin `adaptarClase`, `adaptado: {}`.
- Nada de `<script>`, `on…=` ni enlaces fuera de Wikimedia Commons (`comprobar.mjs` lo revisa).
- Mates con números: el motor es de tocar, así que los cálculos van como «elige el resultado» con opciones bien pensadas (errores típicos como opciones malas).
