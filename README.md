# COMPRENDO

Web: https://comprendo-dusky.vercel.app

Web de lecturas para aprender idiomas, con cuentas de usuario.

## Cómo funciona
- Web estática (`index.html`, `content/`, `art/`, `juegos/`, `mascota/`, `voz.*`, `cuentas.*`).
- `api/`: funciones de Vercel para las cuentas (usuario + contraseña) y para guardar el progreso.
  - `POST /api/registro` · `POST /api/entrar` · `POST /api/salir` · `GET|PUT /api/progreso` · `GET /api/estado`
  - Contraseñas guardadas con scrypt y sal (nunca en claro). Sesión con token aleatorio de 90 días.
  - Máximo 20 intentos de entrar cada 15 minutos por conexión.
  - `POST /api/propuestas`: «Propón un tema para una lectura» (caja en la portada). `GET /api/admin`: panel del administrador.
  - `GET|POST /api/votos`: votar el próximo tema.
- **Administrador**: usuario `admin`. Contraseña = variable `ADMIN_CLAVE` de Vercel (si no existe, `admin`). Entra con «Entrar» y en su cuenta sale «Panel de administración»: propuestas, usuarios (XP, racha, lecturas, cromos, medallas, palabras) y votos.
- Base de datos: **Upstash Redis** (gratis), conectada desde Vercel → Storage. Vercel crea solo las variables `KV_REST_API_URL` y `KV_REST_API_TOKEN`.
- Sin cuenta, la web funciona como invitado y guarda en el navegador.
- «Copia de mi progreso» (botón de la cuenta o 💾): exportar e importar el progreso como texto.

## Navegación (nav/)
- 5 apartados en una barra (abajo en el móvil, como una app; arriba en el ordenador). Las etiquetas salen en el idioma que el alumno ya sabe.
  - 🏠 **Inicio** (`#inicio`): deberes pendientes (al tocarlos se abre la actividad), «Sigue donde lo dejaste» (última lectura y última actividad) y la semana (racha, XP de la semana en `S.g.wk`, nivel).
  - 📖 **Aprender** (`#aprender`, también `#lecturas` y `#nivel-a1…b2`): dictados, cámara, canciones, vídeos con preguntas, doblaje, pronunciación y las lecturas por nivel.
  - 🎮 **Practicar** (`#practicar`, igual que `#juegos`): vocabulario (diccionario y flashcards), gramática y verbos, y mini-juegos.
  - 🏫 **En grupo** (`#grupo`): «Entrar con código» (busca el código en concursos, vídeos en directo, duelos, escape room y Garabatos) y crear sala.
  - 📚 **Mi zona** (`#mizona`): diccionario, palabras de canciones, flashcards, mascota, logros y progreso, historial de deberes.
  - 👩‍🏫 **Profe** (`#profe`, solo profes y admin): mis clases, crear actividad, actividades creadas, deberes, resultados, fallos y mensajes (abre el panel del profe en la pestaña que toca).
- Arriba siempre: 🔍 buscador de palabras (también con la tecla «/»; las palabras añadidas salen en el diccionario como «🔍 Palabras buscadas»), 🌐 idioma, 🔥 racha y la cuenta.
- Las direcciones antiguas (`#juegos`, `#duelo`, `#canciones`, `#deberes`…) siguen funcionando; cada pantalla marca su apartado.

## Dictados
- Pestaña «✍️ Dictados» (`dictados/`): la web lee una frase de una lectura (voz del navegador) y el alumno la escribe. Corrección palabra a palabra sin IA: bien, tilde, mayúscula, mal escrita (letras marcadas), falta, sobra y puntuación. Botones Escuchar, Más lento y Por partes. 5 frases por dictado, XP por frase y premio al terminar.
- Progreso en `S.g.dc[lectura]` (se guarda con la cuenta). Si el alumno dijo que no puede escuchar, explica que hace falta sonido.
- El profe puede mandar un dictado como deber (`dictado-<lectura>`) desde el panel.

## Profes y clases
- Al crear la cuenta se elige el curso (qué idioma aprender), si eres **alumno** o **profe**, y (alumno) el código de clase opcional.
- El profe crea sus clases con un código en «Mi cuenta → Panel del profe → Mis clases». Ve solo a sus alumnos: resumen, detalle por lectura, deberes con fecha, fallos, mensajes, Excel y cambio de contraseña.
- El alumno se une o cambia de clase en «Mi cuenta» con el código.
- El admin lo ve todo, y además borra usuarios, aprueba propuestas (pasan a la votación) y gestiona los temas de la votación.
- API: `GET|POST /api/admin` (admin y profes, según quién), `GET|POST /api/avisos` (alumno: su clase, mensajes, deberes, unirse a una clase).
- Límites: 10 contraseñas mal seguidas por usuario y conexión (15 min); 100 cuentas nuevas por hora y conexión (una clase entera puede registrarse a la vez).

