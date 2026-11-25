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
