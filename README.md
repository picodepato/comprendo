# Lee y aprende

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
- Si el vídeo no tiene subtítulos (o YouTube no los da), se puede pegar la letra (texto, LRC o SRT).
- Profes: «Mandar como deberes» guarda esa canción para su clase (`cancion:<id>`, caduca a los 180 días y se borra al quitar el deber). Es lo único que se guarda.
- Prueba: `qa/prueba-canciones.js`.

## Publicar
1. Importar este repositorio en Vercel (Framework: Other, sin build).
2. Storage → Upstash (Redis) → conectar al proyecto.
3. Settings → Environment Variables → `ADMIN_CLAVE` = una contraseña para el admin.
4. Redeploy. Comprobar que `/api/estado` dice `"db": true`.

## Probar en local
`node qa/servidor-prueba.mjs <carpeta> 8790` (simula Vercel y la base de datos) y `qa/prueba-cuentas.js`.