## Lectura con cámara (camara/)
- Pestaña «📷 Cámara» (`#camara`): el alumno hace una foto (o elige una) de un cartel, menú o etiqueta en el idioma que aprende. **Tesseract.js** la lee dentro del navegador (OCR gratis, sin IA de pago): la foto no se sube a ningún sitio. La primera vez se descargan el programa y el modelo del idioma desde cdn.jsdelivr.net.
- El texto leído se puede corregir a mano. Tocar una palabra muestra la traducción con el diccionario de la web y se puede guardar (`r: "camara"`, sale en «Mi diccionario» como «📷 Palabras de fotos»).
- 6 preguntas con reglas: qué significa (4 opciones), toca la palabra que significa…, toca la palabra…, ordena la frase. XP con `lya:xp` (src `camara`).
- «Próximamente» (`pronto/`): explica lo que aún no está hecho (doblaje). La pestaña se esconde sola cuando existe `window.LYADoblaje`.

## Canciones de YouTube (canciones/)
- Pestaña «Canciones»: se pega un enlace de YouTube, el vídeo se ve en la web con la letra, y se para en cada hueco hasta escribir la palabra. 4 niveles. Da XP y estrellas (`S.g.cn`).
- `GET /api/canciones?v=<vídeo>&lang=es`: el servidor coge los subtítulos de YouTube (los del autor o los automáticos) y los devuelve con sus tiempos. **No se guardan.**
- Si YouTube no da los subtítulos (a los servidores de Vercel suele bloquearlos), el servidor busca la canción por el título del vídeo en **LRCLIB** (lrclib.net: letras sincronizadas, gratis y sin clave) y la usa con el vídeo. Botones «Antes / Después» para ajustar si la letra va adelantada o atrasada.
- `GET /api/canciones?q=artista canción`: buscar la letra por su nombre (hasta 5 resultados). También se puede pegar la letra (texto, LRC o SRT).
- Profes: «Mandar como deberes» guarda esa canción para su clase (`cancion:<id>`, caduca a los 180 días y se borra al quitar el deber). Es lo único que se guarda.
- Prueba: `qa/prueba-canciones.js`.

## Publicar
1. Importar este repositorio en Vercel (Framework: Other, sin build).
2. Storage → Upstash (Redis) → conectar al proyecto.
3. Settings → Environment Variables → `ADMIN_CLAVE` = una contraseña para el admin.
4. Redeploy. Comprobar que `/api/estado` dice `"db": true`.

## Probar en local
`node qa/servidor-prueba.mjs <carpeta> 8790` (simula Vercel y la base de datos) y `qa/prueba-cuentas.js`.

