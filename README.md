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
- Prueba: `qa/prueba-canciones.cjs`.

## Publicar
1. Importar este repositorio en Vercel (Framework: Other, sin build).
2. Storage → Upstash (Redis) → conectar al proyecto.
3. Settings → Environment Variables → `ADMIN_CLAVE` = una contraseña para el admin.
4. Redeploy. Comprobar que `/api/estado` dice `"db": true`.

## Probar en local
`node qa/servidor-prueba.mjs <carpeta> 8790` (simula Vercel y la base de datos) y `qa/prueba-cuentas.cjs`.

## Flashcards (fichas/)
- En «Mi diccionario»: «Álbum de flashcards» (#fichas). Cada palabra puede tener su tarjeta con un dibujo, un emoji o una imagen de internet (pegar enlace, Pixabay o Wikimedia Commons). De internet solo se guarda el enlace.
- Álbum: 2 páginas abiertas de 4 cartas; se pasa página con las flechas, los puntos, deslizando o con el teclado. Tocar una carta la abre en grande; tocar su imagen la cambia.
- Tocar una palabra del diccionario abre su carta: delante la imagen; detrás traducción, definición, la frase de la lectura, «lo bien que te la sabes» y «Repasar esta palabra».
- «Jugar»: repaso espaciado (1, 3, 7, 14, 30 y 60 días; la que fallas vuelve hoy), «¿Qué es?» (ves la imagen y escribes la palabra) y «Dibújalo» (dibujas la palabra; si ya tenía imagen, eliges la antigua o la nueva). Todo da XP.
- Las tarjetas van en el progreso (`S.fc`). Los dibujos (≈2-8 KB) van aparte: en el aparato y, con cuenta, en `api/dibujos` (máx. 2000 por cuenta), así el progreso no crece.
- **Pixabay**: crea una cuenta gratis en https://pixabay.com/api/docs/, copia tu clave y ponla en Vercel → Settings → Environment Variables → `PIXABAY_KEY`, y haz Redeploy. Sin clave, la web avisa de que Pixabay no está activado (enlace y Wikimedia funcionan igual). Las búsquedas usan «safesearch» y se guardan 24 h.
- Prueba: `qa/prueba-fichas.cjs <url> [carpeta-capturas]` (con `servidor-prueba.mjs` prueba también la cuenta y otro dispositivo).

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
- 4 candados de preguntas (`R.q`) + 1 de «frases rotas» (`R.halves`) + candado final con los 5 números. Un fallo congela el candado 15 s y suma 30 s. Funciona con todas las lecturas (es, en, ca; hoy 181). Sin IA: todo sale de la lectura, con la misma semilla en todos los móviles.
- La pizarra enseña el código, los equipos, los candados abiertos y la clasificación. El profe puede quitar a alguien antes de empezar.
- Servidor: `api/_escape.js` (módulo, no cuenta como función), montado en `api/propuestas?escape=1`. Claves `esc:<código>`, `esc:<código>:j` y `esc:<código>:e`, caducan a las 4 h. El GET del estado lleva caché de Vercel de 1 s: toda la clase comparte una lectura de Upstash por segundo.
- Prueba: `qa/prueba-escape.cjs <url> [carpeta] [en|es|ca]` con `servidor-prueba.mjs` (1 pizarra y 4 alumnos).
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
- **✨ Proponer preguntas con IA** (en el editor, sin API de IA, como en los concursos; `videos/ia.js`): la web pide los subtítulos del vídeo con sus tiempos (`api/canciones?v=…&yt=1`, solo YouTube, sin buscar letras de canciones). Si YouTube no los da, el profe pega la transcripción («…más» → «Mostrar transcripción»; también vale SRT/VTT). Con ella arma un prompt para copiar en cualquier IA, que responde con `MOMENTO: m:ss` en cada pregunta. Al pegar la respuesta, cada pregunta se pone al final de la frase de los subtítulos donde se dice la respuesta, y el profe la puede cambiar. Las que vienen sin MOMENTO se reparten por el vídeo y se avisa.
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
- Pruebas: `qa/prueba-videos-api.mjs` (API), `qa/prueba-videos-ia.mjs` (leer transcripciones y respuestas de la IA) y `qa/prueba-videos.cjs` (navegador, con un YouTube simulado: crear, mandar, entrar solo, individual, proyección, a solas, Actividades creadas y proponer con IA).

## Valencià C1 (lectura de fitxa)
- «La cuina del rap» (`content/ca/lecturas/va-rap-c1.json`), tema «Valencià» (`valencia` al catàleg), nivell **C1**, només al curs de català. Font: J. M. Campos, *La cuina del rap* (adaptació), Llengua catalana i Literatura 1r ESO, Grup Promotor / Santillana (material fotocopiable).
- El nivell C1 només surt als cursos que tenen lectures C1 (inici, duel, escape room i dictats).
- Preguntes amb format propi a `q[i][3]` (les de la fitxa): `t: "open"` resposta escrita amb correcció orientativa (paraules clau `k`, `min`; si no hi són, l'alumne compara amb la resposta orientativa `a`), `t: "mc"` (amb `just` = justificació), `t: "vf"` (afirmacions C/F a `items`). `q[i][0..2]` continua sent el test de 3-4 opcions que fan servir els jocs. `ev` = frase-prova del text per a cada pregunta.
- `tr.es.text`: traducció de cada paràgraf (botó «Mostra la traducció»). `font`: font citada sota el text.
- «Juga en grup» a cada lectura: duel, escape room i `#concursos-lectura-<id>` (crea un concurs amb les preguntes de la lectura).
- Generador: `/mnt/project-files/build/valencia/rap_c1.py` i `merge.py` (diccionari).

## Retos en grupo (retos/)
- Cinco juegos de clase en «En grupo», con sala y código como el escape room. Funcionan con **todas** las lecturas sin preparar nada a mano:
  - 🔎 **Encuentra la prueba** (`#reto-prueba`): pregunta o definición en la pizarra; se toca la frase (o la palabra) del texto que la responde. Más puntos al más rápido, 3 s bloqueado si fallas y mapa de calor de dónde ha tocado la clase. Individual o por equipos.
  - 🎲 **Atrapa los puntos** (`#reto-apuesta`): afirmaciones verdadero/falso sacadas de las preguntas (respuesta buena = verdadero, una mala = falso). Saldo de 1000 y apuesta; si el equipo toca la frase que lo demuestra, gana el doble.
  - 🃏 **Cartas a la mesa** (`#reto-cartas`): texto con huecos de palabras clave, repartidas como cartas entre los móviles del equipo; 2 cartas trampa y un comodín (primera letra y quién tiene la carta).
  - 🤐 **Palabra secreta** (`#reto-tabu`): el guía (va rotando) explica una palabra clave sin decir las prohibidas (sacadas de su definición); los demás la tocan en el texto; botón «¡Tabú!».
  - 🧭 **Lector y piloto** (`#reto-piloto`): lectores solo ven el texto, pilotos solo los retos (las preguntas); máximo 3 preguntas por reto (menos preguntas, más puntos); a mitad se cambian los papeles.
- Datos: `content/<idioma>/retos.json`, generados con `node retos/generar.mjs` (sin IA): frases de cada lectura, la frase que demuestra cada pregunta, palabras clave con definición y prohibidas, y trampas. **Volver a ejecutarlo al añadir o cambiar lecturas.**
- Servidor: `api/_retos.js`, montado en `api/propuestas?retos=1` (no gasta otra función de Vercel). Rutas: `#reto-<código>` (alumno) y `#reto-pizarra-<código>` (pizarra).
- Quien crea la sala puede jugar también: casilla «Voy a jugar yo también» (marcada por defecto si no es profe; el profe por defecto solo lleva la pizarra y tiene «Jugar yo también»). Si juega, lleva en su móvil los botones de la pizarra (empezar, siguiente, terminar).
- Pruebas: `qa/prueba-retos.cjs` (pizarra + 3 alumnos, los 5 juegos) y `qa/prueba-retos-creador.cjs` (el creador juega).

## Portada del profe (profe/)
- Un profe (o el admin) que entra en **Inicio** va a **#profe**, su portada (no ve la del alumno). Con «👀 Ver la web como un alumno» ve la web normal (en esta pestaña) con una banda para volver.
- **#profe**: elegir clase (y su código), accesos rápidos (mandar deberes, crear concurso, jugar en clase, mates en grupo, mensaje), tarjetas (alumnos y cuántos han entrado esta semana, XP de la semana, % de deberes hechos, lecturas), **actividad de 14 días**, **¿a qué juegan?** (veces, % de aciertos y cuántos alumnos), **deberes** con quién falta, **lo que más les cuesta** (mates por tipo de ejercicio, lecturas con peor último intento y palabras) y la **tabla de alumnos**. Debajo, las herramientas de siempre (las tarjetas de nav).
- **#profe-alumno-<usuario>**: ficha del alumno: XP, racha, deberes, «le cuesta ahora», actividad, a qué juega, deberes con fallos, mates por apartado (estrellas por dificultad, aciertos, pistas y la tira de los 10 últimos por tipo de ejercicio), lecturas (último intento y qué preguntas falló, que se leen del archivo de la lectura) y palabras.
- **Ahorro de datos**: todo va en la misma ficha `progreso:<usuario>`, que se sobrescribe al guardar; nada crece con cada intento:
  - `S.g.act[juego] = {n, ok, mal, xp, t}`: un contador por juego (index.html, evento `lya:xp`).
  - `S.g.dias = {"AAAA-MM-DD": xp}`: solo los 14 últimos días.
  - `S.g.mh["t2.<apartado>.<tipo>"] = "1p0…"`: los 10 últimos resultados de cada tipo de ejercicio de mates (1 bien, p bien con pistas, 0 mal). Nombres en `LYAMatesBanco.HAB`.
  - `S.g.rd[lectura].fq / fg / fv / fh / pct / t`: lo que falló en el último intento (se reescribe al repetirla).
- Prueba: `qa/prueba-portada-profe.mjs <url> [capturas]`.

## Matemáticas 1.º ESO (mates/)
- Apartado **➗ Mates** en la barra (`#mates`). De momento solo en castellano y solo el **tema 2, Números enteros**, con los 8 apartados del libro: números enteros y recta (valor absoluto y opuesto), comparar y ordenar, suma y resta de dos, suma y resta de varios (forma abreviada y paréntesis), multiplicación y división, potencias, raíz cuadrada (exacta, entera y resto) y operaciones combinadas (jerarquía, paréntesis y corchetes). Los demás temas salen como «Pronto».
- Cada apartado (`#mates-t2-<n>`): **📘 Aprende** (explicación con palabras nuestras, reglas, ejemplos resueltos y «ojo»; en `mates/temas.js`) y **✏️ Practica**: 10 ejercicios nuevos cada vez en Fácil, Medio o Difícil, con teclado propio con botón ± (y el teclado del ordenador). Tipos: número, elegir, ordenar, leer la recta numérica, raíz entera y resto, y **paso a paso** en las combinadas (sale resaltado lo que toca y, si fallas un paso, dice cuál era y sigue). Al fallar sale una ayuda corta. **Repaso del tema** (`#mates-t2-repaso`): 12 mezclados.
- **Dibujos** en la explicación (`mates/dibujos.js`, SVG hechos a mano): la recta con valor absoluto y opuestos, un edificio con sótanos y un termómetro, saltos en la recta para sumar y restar, una balanza de positivos y negativos, la tabla de los signos, cuadrados y cubos, cuadraditos para la raíz y el resto, y la escalera de la jerarquía.
- **Aprende no borra la práctica**: si vas a «Aprende» a mitad, sale «Tienes una práctica a medias» y vuelves a la misma pregunta. Dentro de la práctica hay «📘 ¿Cómo se hacía?», que abre la explicación de ese apartado (en el repaso, la del ejercicio que toca) sin salir. «cambiar» deja elegir otra dificultad.
- **💡 Pistas** en todos los ejercicios: van de menos a más (qué hacer → cómo seguir → casi la solución), sin dar el resultado de golpe. En las combinadas son del **paso que toca** (qué operación va ahora, por qué, y cómo hacerla) y empiezan de nuevo en cada paso. Cada pista usada quita 1 XP de ese acierto (mínimo 1). Salen de `LYAMatesBanco.pistas(q)` y `pistaPaso(paso)`; no gastan semilla, así que los duelos siguen igual.
- Ejercicios generados solos, sin IA, en `mates/banco.js` (con semilla: los mismos en todos los móviles). Funciona en el navegador (`window.LYAMatesBanco`) y en el servidor (`api/duelo.js` lo importa).
- Progreso en `S.g.mt["t2-<n>"] = {e: [estrellas fácil, medio, difícil], n, ok, h: [por dificultad: {n, best, ok, tot, last, mal}]}` (se guarda con la cuenta; `mal` son los fallos del último intento, «ejercicio → solución»). XP 2/3/4 por acierto.
- **Deberes de mates**: en el panel del profe, pestaña «Deberes», se elige un apartado del tema (o el repaso) y sale la **dificultad**. Se guarda como `lectura = "mates-t2-<n|repaso>-<d>"`. El alumno lo ve en «Deberes» y al tocarlo abre `#mates-t2-<n>-d<d>`, que empieza la práctica ya en esa dificultad. Cuenta como hecho si lo termina después de mandarlo; el profe ve estrellas, aciertos (8/10), intentos y lo que falló cada uno.
- **Juegos en grupo** (`mates/grupo.js`, `#mates-grupo`, también en «En grupo»): sala con código de 6 cifras, sin cuenta; quien la crea elige apartados, dificultad, equipos y rondas o minutos, y puede jugar también.
  - 🧍 **La recta humana**: cada uno tiene cartas (−7, |−3|, (−2)³, √49…) y el equipo las ordena en la recta. «¡Listo!» comprueba; si falla, −150 y 5 s.
  - 🔗 **Cadena de operaciones**: una combinada larga; cada paso lo hace uno del equipo, por turnos. Si alguien falla, la cadena se rompe y el paso pasa al siguiente.
  - 🎯 **Número objetivo**: con 5 enteros, + − · : y paréntesis, llegar al número (exacto: 1000 + rapidez; cerca: algo).
  - 🌡️ **Ascensor y termómetro**: una historia (ascensor, termómetro, submarino o cuenta del banco) que sube y baja; todos escriben dónde queda y el marcador avanza.
  - 🔐 **Escape room de mates**: 4 candados con una operación con letras; los valores de las letras están repartidos entre los móviles del equipo. Final = suma de los 4.
  - 🎲 **Atrapa los puntos**: ¿verdadero o falso?, apuesta y, si escribes el resultado bueno, el doble.
  - 🃏 **Cartas a la mesa**: 8 operaciones con hueco; las soluciones repartidas como cartas (con 2 trampas) y un comodín.
  - ⚔️ **Duelo de mates** (`#mates-duelo`, con cuenta): usa los duelos de siempre con `file = "mates:<spec>"`; el servidor y los móviles sacan las mismas preguntas de la semilla. 🏆 **Concurso de mates** (`#mates-concurso` → `#concursos-mates-<spec>`): abre el editor de concursos con las preguntas.
- Servidor: el de los retos (`api/_retos.js`, juegos `m-…`, con `lectura = mates-t2-<apartados>-<dificultad>`; acción nueva `cerrar` para acabar ya una ronda). No gasta otra función de Vercel.
- Prueba: `qa/prueba-mates.cjs <url> [capturas]` con `servidor-prueba.mjs` (los 8 apartados en fácil y difícil, y los 7 juegos con pizarra y 2 móviles). `qa/prueba-deberes-mates.mjs <url>`: el profe manda un apartado, el alumno lo hace (mirando «Aprende» a mitad) y el profe ve aciertos y fallos. `qa/captura-dibujos-mates.cjs <url> <carpeta>`: una captura de cada dibujo.

## Matemáticas 4.º ESO PDC (mates/pdc.js, mates/monta.js)
- En `#mates` hay ahora dos cursos: 1.º ESO (`t2`) y **4.º ESO PDC** (`p2`). Cada tema dice su banco en `mates/temas.js` (`T2.banco = "LYAMatesBanco"`, `P2.banco = "LYAMatesPDC"`) y `LYAMatesTemas.banco(id)` lo devuelve; el resto de la app (mates.js, grupo.js, profe, panel, servidor) elige el banco por el tema.
- **Tema 2, Proporcionalidad y porcentajes**, 8 apartados (`#mates-p2-<1..8|repaso>`): directa, inversa, compuesta, porcentajes, aumentos, disminuciones (encadenadas, IVA + descuento), interés simple y repartos proporcionales. Teoría con palabras nuestras y dibujos (`LYAMatesDibujos.p2`: tabla con flechas y regla de tres en cruz, rectángulos de igual área, cuadrícula de 100, barras del 116 % y 90 %, años de interés, pizza del reparto).
- Respuestas con **decimales y coma** (el teclado cambia ± por «,»; `leer` acepta coma o punto; `igual` con tolerancia de céntimos) y **unidad** a la derecha.
- Ayudas nuevas cuando no entienden algo (en `pdc.js`, por pregunta):
  - 🤔 **No lo entiendo**: sale un ejercicio **gemelo** (mismo tipo, otros números) resuelto paso a paso, y luego vuelves al tuyo.
  - 🧭 **Hazlo paso a paso** (`guia`): el problema partido en preguntas pequeñas (¿directa o inversa?, ¿qué dato va con cuál?, ¿cuánto es 1 %?…); al fallar un paso dice por qué y sigue.
  - **Por qué has fallado** (`trampas`): si pones un error típico (multiplicar en vez de dividir en la inversa, sumar 21 % y restar 15 % como 6 %…) explica ese error concreto. Siempre sale «Así se hace» con los pasos (`res`).
  - Tras **2 fallos seguidos** ofrece ver uno parecido resuelto o bajar de dificultad.
- 🧩 **Monta el problema** (`mates/monta.js`, `#mates-p2-monta`): 4 columnas que se abren en orden: Datos (arrastrar o tocar cada dato a su sitio de la tabla), Tipo (directa, inversa, porcentaje…), Operación y Respuesta. Cada fallo explica por qué. 8 problemas; mejor nota en `S.g.mt["p2-monta"] = {best, n}`.
- Juegos en grupo de 4.º PDC (`grupo.js` filtra por tema): 🏷️ **¿Cuál es la mejor oferta?** (`m-oferta`: elegir la oferta más barata y, de extra, su precio), 🧩 **Monta el problema en clase** (`m-monta`), 🃏 **Parejas de porcentajes** (cartas con datos de p2), 🔐 **Escape room «La tienda»** (candados de precios con códigos enteros), y ⚔️ duelo y 🏆 concurso con specs `p2-…`.
- Deberes, progreso, pistas y panel del profe igual que en 1.º, con `p2` en vez de `t2` (`mates-p2-<n>-<d>`, `S.g.mt["p2-<n>"]`, en la ficha sale «(4.º PDC)»).
- Prueba: `qa/prueba-pdc.mjs <url>` (portada, 8 dibujos, ayudas, comas, Monta solo con arrastre y toque en móvil y PC, concurso, salas de oferta y monta, parejas, escape y deberes).

## FP Básica (fpb/)
Sección propia (`#fpb`, botón 🛠️ en la barra), separada de Mates y del resto. Pensada para alumnado con necesidades educativas: explicaciones en lectura fácil, palabras difíciles, textos literarios tal cual del libro, y actividades **siempre de tocar** (elegir, relacionar, clasificar) en tres niveles.
- Motor: `fpb/fpb.js` (`window.LYAFpb`). Cada asignatura se registra con `LYAFpb.asignatura({id, n, ic, color, intro, temas, pronto})` y cada tema con `LYAFpb.banco(tema, {manual, gen, nombres, parejas})`. Ids de tema: letra + número (`l2`, `s3`…).
- Lengua y Literatura: `fpb/lengua-temas.js` (temas 2, 3 y 4: Romanticismo, préstamos y abreviaciones, Modernismo y 98) y `fpb/lengua-banco.js` (preguntas a mano y generadores).
- Ayudas en cada pregunta: al menos 3 pistas (la última casi da la respuesta), ✂️ quitar una mala, 🤔 uno parecido resuelto, 🧭 paso a paso, 🔊 leer en voz alta, segunda oportunidad con el porqué del fallo y, tras 2 fallos seguidos, ver la explicación o bajar de nivel.
- Rutas: `#fpb` · `#fpb-<asignatura>` · `#fpb-<tema>` · `#fpb-<tema>-<apartado|repaso>`.
- En grupo (`fpb/grupo.js`): 🏆 ¿Quién sabe más? (`f-quiz`, por rondas) y 🃏 Parejas en equipo (`f-parejas`) con código, y 📺 En la pizarra por turnos (`#fpb-clase-<tema>`, sin móviles). El servidor (`api/_retos.js`) acepta `lectura = fpb-<tema>-<apartados>-<nivel>` y `file = fpb/<tema>`.
- Prueba: `qa/prueba-fpb.mjs <url>` (portada, temas, textos, práctica en los 3 niveles con elegir, relacionar y clasificar, ayudas, fallos, pizarra, quiz y parejas).
## FP Básica · Ciencias Sociales (fpb/sociales-*.js)
- Asignatura de FP Básica (`#fpb-sociales`), con el mismo motor y las mismas ayudas que Lengua (`fpb/fpb.js`): explicaciones en lectura fácil con «Palabras difíciles», actividades solo de tocar (elegir, relacionar y clasificar) en Fácil (2 opciones), Medio (3) y Difícil (4), pistas de menos a más, fallo explicado con segunda oportunidad y 🔊 escuchar.
- **Tema 3 · El disputado voto…** (`s3`, unidad 3 del libro, págs. 62-69), 7 apartados: clases sociales, movimiento obrero (con el texto de Engels), socialismo utópico, marxismo y anarquismo, imperialismo, factores y formas de administración colonial, Sexenio Democrático y Restauración. Las actividades 1-6 del libro van adaptadas: el texto de Engels con preguntas de elegir, «relaciona» de la actividad 2, el **mapa de África en 1914** (mapa de casillas en SVG con leyenda y lista de nombres), el test, las **dos viñetas del caciquismo** (redibujadas) y la **línea del tiempo** (clasificar los hechos por década).
- **Tema 4 · Soles más limpios** (`s4`, unidad 4, págs. 88-95), 8 apartados: el arte cambia, Romanticismo, Realismo, Impresionismo y Rodin, Posimpresionismo, arquitectura del siglo XIX, Goya, y Sorolla y el Modernismo, con las actividades 1-8 adaptadas.
- **Imágenes** (`fpb/sociales-dibujos.js`): cuadros y edificios de Wikimedia Commons (dominio público) por nombre de archivo; si uno no carga, se busca en Commons (sin desnudos) y, si tampoco, sale una ficha con la descripción. Donde el libro trae obras con desnudos (Gauguin, Sorolla, Rodin, Delacroix) salen otras del mismo autor o se nombran solo en el texto: «Los girasoles» y «Los jugadores de cartas», «Paseo a orillas del mar» de Sorolla, y el «Oficial de cazadores» de Géricault como cuadro romántico.
- Juegos en grupo: los de FP Básica (`fpb/grupo.js`) ya ofrecen los temas 3 y 4 de Sociales (¿Quién sabe más?, Parejas en equipo con las parejas de cada apartado y la pizarra por turnos).
- Prueba: `qa/prueba-fpb-sociales.mjs <url> [capturas]` con `servidor-prueba.mjs` (banco bien formado, explicaciones e imágenes, los 15 apartados en los 3 niveles, pistas, fallo explicado y juegos).
