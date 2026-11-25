# Comprobación de la web tras cada publicación

Script: `comprobar-web.js` (puppeteer-core + Chrome headless).

1. Copiar `/mnt/project-files/web/` a una carpeta local y servirla: `python3 -m http.server 8765`
2. `npm i puppeteer-core@23` en una carpeta aparte y ejecutar `node comprobar-web.js http://localhost:8765/index.html`
3. Revisa: tarjetas listas por nivel, cada lectura abre (título, nº de palabras tocables, preguntas, gramática), tocar una palabra muestra traducción + definición, responder una pregunta funciona, el diccionario abre, y la lista de ERRORES (404, errores de JavaScript).
4. Añadir los ids de las lecturas nuevas a la lista IDS del script.
Además, para comprobar que todas las palabras tienen definición y traducción, usar el comprobador de palabras (ver hilo de lecturas).

## Diccionario y modos de repaso
`comprobar-diccionario.js` (playwright, `NODE_PATH=/opt/node22/lib/node_modules node comprobar-diccionario.js http://localhost:8766/index.html`): toca y guarda una palabra, añade el vocabulario clave, juega los modos Test, Completar y Escribir, prueba la ayuda y los acentos, y cuenta los eventos de XP (`lya:xp`).

## Voz, karaoke y grabarse (voz.js / voz.css)
`node comprobar-voz.js http://localhost:8765/index.html 420` (420 = ancho de pantalla). Simula la voz del navegador y revisa: frases marcadas en la lectura, el karaoke avanza y aguanta un re-render (responder una pregunta mientras suena), botón de altavoz en la burbuja de palabra, y grabar con el móvil (subida de audio). Debe acabar en «ERRORES: ninguno».

## Puntos, racha, cromos y medallas
- `prueba-progreso.js`: completa dos lecturas y comprueba XP, cromos, medallas, eventos `lya:xp`, escudo y racha, y la página #progreso en móvil.
- `prueba-palabra-xp.js`: guarda una palabra desde el tooltip y comprueba que da XP.
Se ejecutan igual: `node <script> http://localhost:8765/index.html`.

## Mini-juegos
`comprobar-juegos.js` (mismo montaje): `node comprobar-juegos.js http://localhost:8765/index.html /tmp/capturas`
Revisa la pestaña «Juegos», la oferta al final de una lectura, la sala, una partida completa de cartas, el contrarreloj en marcha y el ahorcado, y que se emiten los eventos `lya:xp`. Guarda capturas (escritorio y móvil) en la carpeta indicada.

## Mascota y colores de la web (mascota/)
`prueba-mascota.js` (mismo montaje): `node prueba-mascota.js http://localhost:8765/index.html /tmp/capturas`
Revisa la pestaña «Mi mascota», la tarjeta de la portada, elegir mascota, probar y comprar ropa con puntos (S.g.spent), ponerse/quitarse, colores claro/neón, el nombre, que todo se conserva al recargar, el ánimo de la mascota al acertar, el enlace en #progreso, el móvil y que en A2 solo sale el idioma que se aprende.
Nota: con cuentas.js, un 404 de `api/estado` sin servidor es esperado mientras no haya /api.
`comprobar-remix.js`: Remix con «Las que no sé» / «Todas» y varios tipos de pregunta mezclados.

## Votar el próximo tema (votos/)
`prueba-votos.js`: `node prueba-votos.js <url> /tmp/capturas`. Sin servidor: votos solo en el aparato, sin recuento. Con servidor (`node servidor-prueba.mjs <web+api> 8790`): recuento, un voto por tema y aparato (`api/votos`). En la web de Claude los votos van a la base de datos del artefacto (`votos/<id>`).
Sin servidor, los 404 de `api/estado` y `api/votos` son esperados.

## Cuentas, propuestas y admin (web en Vercel)
Servidor de prueba que imita Vercel y la base de datos: `sh vercel/montar.sh /tmp/site` y `node qa/servidor-prueba.mjs /tmp/site 8790`.
- `prueba-cuentas.js <url> [url-sin-servidor]`: invitado con progreso antiguo de BEAR → crear cuenta llevando el progreso → otro dispositivo entra y lo ve → contraseña mala, usuario repetido → copia (exportar/importar) → salir.
- `prueba-admin.js <url> [clave-admin]`: «Propón un tema» (invitado y con cuenta), nadie puede crear la cuenta admin, panel de admin (propuestas, usuarios, votos, borrar).
Ambos con `NODE_PATH=/opt/node22/lib/node_modules`.

## Estrellas por lectura y relectura
`prueba-estrellas.js <url>`: hace BEAR A1 con fallos (1 estrella), «Volver a leer», la repite perfecta (3 estrellas, 2 veces), mira las estrellas bajo las tarjetas, los logros de 3 estrellas (tema, nivel, todo) en #progreso y el curso de inglés. Los datos van en `S.g.rd` (por lectura) y `S.g.ach` (logros, con el idioma delante), así que se guardan en la nube con cuentas.js.
Nota: `prueba-mascota.js` a veces falla en la línea 35 («Node is detached») por tiempos; al repetirlo pasa.
- `prueba-admin2.js <url>`: clases, deberes (el alumno los ve), mensajes (salen al entrar), fallos, aprobar propuesta → votación, Excel, cambiar contraseña (cierra sesión), borrar usuario.
- `prueba-profe.js <url>`: idioma y rol al crear la cuenta, profe crea clase con código, alumnos se unen (al registrarse y desde Mi cuenta), cada profe solo ve a los suyos, deberes del profe, el admin lo ve todo.

## Flashcards (fichas/)
`prueba-fichas.js <url> [carpeta]` (playwright; con servidor-prueba.mjs también prueba la cuenta): crear tarjetas con dibujo, emoji, enlace, Wikimedia y Pixabay (simulados), álbum (2 páginas de 4, flechas, teclado, deslizar), carta en grande, tocar palabra del diccionario, repaso espaciado, «¿Qué es?», «Dibújalo» (antigua o nueva), XP y dibujos en la nube.

## Doblaje (doblaje/)
`prueba-doblaje.mjs`: `node qa/servidor-prueba.mjs /ruta/absoluta/al/repo 8790` y `NODE_PATH=/opt/node22/lib/node_modules node qa/prueba-doblaje.mjs http://localhost:8790 [capturas]`.
Simula YouTube y usa el micrófono falso de Chrome. Revisa: escena pegada con «NOMBRE: frase», marcar tiempos tocando, el profe la manda a la clase,
dos alumnos la ven en sus deberes, graban (vídeo en silencio, frases iluminadas), ven su doblaje (su voz suena), lo mandan a la votación,
votan (no a sí mismos), el profe lo ve hecho en su panel, y una canción con la letra automática.