## Flashcards (fichas/)
- En «Mi diccionario»: «Álbum de flashcards» (#fichas). Cada palabra puede tener su tarjeta con un dibujo, un emoji o una imagen de internet (pegar enlace, Pixabay o Wikimedia Commons). De internet solo se guarda el enlace.
- Álbum: 2 páginas abiertas de 4 cartas; se pasa página con las flechas, los puntos, deslizando o con el teclado. Tocar una carta la abre en grande; tocar su imagen la cambia.
- Tocar una palabra del diccionario abre su carta: delante la imagen; detrás traducción, definición, la frase de la lectura, «lo bien que te la sabes» y «Repasar esta palabra».
- «Jugar»: repaso espaciado (1, 3, 7, 14, 30 y 60 días; la que fallas vuelve hoy), «¿Qué es?» (ves la imagen y escribes la palabra) y «Dibújalo» (dibujas la palabra; si ya tenía imagen, eliges la antigua o la nueva). Todo da XP.
- Las tarjetas van en el progreso (`S.fc`). Los dibujos (≈2-8 KB) van aparte: en el aparato y, con cuenta, en `api/dibujos` (máx. 2000 por cuenta), así el progreso no crece.
- **Pixabay**: crea una cuenta gratis en https://pixabay.com/api/docs/, copia tu clave y ponla en Vercel → Settings → Environment Variables → `PIXABAY_KEY`, y haz Redeploy. Sin clave, la web avisa de que Pixabay no está activado (enlace y Wikimedia funcionan igual). Las búsquedas usan «safesearch» y se guardan 24 h.
- Prueba: `qa/prueba-fichas.js <url> [carpeta-capturas]` (con `servidor-prueba.mjs` prueba también la cuenta y otro dispositivo).

## Duelos en directo (duelo/)
- Pestaña «⚔️ Duelo» (`#duelo`, sala en `#duelo-<código>`). Hace falta cuenta.
- Crear: idioma del curso (español, inglés, catalán), nivel y lectura; tiempo por pregunta y para leer, y si se puede mirar el texto. Sale un **código de 6 cifras**; los demás lo escriben para unirse. **Máximo 30 jugadores.**
- Fases: sala de espera → lectura (con cuenta atrás; el anfitrión puede saltarla) → preguntas de la lectura con botones de colores → solución con reparto de respuestas y clasificación → podio. Acertar rápido da más puntos (500-1000). Si contestan todos, se pasa sola a la solución.
- **Profe**: puede no jugar (su pantalla es la «pantalla grande» para el proyector, con la tabla pregunta a pregunta al final), elige los XP (para todos y para los 3 primeros, máx. 200) y un logro opcional (icono + nombre) para el ganador, los 3 primeros o todos. **Alumno**: solo tiempos y texto; premio fijo (10 XP por jugar y 30/20/15 para el podio). El anfitrión puede sacar a alguien de la sala.
- Progreso en `S.g.du = {n, w, tr: [logros]}`; los logros se ven en la pestaña Duelo.
- `api/duelo.js`: toda la mesa en **una clave** de Upstash (hash `duelo:<código>`, caduca a las 3 h). El estado (`GET ?c=`) es igual para todos y Vercel lo guarda 1 s en su CDN (`Vercel-CDN-Cache-Control`), así que con 5 o con 30 jugadores Upstash recibe como mucho ~1 lectura por segundo. Contestar = 2 operaciones. Un duelo de toda la clase gasta del orden de 1.000 operaciones (el plan gratis da 500.000 al mes).
- Las soluciones las saca el servidor del archivo de la lectura (`includeFiles` en `vercel.json`); no se ven hasta que se cierra cada pregunta.
- Pruebas: `node qa/prueba-duelo-api.mjs http://localhost:8790` y `node qa/prueba-duelo.mjs http://localhost:8790 [capturas]` (con `qa/servidor-prueba.mjs`, que ya entiende los rewrites y los comandos H* de Redis).

## Escape room de clase (escape/)
- Pestaña «🔐 Escape room». El profe crea una sala en la pizarra (idioma, nivel, lectura, nº de equipos y minutos) y sale un código de 6 cifras. Los alumnos entran con el código en el móvil, escriben su nombre y eligen equipo. No hace falta cuenta.
- Al empezar, cada miembro del equipo ve una parte distinta: trozos de la lectura, preguntas, las respuestas con símbolos (🔺🔵⭐), principios y finales de frase, y los números del candado final. Solo hablando (en el idioma que aprenden) pueden abrir los candados.
- 4 candados de preguntas (`R.q`) + 1 de «frases rotas» (`R.halves`) + candado final con los 5 números. Un fallo congela el candado 15 s y suma 30 s. Funciona con las 135 lecturas (es, en, ca). Sin IA: todo sale de la lectura, con la misma semilla en todos los móviles.
- La pizarra enseña el código, los equipos, los candados abiertos y la clasificación. El profe puede quitar a alguien antes de empezar.
- Servidor: `api/_escape.js` (módulo, no cuenta como función), montado en `api/propuestas?escape=1`. Claves `esc:<código>`, `esc:<código>:j` y `esc:<código>:e`, caducan a las 4 h. El GET del estado lleva caché de Vercel de 1 s: toda la clase comparte una lectura de Upstash por segundo.
- Prueba: `qa/prueba-escape.js <url> [carpeta] [en|es|ca]` con `servidor-prueba.mjs` (1 pizarra y 4 alumnos).
## Concursos (concursos/)
- Pestaña «🏆 Concursos»: preguntas tipo test para jugar en clase. La pregunta se ve en la pantalla grande (proyector) y cada alumno contesta desde su móvil; cuanto antes acierta, más puntos (500 por acertar + hasta 500 por rapidez + racha). Ranking entre preguntas y podio al final. También se puede jugar solo.
- **Crear con IA**: la web da un prompt (con número de preguntas, idioma, nivel y notas) para copiar en cualquier IA (ChatGPT, Claude, Gemini…) junto con la foto de la página del libro o un texto. Lo que responde la IA se pega en «Pega aquí lo que te responda la IA» y salen las preguntas, que se pueden corregir en el editor. Formato en `concursos/formato.js` (TÍTULO / PREGUNTA / A) B) C) D) / CORRECTA / TIEMPO); acepta lo que suelen añadir las IA (negritas, bloques de código, «1.», «a)», ✅…).
- Con cuenta se guardan en Upstash (`concurso:<id>`, índice `concursos:<usuario>`, máx. 100 por cuenta, ~2-5 KB cada uno); cualquiera puede abrirlos con el enlace y guardarse una copia. Sin cuenta se guardan en el aparato y se pueden subir al entrar.
- En directo: `api/concursos` abre una partida con código de 6 cifras (máx. 30 jugadores, caduca a las 4 h). Los móviles consultan el estado cada 1-2 s y Vercel comparte esa respuesta 1 s entre todos, así que una partida de 30 alumnos gasta del orden de 2.000 operaciones de Upstash. El tiempo de cada respuesta lo mide el servidor.
- `api/votos` ahora vive en `api/_votos.js` y se sirve desde `api/propuestas?votos=1` (y una redirección en `vercel.json`), para no pasar del máximo de funciones de Vercel.
- Pruebas: `qa/prueba-concursos-api.mjs` (API) y `qa/prueba-concursos.cjs` (navegador: crear, editar, jugar solo y partida con 3 móviles).

## Garabatos: dibuja y adivina en grupo (garabatos/)
- En «Juegos» → «Garabatos» (#garabatos). Uno crea una sala (código de 6 cifras, enlace #garabatos-<código>, máx. 30) y los demás se unen con su nombre, sin cuenta.
- Por turnos, al que dibuja le salen 3 palabras del idioma del curso y del nivel elegido (con su traducción) y elige una; los demás escriben lo que creen que es. Vale sin tildes o con artículo; «¡Casi!» si falla una letra. Pistas: se descubren letras al pasar el tiempo.
- Puntos: acertar antes da más (100-500, +50 el primero); quien dibuja gana 60 por cada acierto. XP al acertar y al terminar. El anfitrión elige nivel, rondas, tiempo y, si quiere, sus propias palabras.
- El dibujo se manda en tandas cada segundo y se vuelve a pintar poco a poco en los demás. El estado lo comparte la caché de Vercel durante 1 s (30 jugadores gastan casi como 2). Unos 300-400 comandos de Upstash por turno.
- API dentro de `api/dibujos.js` (no gasta otra función): código en `api/_garabatos.js`, palabras en `api/_garabatos-palabras.js`.
- Pruebas: `qa/prueba-garabatos-api.mjs` y `qa/prueba-garabatos.cjs` (3 navegadores a la vez).

## Vídeos con preguntas (videos/), Actividades creadas y Deberes
- Pestaña «📺 Vídeos»: un vídeo de YouTube que se para en ciertos momentos y no sigue hasta contestar. Preparados por nosotros (`videos/preparados.js`, con los tiempos sacados de los subtítulos del vídeo) y creados por los profes: pegar el enlace, ir al momento y «➕ Añadir pregunta aquí». Se guardan con los concursos (`concurso:<id>` con `tipo: "video"`, `v` = id de YouTube y `t` = segundo de cada pregunta).
- A solas (`#video-solo-<id>`): se para en cada pregunta (si alguien adelanta el vídeo, la pregunta sale igual). Resultado en `S.g.ac[id]`.
- En directo, con la misma sala que los concursos (código de 6 cifras, `api/concursos`). Antes de lanzar, el profe elige:
  - 📺 **Proyección**: el vídeo en la pantalla grande; a los móviles solo les sale la pregunta cuando el vídeo se para (puntos por rapidez, resultado y ranking, y sigue el vídeo).
  - 📱 **Individual**: cada uno ve el vídeo en su móvil y se para solo en cada pregunta (1000 puntos por acierto). El profe ve el progreso de cada alumno y acaba cuando todos han terminado (o pulsa «Terminar»).
  - ⏱ Tiempo para **leer antes todas las preguntas** (no, 30 s, 1 o 2 min).
- **Avisar a la clase**: al abrir la sala el profe elige su clase; la sala se anuncia en `csclase:<clase>` y los alumnos que tienen abierta la web entran solos desde «Deberes». Ellos preguntan cada 5 s a `api/concursos?aviso=<clase>`, que Vercel guarda 4 s y comparte entre toda la clase.
- **Actividades creadas** (Panel del profe): concursos, vídeos con preguntas, canciones mandadas, los preparados por COMPRENDO (y los doblajes cuando lleguen). Cada uno se prueba, se juega en directo o se manda como deberes: «🏠 cada uno en casa» o «🔴 en clase, en directo».
- **Deberes del alumno**: caja en la portada y página `#deberes` (pestaña «📚 Deberes»). Tocar un deber abre directamente la actividad (lectura, dictado, canción, concurso, vídeo; doblaje en `#doblaje-e-<id>`).
- Deberes de actividades en `admin:deberes`: `{lectura: "actividad", actividad, tipo: quiz|video|doblaje, titulo, directo}`. El profe ve quién lo ha hecho con `S.g.ac`.
- Código compartido en `actividades.js` (mandar como deberes, avisar a la clase, guardar el resultado, entrar solo en la sala).
- Pruebas: `qa/prueba-videos-api.mjs` (API) y `qa/prueba-videos.cjs` (navegador, con un YouTube simulado: crear, mandar, entrar solo, individual, proyección, a solas y Actividades creadas).
