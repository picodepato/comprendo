/* COMPRENDO · FP Básica · Lengua y Literatura: temas y explicaciones (en lectura fácil: frases cortas, palabras clave en negrita).
   Pensado para alumnado con necesidades educativas: las explicaciones están resumidas y adaptadas con palabras nuestras;
   los textos literarios (poemas y fragmentos) se copian tal cual.
   Cada apartado: {n, ic, titulo, idea (una frase), reglas [HTML], glosario [[palabra, qué significa]], textos [{n, titulo, autor, versos}],
   ejemplos [{q, pasos, r}], ojo}. Los ejercicios están en lengua/banco.js.
   Se registra en el motor de FP Básica (fpb/fpb.js) con LYAFpb.asignatura(). */
(() => {
const F2 = {
  id: "l2", n: 2, titulo: "Volverán las oscuras golondrinas", ic: "🕊️", color: "#7c5cff",
  intro: "El Romanticismo: poetas que escriben lo que sienten, amores imposibles y noches de tormenta. Y en lengua: lo que dicen las palabras y lo que sugieren, y las palabras que evitamos decir.",
  aps: [
    {n: 1, ic: "🌙", titulo: "¿Qué es el Romanticismo?", bloque: "Literatura",
      idea: "El Romanticismo es una forma de escribir y de vivir que pone los sentimientos por delante de las normas.",
      reglas: [
        "<b>Cuándo</b>: en la <b>primera mitad del siglo XIX</b> (los años 1800).",
        "<b>Dónde nace</b>: en <b>Alemania</b>. Después pasa a <b>Gran Bretaña</b> y <b>Francia</b>.",
        "<b>En España llega tarde</b> porque había mucha <b>censura</b> (no dejaban publicar todo). Triunfa cuando muere el rey <b>Fernando VII (1833)</b> y vuelven los liberales que estaban fuera del país (exiliados).",
        "<b>Qué defiende</b>: la <b>libertad</b>, la justicia, la espiritualidad, la <b>fantasía</b> y lo que siente cada persona.",
        "<b>Lo más importante</b>: los <b>sentimientos</b> valen más que las <b>reglas clásicas</b> de escribir."],
      glosario: [["Siglo XIX", "Los años del 1801 al 1900."], ["Censura", "Cuando el poder prohíbe publicar algunas cosas."], ["Exiliado", "Persona que tiene que vivir fuera de su país."], ["Reglas clásicas", "Normas antiguas de cómo había que escribir bien."]],
      ejemplos: [
        {q: "¿Por qué el Romanticismo llegó tarde a España?", pasos: ["Piensa qué pasaba en España: había censura.", "Cuando muere Fernando VII (1833), vuelven los exiliados y ya se puede publicar."], r: "Por la censura. Triunfa después de 1833."}],
      ojo: "Romántico aquí no significa solo «enamorado». Significa dar mucha importancia a los sentimientos, a la libertad y a la fantasía."},
    {n: 2, ic: "💔", titulo: "Rasgos del Romanticismo", bloque: "Literatura",
      idea: "Los escritores románticos se parecen en 7 cosas. Si las conoces, sabrás reconocer un texto romántico.",
      reglas: [
        "🔮 <b>Rechazo de la razón</b>: el mundo es un misterio. Les gusta lo <b>mágico</b>, lo <b>sobrenatural</b> y lo misterioso.",
        "❤️ <b>Subjetivismo</b>: lo que cuenta es lo que <b>yo siento</b>: emociones, imaginación e impulsos.",
        "🧍 <b>Individualismo</b>: no les gusta la sociedad. Se sienten <b>solos</b> y <b>más tristes</b> que los demás. Buscan la libertad y el amor apasionado.",
        "❓ <b>Inseguridad</b>: tienen muchas <b>dudas</b> y viven intranquilos.",
        "🌩️ <b>Naturaleza en movimiento</b>: el paisaje refleja cómo se sienten: <b>tormentas</b>, mar con olas, ruinas, <b>cementerios</b>, la <b>noche</b>…",
        "🚩 <b>Nacionalismo</b>: buscan sus raíces y alaban a su <b>patria</b> (su país).",
        "❗ <b>Estilo</b>: muchos <b>adjetivos</b>, preguntas (¿?), <b>exclamaciones</b> (¡!) y exageraciones."],
      glosario: [["Sobrenatural", "Lo que no se puede explicar con la ciencia: fantasmas, magia…"], ["Subjetivo", "Lo que depende de lo que yo pienso o siento."], ["Patria", "El país de una persona."], ["Lúgubre", "Triste, oscuro y que da miedo."]],
      ejemplos: [
        {q: "«¡Toda la sangre coagulada envía / agolpada y helada al corazón!»", pasos: ["Hay exclamaciones (¡!) y adjetivos (coagulada, agolpada, helada).", "Exagera lo que siente."], r: "Rasgo: el estilo (exclamaciones y adjetivos)."},
        {q: "Un poema pasa de noche, en un cementerio, con tormenta.", pasos: ["El paisaje es oscuro y da miedo.", "Ese paisaje muestra cómo se siente el poeta."], r: "Rasgo: naturaleza en movimiento."}],
      ojo: "Subjetivismo (lo que yo siento) e individualismo (yo frente a la sociedad, soledad) se parecen, pero no son lo mismo."},
    {n: 3, ic: "✒️", titulo: "La poesía romántica", bloque: "Literatura",
      idea: "Hay tres tipos de poesía romántica: narrativa (cuenta una historia), lírica (cuenta sentimientos) y posromántica (más sencilla).",
      reglas: [
        "📜 <b>Poesía narrativa</b>: <b>cuenta una historia</b> en verso (de la historia, una leyenda o inventada). Tiene descripciones y diálogos. Autores: el <b>duque de Rivas</b> y <b>José Zorrilla</b>.",
        "💌 <b>Poesía lírica</b>: expresa <b>sentimientos</b>: el amor, la mujer ideal, el aburrimiento de vivir (hastío), la tristeza (melancolía), la religión. Ambientes: cementerios, noche, niebla, luna, tempestades. Autores: <b>Zorrilla</b>, <b>Espronceda</b> y <b>Carolina Coronado</b>.",
        "🌿 <b>Poesía posromántica</b>: llega más tarde. Es <b>más sencilla</b>, sin tantos excesos. Usa palabras que <b>sugieren</b> y recuerda a la <b>poesía popular</b>. Es <b>íntima</b>. Autores: <b>Rosalía de Castro</b> y <b>Gustavo Adolfo Bécquer</b>."],
      glosario: [["Verso", "Cada línea de un poema."], ["Hastío", "Aburrimiento y cansancio de todo."], ["Melancolía", "Tristeza tranquila que dura."], ["Íntimo", "Muy personal, de dentro de uno."]],
      ejemplos: [
        {q: "Un poema largo cuenta la historia de un estudiante que persigue a una dama misteriosa.", pasos: ["¿Cuenta una historia o solo sentimientos? Cuenta una historia.", "Contar una historia en verso = poesía narrativa."], r: "Poesía narrativa."},
        {q: "Un poema corto y sencillo: «Poesía eres tú».", pasos: ["Es muy corto, sencillo e íntimo.", "Es de Bécquer."], r: "Poesía posromántica."}],
      ojo: "Zorrilla sale en la poesía narrativa y en la lírica: escribió de los dos tipos."},
    {n: 4, ic: "🏴‍☠️", titulo: "José de Espronceda", bloque: "Literatura",
      idea: "Espronceda es el poeta rebelde del Romanticismo: defiende a los marginados y la libertad.",
      reglas: [
        "Escribió novela y teatro, pero destacó en <b>poesía</b> (narrativa y lírica).",
        "Temas: <b>amor</b>, sociedad, política y filosofía.",
        "Su poesía <b>defiende a los marginados</b> (los que la sociedad deja fuera), <b>desprecia las normas y las leyes</b>, no le importan las <b>riquezas</b> y quiere <b>libertad</b>.",
        "Obras: <b><i>El diablo mundo</i></b> y <b><i>El estudiante de Salamanca</i></b>. Son poemas <b>narrativos</b> (cuentan una historia) con partes de teatro y de sentimientos."],
      glosario: [["Marginado", "Persona que la sociedad deja aparte: pobres, presos, piratas…"], ["Velo", "Tela fina que tapa la cara."], ["Calavera", "Los huesos de la cabeza de un muerto."]],
      textos: [{n: 1, titulo: "El estudiante de Salamanca", autor: "José de Espronceda", versos: ["Y entonces la visión del blanco velo", "al fiero Montemar tendió una mano,", "y era su tacto de crispante hielo,", "y resistirlo audaz intentó en vano;", "", "galvánica, cruel, nerviosa y fría,", "histérica y horrible sensación,", "¡toda la sangre coagulada envía", "agolpada y helada al corazón!", "", "Y a su despecho y maldiciendo al cielo,", "de ella apartó su mano Montemar,", "y temerario alzándole su velo,", "tirando de él le descubrió la faz.", "", "Y ella entonces gritó: “¡Mi esposo!” ¡Y era", "-¡desengaño fatal! ¡triste verdad!-", "una sórdida, horrible calavera,", "la blanca dama del gallardo andar!…"]}],
      ejemplos: [
        {q: "Texto 1: ¿qué pasa?", pasos: ["Montemar ve a una dama con un velo blanco. Ella le da la mano: está fría como el hielo.", "Él le quita el velo y descubre que la dama es una calavera."], r: "Una historia de miedo con algo sobrenatural."},
        {q: "Texto 1: ¿qué rasgos románticos tiene?", pasos: ["Lo sobrenatural: una muerta que habla (rechazo de la razón).", "Estilo: exclamaciones (¡triste verdad!) y muchos adjetivos (galvánica, cruel, nerviosa y fría)."], r: "Misterio y sobrenatural + estilo exagerado."}],
      ojo: "El estudiante de Salamanca es poesía narrativa: cuenta una historia, aunque esté en verso."},
    {n: 5, ic: "🕊️", titulo: "Gustavo Adolfo Bécquer", bloque: "Literatura",
      idea: "Bécquer escribe poemas cortos y sencillos sobre el amor y la poesía. Su libro se llama Rimas.",
      reglas: [
        "Vive en la <b>segunda mitad del siglo XIX</b>. Su vida fue dura: <b>huérfano</b>, <b>pobre</b> y con <b>desengaños amorosos</b>.",
        "Escribe de forma <b>sencilla</b>, sin palabras rimbombantes. Crea un ambiente de <b>nostalgia</b> y <b>misterio</b>.",
        "Temas: <b>la poesía</b>, <b>el amor</b>, el <b>desengaño amoroso</b> y la <b>desesperación</b>.",
        "Sus poemas se publicaron en <b>1871</b>, un año después de morir, con el título <b><i>Rimas</i></b>."],
      glosario: [["Huérfano", "Niño que no tiene padre ni madre."], ["Desengaño", "Cuando descubres que algo que creías bonito no era verdad."], ["Nostalgia", "Pena por algo que ya pasó o que no tienes."], ["Rima", "Aquí: cada poema de Bécquer."]],
      textos: [
        {n: 2, titulo: "Rima XXI", autor: "Gustavo Adolfo Bécquer", versos: ["¿Qué es poesía?, dices mientras clavas", "en mi pupila tu pupila azul.", "¿Qué es poesía? ¿Y tú me lo preguntas?", "Poesía eres tú."]},
        {n: 3, titulo: "Rima XXIII", autor: "Gustavo Adolfo Bécquer", versos: ["Por una mirada un mundo;", "por una sonrisa, un cielo;", "por un beso... ¡Yo no sé", "qué te diera por un beso!"]},
        {n: 4, titulo: "Rima LXIX", autor: "Gustavo Adolfo Bécquer", versos: ["Al brillar un relámpago nacemos,", "y aún dura su fulgor cuando morimos,", "¡tan corto es el vivir!", "La Gloria y el Amor tras que corremos", "sombras de un sueño son que perseguimos;", "¡despertar es morir!"]},
        {n: 5, titulo: "Rima XXXVIII", autor: "Gustavo Adolfo Bécquer", versos: ["¡Los suspiros son aire y van al aire!", "¡Las lágrimas son agua y van al mar!", "Dime, mujer, cuando el amor se olvida,", "¿sabes tú adónde va?"]}],
      ejemplos: [
        {q: "Texto 2 (Rima XXI): ¿de qué trata?", pasos: ["Una chica le pregunta qué es la poesía.", "Él responde que la poesía es ella."], r: "La poesía y el amor."},
        {q: "Texto 4 (Rima LXIX): ¿qué quiere decir «al brillar un relámpago nacemos»?", pasos: ["Un relámpago dura muy poco.", "Compara la vida con un relámpago."], r: "Que la vida es muy corta."}],
      ojo: "Bécquer es posromántico: más sencillo que Espronceda. Poemas cortos, sin tanta exageración."},
    {n: 6, ic: "📰", titulo: "La prosa romántica y Larra", bloque: "Literatura",
      idea: "En prosa (sin verso) hubo dos tipos de novela: la histórica y la costumbrista. El autor más importante es Larra.",
      reglas: [
        "La prosa romántica llega <b>tarde</b> a España.",
        "⚔️ <b>Novela histórica</b>: cuenta historias de <b>caballeros de la Edad Media</b>. Triunfó más fuera: <b><i>Los tres mosqueteros</i></b> (Alejandro Dumas, Francia) e <b><i>Ivanhoe</i></b> (Walter Scott, Gran Bretaña). A veces <b>cambian la historia de verdad</b> para que los héroes queden mejor.",
        "🏘️ <b>Novela costumbrista</b>: <b>cuadros de costumbres</b>, textos cortos que muestran <b>cómo vivía la gente</b>, de forma realista. Autores: Serafín Estébanez Calderón y Ramón Mesonero Romanos.",
        "🖋️ <b>Mariano José de Larra</b>: usa la <b>ironía</b> y el <b>sarcasmo</b> para criticar y reírse de lo que ve. Destacan sus <b>artículos de periódico</b>:",
        "• <b>De costumbres</b>: critica a la sociedad española (vagos, hipócritas, mal gusto). Ejemplos: <b><i>Vuelva usted mañana</i></b> (lo lenta que es la administración) y <b><i>El castellano viejo</i></b> (los malos modales).",
        "• <b>Políticos</b>: critica el absolutismo, el carlismo y el liberalismo moderado.",
        "• <b>De crítica literaria</b>: opina sobre obras de teatro, libros y conciertos."],
      glosario: [["Prosa", "Texto escrito sin versos, como un cuento o una noticia."], ["Ironía", "Decir lo contrario de lo que piensas para criticar o hacer gracia."], ["Sarcasmo", "Ironía muy dura que busca herir."], ["Burocracia", "Los papeles y trámites de la administración."]],
      ejemplos: [
        {q: "Un artículo se ríe de que en las oficinas siempre te dicen «vuelva usted mañana».", pasos: ["Critica un comportamiento de la sociedad: la lentitud de los trámites.", "Es un artículo de costumbres de Larra."], r: "Larra, artículo de costumbres: Vuelva usted mañana."}],
      ojo: "Costumbrista = cómo vive la gente. Histórica = caballeros y Edad Media. No los confundas."},
    {n: 7, ic: "🎭", titulo: "El teatro romántico y Zorrilla", bloque: "Literatura",
      idea: "El teatro romántico rompe las normas: mezcla de todo, amores imposibles y finales trágicos. La obra más famosa es Don Juan Tenorio.",
      reglas: [
        "Los románticos se rebelaron contra el teatro neoclásico (con muchas normas) y se fijaron en el teatro barroco.",
        "🎨 <b>Libertad de estilo</b>: mezclan <b>prosa y verso</b>, lo <b>cómico</b> y lo <b>trágico</b>; versos de distintas medidas y número de actos variable.",
        "🌲 <b>Naturaleza</b>: los lugares ayudan a mostrar los sentimientos de los personajes.",
        "🏰 <b>Tema histórico</b>: caballeros y leyendas, aunque cambian la historia de verdad.",
        "👑 <b>Personajes nobles</b>: un caballero aventurero se enamora de una dama que le quiere, pero <b>el destino lo impide</b> y acaba en <b>tragedia</b> (venganza, muerte…).",
        "✍️ <b>Autores</b>: Martínez de la Rosa (<i>La conjuración de Venecia</i>), Larra (<i>Macías</i>), el duque de Rivas (<i>Don Álvaro o la fuerza del sino</i>), Hartzenbusch (<i>Los amantes de Teruel</i>) y, el de más éxito, <b>José Zorrilla</b>.",
        "🗡️ <b>José Zorrilla</b>: unas 30 obras, casi todas <b>históricas y en verso</b>. Su obra más famosa es <b><i>Don Juan Tenorio</i> (1844)</b>: don Juan lleva una vida escandalosa, pero <b>se salva por el amor</b> de una mujer, doña Inés."],
      glosario: [["Trágico", "Que acaba mal, con muerte o desgracia."], ["Sino", "El destino."], ["Libertino", "Persona que no respeta las normas, sobre todo en el amor."], ["Convento", "Casa donde viven monjas o monjes."]],
      textos: [{n: 6, titulo: "Don Juan Tenorio", autor: "José Zorrilla", versos: ["DON JUAN.–", "¡Cálmate, pues, vida mía!", "Reposa aquí; y un momento", "olvida de tu convento", "la triste cárcel sombría.", "¡Ah! ¿No es cierto, ángel de amor,", "que en esta apartada orilla", "más pura la luna brilla", "y se respira mejor?", "Esta aura que vaga, llena", "de los sencillos olores", "de las campesinas flores", "que brota esa orilla amena;", "esa agua limpia y serena", "que atraviesa sin temor", "la barca del pescador", "que espera cantando el día,", "¿no es cierto, paloma mía,", "que están respirando amor?", "Esa armonía que el viento", "recoge entre esos millares", "de floridos olivares,", "que agita con manso aliento;", "ese dulcísimo acento", "con que trina el ruiseñor", "de sus copas morador,", "llamando al cercano día,", "¿no es verdad, gacela mía,", "que están respirando amor?", "Y estas palabras que están", "filtrando insensiblemente", "tu corazón, ya pendiente", "de los labios de don Juan,", "y cuyas ideas van", "inflamando en su interior", "un fuego germinador", "no encendido todavía,", "¿no es verdad, estrella mía,", "que están respirando amor?", "Y esas dos líquidas perlas", "que se desprenden tranquilas", "de tus radiantes pupilas", "convidándome a beberlas,", "evaporarse, a no verlas,", "de sí mismas al calor;", "y ese encendido color", "que en tu semblante no había,", "¿no es verdad, hermosa mía,", "que están respirando amor?", "¡Oh! Sí, bellísima Inés,", "espejo y luz de mis ojos;", "escucharme sin enojos,", "como lo haces, amor es:", "mira aquí a tus plantas, pues,", "todo el altivo rigor", "de este corazón traidor", "que rendirse no creía,", "adorando vida mía,", "la esclavitud de tu amor"]}],
      ejemplos: [
        {q: "Texto 6: ¿qué hace don Juan?", pasos: ["Habla con doña Inés, que viene del convento.", "Le describe la luna, las flores, el río y el ruiseñor y le dice que todo «respira amor»."], r: "Enamora a doña Inés usando la naturaleza."},
        {q: "Texto 6: ¿qué es «dos líquidas perlas»?", pasos: ["Salen de las pupilas (los ojos) de Inés.", "Son gotas brillantes que caen de los ojos."], r: "Las lágrimas de Inés."}],
      ojo: "Don Juan Tenorio no es una novela: es una obra de teatro en verso."},
    {n: 8, ic: "🐔", titulo: "Denotación y connotación", bloque: "Lengua",
      idea: "Una palabra tiene un significado de diccionario (denotación) y, a veces, otro significado añadido (connotación).",
      reglas: [
        "📖 <b>Denotación</b>: el significado <b>principal</b>, claro y <b>objetivo</b>. El que viene en el <b>diccionario</b>. Es igual para todos y no cambia. <i>Gallina</i> = el ave hembra del gallo.",
        "💭 <b>Connotación</b>: un significado <b>añadido</b> y <b>subjetivo</b>, que aparece en la frase. <i>Esteban es un gallina</i> = Esteban es <b>cobarde</b>.",
        "➕➖ La connotación suele decir si algo es <b>positivo</b> (bueno) o <b>negativo</b> (malo). <i>Lince</i> (listo) es positiva; <i>gusano</i> (mala persona) es negativa.",
        "👥 Las connotaciones pueden ser:",
        "• <b>Generales</b>: las entiende <b>todo el mundo</b>: <i>gallina, gusano, buitre</i>.",
        "• <b>De un grupo social</b>: dependen del grupo: política (<i>rojo, facha</i>) o fútbol (<i>merengue, culé</i>).",
        "• <b>Personales</b>: dependen de la vida de cada uno. Son importantes en la literatura (el <i>viento</i> en Miguel Hernández)."],
      glosario: [["Objetivo", "Igual para todos, no depende de lo que yo opino."], ["Subjetivo", "Depende de lo que opina o siente cada uno."], ["Referente", "La persona o cosa de la que hablamos."]],
      ejemplos: [
        {q: "«Mi hermano es un lince con los números.»", pasos: ["Denotación de lince: un animal felino que ve muy bien.", "Aquí no hablamos del animal: quiere decir que es muy listo, muy rápido.", "Es positivo y lo entiende todo el mundo."], r: "Connotación positiva y general: muy listo."},
        {q: "«Ese prestamista es un buitre.»", pasos: ["Denotación: ave que come animales muertos.", "Aquí: persona que se aprovecha de los demás.", "Es negativo y lo entiende todo el mundo."], r: "Connotación negativa y general: aprovechado."}],
      ojo: "Truco: si hablamos del animal o la cosa de verdad, es denotación. Si la palabra describe a una persona, es connotación."},
    {n: 9, ic: "🤫", titulo: "Tabú y eufemismo", bloque: "Lengua",
      idea: "Un tabú es una palabra que evitamos decir. Un eufemismo es la palabra suave que usamos en su lugar.",
      reglas: [
        "🙊 Hay palabras con connotación negativa que dan <b>vergüenza</b> o parecen <b>de mal gusto</b> u ofensivas.",
        "🚫 <b>Tabú</b>: palabra o expresión que la sociedad <b>evita usar</b>. Suelen ser del <b>sexo</b> (aborto, regla, parir), del <b>baño</b> (cagar, mear, retrete) o de otros temas (viejo, ciego, parado, vagabundo, guerra…).",
        "🌸 <b>Eufemismo</b>: palabra <b>suave</b> que usamos <b>en lugar del tabú</b>: <i>persona de la tercera edad</i> en vez de <i>viejo</i>; <i>invidente</i> en vez de <i>ciego</i>.",
        "🏛️ Los <b>políticos</b> usan muchos eufemismos para que las malas noticias suenen mejor: <i>desaceleración</i> en vez de <i>crisis</i>; <i>reformas estructurales</i> en vez de <i>recortes</i>."],
      glosario: [["Ofensivo", "Que puede molestar o hacer daño a alguien."], ["Suavizar", "Hacer que algo suene menos duro."]],
      ejemplos: [
        {q: "«Mi abuelo es invidente.»", pasos: ["Invidente es una forma suave de decir…", "…ciego, que puede sonar duro."], r: "Invidente = eufemismo · ciego = tabú."},
        {q: "El Gobierno anuncia «movilidad exterior».", pasos: ["¿Qué es lo malo que esconde? Que los jóvenes se van del país a trabajar porque no hay trabajo.", "Suena mejor que decirlo claro."], r: "Eufemismo de «emigración forzosa de jóvenes por la crisis»."}],
      ojo: "El tabú es la palabra dura que evitamos. El eufemismo es la suave que decimos. No los cambies."}
  ]
};

const F3 = {
  id: "l3", n: 3, titulo: "El disputado voto…", ic: "🔤", color: "#ff7a45",
  intro: "Cómo nacen palabras nuevas: las que cogemos de otros idiomas (extranjerismos), las que cortamos (profe, bici), las abreviaturas (Sr., pág.) y las siglas (ONU, DGT).",
  aps: [
    {n: 1, ic: "🌍", titulo: "Extranjerismos (préstamos)", bloque: "Lengua",
      idea: "Un extranjerismo es una palabra que el español coge de otro idioma.",
      reglas: [
        "🌍 Los <b>extranjerismos</b> o <b>préstamos</b> son palabras que vienen de <b>otra lengua</b>. A veces nombran cosas nuevas; otras veces compiten con una palabra que ya teníamos.",
        "✅ <b>Adaptados</b>: ya se escriben y se pronuncian <b>como en español</b>: <i>fútbol</i> (del inglés <i>football</i>), <i>béisbol</i>, <i>escáner</i>, <i>líder</i>, <i>champán</i>, <i>coñac</i>.",
        "🔴 <b>Crudos</b>: se escriben y se pronuncian <b>como en su idioma</b>: <i>hobby</i>, <i>pizza</i>, <i>jazz</i>, <i>camping</i>, <i>gourmet</i>, <i>thriller</i>.",
        "⏳ Muchas palabras son extranjerismos muy antiguos y ya no lo notamos: del <b>árabe</b> <i>alcalde, arroz</i>; del <b>francés</b> <i>jamón, cobarde</i>; del <b>italiano</b> <i>novela, regata</i>; del <b>inglés</b> <i>detective, pijama</i>.",
        "✍️ La <b>RAE</b> dice: usa los crudos solo si hace falta, y escríbelos en <b>cursiva</b> (en el ordenador) o <b>«entre comillas»</b> (a mano). Si hay palabra española, mejor: <i>contraseña</i> mejor que <i>password</i>."],
      glosario: [["Préstamo", "Palabra que una lengua coge de otra."], ["Anglicismo", "Palabra que viene del inglés."], ["Galicismo", "Palabra que viene del francés."], ["Arabismo", "Palabra que viene del árabe."], ["Italianismo", "Palabra que viene del italiano."]],
      ejemplos: [
        {q: "¿«Fútbol» es crudo o adaptado?", pasos: ["En inglés se escribe football.", "En español lo escribimos fútbol, como suena, y con tilde."], r: "Adaptado (anglicismo)."},
        {q: "¿«Piercing» es crudo o adaptado?", pasos: ["Se escribe igual que en inglés.", "Tiene letras y sonidos que no son del español."], r: "Crudo (anglicismo)."}],
      ojo: "Pista rápida: si tiene letras raras para el español (w, k, doble letra, -ng al final…) o se lee distinto de como se escribe, seguramente es crudo."},
    {n: 2, ic: "✂️", titulo: "Acortamientos", bloque: "Lengua",
      idea: "Un acortamiento es una palabra a la que le quitamos un trozo: profe (profesor), bici (bicicleta).",
      reglas: [
        "✂️ Se quita <b>una o varias sílabas</b> a una palabra.",
        "⬅️ Lo normal es quitar el <b>final</b>: <i>boli</i> (bolígrafo), <i>profe</i> (profesor), <i>bici</i> (bicicleta), <i>finde</i> (fin de semana).",
        "➡️ A veces se quita el <b>principio</b>: <i>bus</i> (autobús), <i>Nando</i> (Fernando), <i>chelo</i> (violonchelo).",
        "🗣️ Nacen al <b>hablar</b>, sobre todo entre <b>jóvenes</b>, y luego pasan a la escritura: <i>díver, porfa, zoo, quimio, Tere, narco</i>.",
        "📏 Se escriben <b>sin punto</b> y se leen como una palabra normal."],
      glosario: [["Sílaba", "Cada golpe de voz de una palabra: bi-ci-cle-ta."], ["Coloquial", "Lengua de la calle, de hablar con amigos."]],
      ejemplos: [
        {q: "¿De qué palabra viene «quimio»?", pasos: ["Le falta el final.", "quimio + terapia."], r: "Quimioterapia."},
        {q: "¿De qué palabra viene «bus»?", pasos: ["Le falta el principio.", "auto + bús."], r: "Autobús."}],
      ojo: "Un acortamiento no lleva punto (profe, bici). Si lleva punto, es una abreviatura (pág., Sr.)."},
    {n: 3, ic: "📝", titulo: "Abreviaturas", bloque: "Lengua",
      idea: "Una abreviatura es una forma corta de escribir una palabra, con un punto al final: Sr. = señor.",
      reglas: [
        "📝 Se escriben <b>quitando letras</b> a una palabra o a un grupo de palabras: <i>Sr.</i> (señor), <i>a. C.</i> (antes de Cristo).",
        "⏺️ Se cierran con un <b>punto</b>. A veces con una <b>barra</b>: <i>c/</i> (calle).",
        "🔼 Algunas llevan <b>letras voladas</b> (pequeñitas arriba). Antes va siempre el punto: <i>M.ª</i> (María), <i>n.º</i> (número), <i>1.º</i> (primero).",
        "✂️ Formas de hacerlas: quitar el <b>final</b> (<i>art.</i> artículo, <i>ej.</i> ejemplo) o dejar <b>la primera y las últimas letras</b> (<i>dcha.</i> derecha, <i>Fdez.</i> Fernández, <i>cta.</i> cuenta).",
        "´ Si la letra con <b>tilde</b> se queda, la tilde también: <i>pág.</i> (página), <i>pról.</i> (prólogo).",
        "🗣️ Al leer en voz alta decimos la palabra entera: <i>Sr.</i> se lee «señor»."],
      glosario: [["Letra volada", "Letra pequeña que se escribe arriba: ª, º."], ["Tilde", "El acento escrito: á, é, í, ó, ú."]],
      ejemplos: [
        {q: "Abreviatura de «avenida»", pasos: ["Se dejan las letras principales: av-d-a.", "Se cierra con punto."], r: "avda."},
        {q: "Abreviatura de «tercero»", pasos: ["Número 3 + letra volada er.", "Antes de la letra volada, punto."], r: "3.er"}],
      ojo: "Las abreviaturas llevan punto. Las siglas (ONU) y los acortamientos (bici) no."},
    {n: 4, ic: "🔠", titulo: "Siglas y acrónimos", bloque: "Lengua",
      idea: "Una sigla se hace con la primera letra de cada palabra: ONG = Organización No Gubernamental.",
      reglas: [
        "🔠 <b>Sigla</b>: palabra hecha con las <b>letras iniciales</b> de un nombre largo: <i>DGT</i> (Dirección General de Tráfico), <i>FMI</i> (Fondo Monetario Internacional), <i>ONG</i>.",
        "✍️ Las siglas van en <b>MAYÚSCULAS</b>, <b>sin puntos</b>, <b>sin espacios</b> y <b>sin tilde</b>.",
        "🗣️ Algunas se leen <b>letra a letra</b>: DGT = «de-ge-te».",
        "🔊 <b>Acrónimo</b>: una sigla que se puede <b>leer como una palabra</b>: <i>ONU</i>, <i>RAE</i>, <i>OPEP</i>. También se forman con trozos de palabras: <i>Renfe</i>, <i>Interpol</i>, <i>talgo</i>.",
        "🔡 <b>Acrónimo lexicalizado</b>: se usa tanto que ya es una <b>palabra normal</b> y va en minúscula (o solo con la primera en mayúscula si es un nombre): <i>ovni</i>, <i>sida</i>, <i>Unicef</i>, <i>Unesco</i>. Estos sí siguen las reglas de la tilde: <i>Codicén</i>, <i>Fundéu</i>."],
      glosario: [["Inicial", "La primera letra de una palabra."], ["Lexicalizado", "Que ya se usa como una palabra normal del idioma."]],
      ejemplos: [
        {q: "«PIB»: ¿sigla o acrónimo?", pasos: ["Producto Interior Bruto → P-I-B.", "Se lee letra a letra: «pe-i-be»."], r: "Sigla."},
        {q: "«sida»", pasos: ["Viene de Síndrome de Inmunodeficiencia Adquirida.", "Se lee como palabra y ya va en minúscula."], r: "Acrónimo lexicalizado."}],
      ojo: "OMC o DGT no se pueden leer como palabra: son siglas. OPEP u ONU sí: son acrónimos."}
  ]
};
const F4 = {
  id: "l4", n: 4, titulo: "Soles más limpios", ic: "🦢", color: "#18a0c8",
  intro: "Principios del siglo XX: los modernistas buscan la belleza (princesas, cisnes, oro…) y los escritores del 98 se preocupan por los problemas de España.",
  aps: [
    {n: 1, ic: "🕰️", titulo: "Modernismo y generación del 98", bloque: "Literatura",
      idea: "A principios del siglo XX hay dos grupos de escritores nuevos: los modernistas (buscan la belleza) y los del 98 (critican los problemas de España).",
      reglas: [
        "📅 <b>Cuándo</b>: a principios del <b>siglo XX</b> (los años 1900).",
        "😟 <b>Por qué</b> aparecen: 1) hay una gran <b>crisis</b> en España, sobre todo cuando pierde sus últimas colonias en <b>1898</b> (Cuba); 2) los escritores jóvenes están <b>cansados</b> de la literatura realista del siglo XIX.",
        "🦢 <b>Modernismo</b>: sobre todo <b>poesía</b>. Se refugian en la <b>belleza</b> para huir del mundo feo.",
        "🇪🇸 <b>Generación del 98</b>: sobre todo <b>novela y ensayo</b>. Son <b>críticos</b> y quieren <b>cambiar España</b>. Autores: Unamuno, Baroja, Azorín, Maeztu.",
        "🤝 Los dos grupos <b>conviven</b> y se mezclan: Valle-Inclán y Antonio Machado empezaron siendo modernistas."],
      glosario: [["Siglo XX", "Los años del 1901 al 2000."], ["Colonia", "Territorio lejano que gobernaba un país. España perdió Cuba en 1898."], ["Crisis", "Momento muy malo: sin dinero, sin trabajo, problemas…"], ["Ensayo", "Texto en el que un autor da su opinión sobre un tema."]],
      ejemplos: [
        {q: "Un escritor solo quiere escribir cosas bonitas: cisnes, princesas, oro.", pasos: ["Busca la belleza y huye de la realidad.", "Eso es lo que hacen los modernistas."], r: "Es modernista."},
        {q: "Un escritor viaja por Castilla y critica la pobreza de España.", pasos: ["Critica los problemas del país.", "Eso es lo que hace la generación del 98."], r: "Es de la generación del 98."}],
      ojo: "Modernismo = belleza (huir). Generación del 98 = problemas de España (criticar)."},
    {n: 2, ic: "🦢", titulo: "El modernismo y Rubén Darío", bloque: "Literatura",
      idea: "El modernismo busca la belleza en todo: colores, joyas, música, perfumes y lugares lejanos. Lo trae a España Rubén Darío.",
      reglas: [
        "🌎 Nace a finales del siglo XIX en <b>Hispanoamérica</b>. Lo trae a España el poeta nicaragüense <b>Rubén Darío</b>.",
        "✨ <b>Buscan lo bello</b>: «el arte por el arte». La belleza es lo más importante.",
        "🧠 <b>No les gusta la razón</b> ni el realismo: valoran lo que se siente.",
        "✈️ <b>Huyen de la realidad</b> a lugares lejanos: Grecia antigua, la Edad Media, países <b>exóticos</b> y orientales (China, India…).",
        "😔 <b>Intimidad</b>: tristeza (melancolía) y rebeldía. El paisaje muestra cómo se sienten (el atardecer = el final, la muerte).",
        "🎨 <b>Lenguaje muy rico</b>, que se puede ver, oír y oler:",
        "• <b>Colores</b>: azul, violeta, lila, púrpura. <b>Joyas</b>: oro, plata, rubí, zafiro, marfil.",
        "• <b>Música</b>: arpa, lira, flautas, pianos. <b>Aromas</b>: flores y plantas.",
        "• <b>Ambientes</b>: jardines, fuentes, estanques, palacios. <b>Animales</b> elegantes o fantásticos: <b>cisnes</b>, pavos reales, unicornios. <b>Personajes</b>: princesas, caballeros, ninfas, sirenas.",
        "🎵 Prueban muchos tipos de versos y rimas para que el poema suene como <b>música</b>."],
      glosario: [["Exótico", "De un país lejano y extraño."], ["Bufón", "Persona que hace reír, como un payaso."], ["Azur", "Azul."], ["Rueca", "Herramienta antigua para hacer hilo."], ["Tul", "Tela fina y transparente."], ["Alabarda", "Lanza con una hacha en la punta."], ["Golconda / Ormuz", "Lugares lejanos: un reino de la India y una isla del golfo Pérsico."]],
      textos: [{n: 1, titulo: "Sonatina", autor: "Rubén Darío", versos: ["La princesa está triste... ¿Qué tendrá la princesa?", "Los suspiros se escapan de su boca de fresa,", "que ha perdido la risa, que ha perdido el color.", "La princesa está pálida en su silla de oro,", "está mudo el teclado de su clave sonoro,", "y en un vaso, olvidada, se desmaya una flor.", "", "El jardín puebla el triunfo de los pavos reales.", "Parlanchina, la dueña dice cosas banales,", "y vestido de rojo piruetea el bufón.", "La princesa no ríe, la princesa no siente;", "la princesa persigue por el cielo de Oriente", "la libélula vaga de una vaga ilusión.", "¿Piensa, acaso, en el príncipe de Golconda o de China,", "o en el que ha detenido su carroza argentina", "para ver de sus ojos la dulzura de luz?", "¿O en el rey de las islas de las rosas fragantes,", "o en el que es soberano de los claros diamantes,", "o en el dueño orgulloso de las perlas de Ormuz?", "", "¡Ay!, la pobre princesa de la boca de rosa", "quiere ser golondrina, quiere ser mariposa,", "tener alas ligeras, bajo el cielo volar;", "ir al sol por la escala luminosa de un rayo,", "saludar a los lirios con los versos de mayo", "o perderse en el viento sobre el trueno del mar.", "", "Ya no quiere el palacio, ni la rueca de plata,", "ni el halcón encantado, ni el bufón escarlata,", "ni los cisnes unánimes en el lago de azur.", "Y están tristes las flores por la flor de la corte,", "los jazmines de Oriente, los nelumbos del Norte,", "de Occidente las dalias y las rosas del Sur.", "", "¡Pobrecita princesa de los ojos azules!", "Está presa en sus oros, está presa en sus tules,", "en la jaula de mármol del palacio real;", "el palacio soberbio que vigilan los guardas,", "que custodian cien negros con sus cien alabardas,", "un lebrel que no duerme y un dragón colosal.", "", "¡Oh, quién fuera hipsipila que dejó la crisálida!", "(La princesa está triste. La princesa está pálida).", "¡Oh visión adorada de oro, rosa y marfil!", "¡Quién volara a la tierra donde un príncipe existe,", "(La princesa está pálida. La princesa está triste).", "más brillante que el alba, más hermoso que abril!", "–«Calla, calla, princesa –dice el hada madrina–;", "en caballo, con alas, hacia acá se encamina,", "en el cinto la espada y en la mano el azor,", "el feliz caballero que te adora sin verte,", "y que llega de lejos, vencedor de la Muerte,", "a encenderte los labios con un beso de amor»."]}],
      ejemplos: [
        {q: "Texto 1: ¿por qué está triste la princesa?", pasos: ["Lo tiene todo (palacio, oro, bufón), pero está «presa en sus oros».", "Quiere volar libre y encontrar a un príncipe que la quiera."], r: "Está aburrida y encerrada; quiere libertad y amor."},
        {q: "Texto 1: ¿qué esperanza le da el hada madrina?", pasos: ["Le dice «calla, calla, princesa».", "Viene un caballero en un caballo con alas a darle un beso de amor."], r: "Que llega un caballero que la quiere."}],
      ojo: "En Sonatina busca: colores (azul, rojo), joyas (oro, diamantes, perlas), animales (cisnes, pavos reales) y lugares lejanos (China, Oriente). ¡Todo eso es modernismo!"},
    {n: 3, ic: "🌳", titulo: "Juan Ramón Jiménez y Antonio Machado", bloque: "Literatura",
      idea: "Dos grandes poetas que empiezan en el modernismo pero de forma más íntima: hablan de la tristeza, el tiempo y la muerte.",
      reglas: [
        "🌳 <b>Juan Ramón Jiménez</b>: empieza modernista (<i>Arias tristes</i>, <i>Jardines lejanos</i>, <i>La soledad sonora</i>). Desde 1916 hace una poesía nueva, más pura y sencilla.",
        "🛤️ <b>Antonio Machado</b>:",
        "• <b><i>Soledades</i> (1903)</b>: modernista e íntimo. Tono <b>triste</b>. Temas: el amor, el dolor, el <b>paso del tiempo</b>, la soledad, la infancia, los sueños.",
        "• Usa <b>símbolos</b>: el camino, el río, el mar, la tarde, el otoño. La <b>tarde</b> significa que algo se acaba.",
        "• El <b>paisaje</b> muestra lo que siente por dentro.",
        "• <b><i>Campos de Castilla</i> (1912)</b>: mira la realidad de España, como los del 98: el <b>atraso y la pobreza</b> de Castilla. También poemas por la muerte de su mujer, <b>Leonor</b>.",
        "• Después: <i>Nuevas canciones</i> (1924) y <i>Proverbios y cantares</i> (poemas cortos que enseñan)."],
      glosario: [["Símbolo", "Una cosa que representa otra: la tarde = el final."], ["Cenicienta", "Gris, del color de la ceniza."], ["Mustia", "Triste, sin fuerza, como una flor seca."], ["Destartalada", "Rota, desordenada."], ["Hipocondría", "Tristeza y miedo constante a estar enfermo."], ["Nostáljico", "Con nostalgia: pena por lo que se ha perdido."]],
      textos: [
        {n: 2, titulo: "El viaje definitivo", autor: "Juan Ramón Jiménez (Poemas agrestes)", versos: ["... Y yo me iré. Y se quedarán los pájaros", "cantando;", "y se quedará mi huerto, con su verde árbol,", "y con su pozo blanco.", "Todas las tardes, el cielo será azul y plácido;", "y tocarán, como esta tarde están tocando,", "las campanas del campanario.", "Se morirán aquellos que me amaron;", "y el pueblo se hará nuevo cada año;", "y en el rincón aquel de mi huerto florido y encalado,", "mi espíritu errará nostáljico...", "Y yo me iré; y estaré solo, sin hogar, sin árbol", "verde, sin pozo blanco,", "sin cielo azul y plácido...", "Y se quedarán los pájaros cantando."]},
        {n: 3, titulo: "Es una tarde cenicienta y mustia", autor: "Antonio Machado (Soledades. Galerías. Otros poemas)", versos: ["Es una tarde cenicienta y mustia,", "destartalada, como el alma mía;", "y es esta vieja angustia", "que habita mi usual hipocondría.", "La causa de esta angustia no consigo", "ni vagamente comprender siquiera;", "pero recuerdo y, recordando, digo:", "–Sí, yo era niño, y tú, mi compañera."]},
        {n: 4, titulo: "CXIX", autor: "Antonio Machado (Campos de Castilla)", versos: ["Señor, ya me arrancaste lo que más quería.", "Oye otra vez, Dios mío, mi corazón clamar.", "Tu voluntad se hizo, Señor, contra la mía.", "Señor, ya estamos solos mi corazón y el mar."]}],
      ejemplos: [
        {q: "Texto 2: ¿qué es «el viaje definitivo»?", pasos: ["«Yo me iré» y todo seguirá igual: los pájaros, el huerto, las campanas.", "Es un viaje del que no se vuelve."], r: "La muerte. El mundo sigue aunque él ya no esté."},
        {q: "Texto 4: ¿qué le «arrancó» Dios a Machado?", pasos: ["«Lo que más quería».", "Su mujer, Leonor, murió muy joven."], r: "A su mujer, Leonor."}],
      ojo: "En Machado, la tarde triste y gris (Texto 3) es como su alma: el paisaje muestra lo que siente."},
    {n: 4, ic: "🇪🇸", titulo: "La generación del 98", bloque: "Literatura",
      idea: "Los escritores del 98 se preguntan qué le pasa a España después de perder Cuba, y lo cuentan sobre todo en novelas.",
      reglas: [
        "😟 Nace por la <b>pérdida de Cuba (1898)</b>. Se preguntan por el <b>problema de España</b>: qué va mal y cómo arreglarlo.",
        "🚶 <b>Viajan por España</b> y describen los campos, los pueblos y los monumentos.",
        "👷 <b>La historia de la gente normal</b>: no les interesan los reyes ni las batallas, sino la vida diaria de los que trabajan. Unamuno lo llama <b>intrahistoria</b>.",
        "😠 <b>Critican los males de España</b>: el caciquismo, el <b>hambre</b>, la <b>ignorancia</b>. Son <b>pesimistas</b>.",
        "🏜️ <b>El paisaje de Castilla</b>: la meseta seca es el símbolo de una España en decadencia.",
        "⏳ <b>La vida y la muerte</b>, el paso del tiempo: sienten angustia.",
        "📚 Les gustan los <b>clásicos</b>: el Poema de Mio Cid, Berceo, Manrique, Cervantes, Góngora.",
        "🗣️ <b>Estilo sencillo y directo</b>: sin adornos. Importa lo que se dice."],
      glosario: [["Intrahistoria", "La historia de la gente normal, la que no sale en los libros."], ["Caciquismo", "Cuando un hombre rico y poderoso manda en un pueblo y controla los votos."], ["Pesimista", "Que piensa que todo va a ir mal."], ["Meseta", "Tierra alta y llana, como la de Castilla."], ["Decadencia", "Cuando algo va cada vez peor."]],
      ejemplos: [
        {q: "Un escritor cuenta la vida de un campesino que trabaja cada día, no la de un rey.", pasos: ["Le interesa la gente normal, no los grandes hombres.", "Unamuno lo llamó intrahistoria."], r: "Rasgo del 98: la historia de la gente normal (intrahistoria)."}],
      ojo: "El 98 usa un estilo sencillo, sin adornos. El modernismo, al revés, usa un lenguaje muy rico y adornado."},
    {n: 5, ic: "📕", titulo: "Unamuno y Baroja", bloque: "Literatura",
      idea: "Unamuno y Baroja son los grandes novelistas del 98. Unamuno inventa las «nivolas»; Baroja escribe novelas abiertas con personajes que luchan y no ganan.",
      reglas: [
        "🤔 <b>Miguel de Unamuno</b>: escribe ensayo, poesía, teatro y novela. Le preocupan <b>España</b> y sus <b>dudas</b> sobre la vida y la muerte.",
        "• Inventa la palabra <b>intrahistoria</b>.",
        "• Sus novelas son <b>«nivolas»</b>: casi sin descripciones; mucho <b>diálogo</b> y pensamientos de los personajes.",
        "• <b><i>Niebla</i></b>: el protagonista, Augusto Pérez, va a ver al propio Unamuno para decirle que se quiere suicidar. ¡El autor sale como personaje!",
        "• Otras: <i>La tía Tula</i> y <b><i>San Manuel Bueno, mártir</i></b> (un cura que ha perdido la fe pero sigue ayudando a su pueblo).",
        "📗 <b>Pío Baroja</b>: el gran novelista del 98. <b>Inconformista</b>: denuncia lo cruel que es la sociedad y defiende a los <b>marginados</b>.",
        "• Sus personajes están <b>solos</b> y quieren cambiar la sociedad, pero <b>no lo consiguen</b>.",
        "• <b>Novelas abiertas</b>: «un saco en el que cabe toda la vida». Más de 60, en grupos de tres (<b>trilogías</b>).",
        "• <i>La busca</i> (pobreza en Madrid), <i>Zalacaín el aventurero</i> y <b><i>El árbol de la ciencia</i></b>: Andrés Hurtado, estudiante de Medicina, se decepciona de la universidad y de la vida."],
      glosario: [["Nivola", "Nombre que inventa Unamuno para sus novelas: casi sin descripciones."], ["Inconformista", "Que no está de acuerdo con cómo son las cosas."], ["Cátedra", "Clase de un profesor en la universidad."], ["Desdichado", "Desgraciado, muy malo."], ["Grotesco", "Ridículo, que da risa pero también pena."]],
      textos: [{n: 5, titulo: "El árbol de la ciencia (capítulo «Los estudiantes»)", autor: "Pío Baroja", prosa: true, versos: ["El estudiante madrileño, sobre todo el venido de provincias, llegaba a la corte con un espíritu donjuanesco, con la idea de divertirse, jugar, perseguir a las mujeres, con la ilusión de vivir \"llevando a sangre y fuego amores y desafíos\".", "El estudiante culto, aunque intentara adquirir una idea clara de su país, no podía. Los periódicos daban una idea incompleta de todo: si en Francia o en Alemania no hablaban de las cosas de España, o hablaban de ellas en broma, era porque nos odiaban. España entera, y Madrid sobre todo, vivía en un ambiente de optimismo absurdo: todo lo español era lo mejor. Esa tendencia natual a la mentira, a la ilusión, contribuía al estancamiento de las ideas.", "Aquel ambiente de falsedad se reflejaba en las cátedras. Andrés Hurtado pudo comprobarlo al comenzar a estudiar Medicina. Los profesores del año preparatorio eran viejísimos; había algunos que llevaban cerca de cincuenta años explicando. Sin duda no los jubilaban por sus influencias y por esas simpatías y respeto que ha habido siempre en España por lo inútil.", "Sobre todo, la clase de Química era escandalosa. Los estudiantes aplaudían al profesor, riendo a carcajadas. A veces, en medio de la clase, a alguno de sus alumnos se le ocurría marcharse. Los pasos del fugitivo producían gran estrépito, y los demás muchachos, sentados, llevaban el compás golpeando con los pies y con los bastones.", "En la clase se hablaba, se fumaba, se leían novelas, nadie seguía la explicación; alguno llegó a presentarse con una corneta, y cuando el profesor se disponía a echar en un vaso de agua un trozo de potasio, dio dos toques de atención; otro metió un perro vagabundo, y fue un problema echarlo.", "Andrés Hurtado, los primeros días de clase, no salía de su asombro. Él hubiera querido encontrar una disciplina fuerte y al mismo tiempo afectuosa, y se encontraba con una clase grotesca, en que los alumnos se burlaban del profesor. Su preparación para la ciencia no podía ser más desdichada."]}],
      ejemplos: [
        {q: "Texto 5: ¿cómo era la clase de Química?", pasos: ["Los alumnos se reían, fumaban, leían novelas…", "Uno llevó una corneta y otro un perro."], r: "Un desastre: nadie atendía y se burlaban del profesor."},
        {q: "Texto 5: ¿qué critica Baroja de España?", pasos: ["Profesores viejísimos que no se jubilan «por influencias».", "Un «optimismo absurdo»: todo lo español es lo mejor."], r: "La falsedad, el atraso y la mala enseñanza."}],
      ojo: "Unamuno = nivolas y Niebla. Baroja = novelas abiertas y El árbol de la ciencia."},
    {n: 6, ic: "🎭", titulo: "El teatro y Valle-Inclán", bloque: "Literatura",
      idea: "El teatro de principios del siglo XX tiene dos caminos: el que gusta al público y el que intenta cambiar las cosas. Valle-Inclán inventa el esperpento.",
      reglas: [
        "🎟️ El teatro es un <b>negocio</b>: hay que gustar al público rico (burgués).",
        "😀 <b>a) El teatro que triunfa</b>:",
        "• La <b>comedia burguesa</b> de <b>Jacinto Benavente</b>.",
        "• El <b>teatro en verso</b>, al estilo romántico y modernista (Marquina, Villaespesa, los hermanos Machado).",
        "• El <b>teatro cómico</b>: los hermanos Álvarez Quintero, <b>Carlos Arniches</b> y <b>Muñoz Seca</b>.",
        "💡 <b>b) El teatro que quiere innovar</b> (y fracasa con el público): Unamuno, Azorín, Jacinto Grau… y <b>Valle-Inclán</b>.",
        "🪞 <b>Ramón del Valle-Inclán</b>: el mayor autor de teatro de la época. Empieza modernista y acaba creando el <b>esperpento</b>.",
        "• <b>Esperpento</b>: deforma la realidad, como un <b>espejo de feria</b> que te hace feo, para enseñar lo falso, lo ridículo y lo injusto de la sociedad. Las personas parecen <b>marionetas</b> y muñecos.",
        "• <b><i>Luces de bohemia</i> (1920)</b>: la última noche del poeta ciego <b>Max Estrella</b>, que pasea por Madrid con don Latino y muere en la calle. Critica el mal gobierno, la corrupción, la <b>represión policial</b> y la miseria del pueblo."],
      glosario: [["Burgués", "Persona de clase media o rica, con negocios."], ["Esperpento", "Obra que deforma la realidad para criticarla."], ["Represión", "Cuando la policía o el poder castigan con violencia."], ["Empeñista", "Persona que presta dinero a cambio de objetos."], ["Proletario", "Trabajador pobre."], ["Sicario", "Asesino pagado."]],
      textos: [{n: 6, titulo: "Luces de bohemia (escena undécima)", autor: "Ramón del Valle-Inclán", prosa: true, versos: ["Una calle del Madrid austriaco. Un grupo consternado de vecinas, en la acera. Una mujer, despechugada y ronca, tiene en los brazos a su niño muerto, la sien traspasada por el agujero de una bala. MAX ESTRELLA y DON LATINO hacen un alto.", "MAX. –También aquí se pisan cristales rotos.", "DON LATINO. –¡La zurra ha sido buena!", "LA MADRE DEL NIÑO. –¡Maricas, cobardes! ¡Maricas, cobardes!", "MAX. –¿Qué sucede, Latino? ¿Quién llora? ¿Quién grita con tal rabia?", "DON LATINO. –Una verdulera, que tiene a su chico muerto en los brazos.", "MAX. –¡Me ha estremecido esa voz trágica!", "LA MADRE DEL NIÑO. –¡Sicarios! ¡Asesinos de criaturas!", "EL EMPEÑISTA. –Está con algún trastorno y no mide palabras.", "EL GUARDIA. –La autoridad también se hace al cargo.", "EL TABERNERO. –Son desgracias inevitables para el restablecimiento del orden.", "EL EMPEÑISTA. –Las turbas anárquicas me han destrozado el escaparate.", "EL TABERNERO. –El pueblo que roba en los establecimientos públicos, donde se le abastece, es un pueblo sin ideales patrios.", "UN ALBAÑIL. –El pueblo tiene hambre.", "EL EMPEÑISTA. –Y mucha soberbia.", "LA MADRE DEL NIÑO. –¡Maricas, cobardes! ¡Que me maten como a este rosal de mayo!", "LA TRAPERA. –¡Un inocente sin culpa! ¡Hay que considerarlo!", "EL TABERNERO. –Siempre saldréis diciendo que no hubo los toques de Ordenanza.", "EL RETIRADO. –Yo los he oído.", "LA MADRE DEL NIÑO. –¡Mentira!", "EL EMPEÑISTA. –El dolor te enloquece, Romualda.", "EL RETIRADO. –Mi palabra es sagrada. El Principio de Autoridad es inexorable.", "EL ALBAÑIL. –Con los pobres. Se ha matado, por defender el comercio, que nos chupa la sangre.", "EL TABERNERO. –Y que paga sus contribuciones, no hay que olvidarlo.", "EL EMPEÑISTA. –El comercio honrado no chupa la sangre.", "LA PORTERA. –¡Nos quejamos de vicio!", "EL ALBAÑIL. –La vida del proletario no representa nada para el Gobierno.", "MAX. –Latino, sácame de este círculo infernal.", "Llega un tableteo de fusilada. El grupo se mueve en confusa y medrosa alerta. Descuella el grito ronco de la mujer, que al ruido de las descargas, aprieta a su niño muerto en los brazos.", "LA MADRE DEL NIÑO. –¡Negros fusiles, matadme también con vuestros plomos!", "MAX. –Esa voz me traspasa. ¡Jamás oí voz con esa cólera trágica!", "DON LATINO. –Hay mucho de teatro.", "MAX. –¡Imbécil!"]}],
      ejemplos: [
        {q: "Texto 6: ¿qué ha pasado?", pasos: ["Hubo disturbios en la calle y la policía disparó.", "Una bala ha matado a un niño, y su madre lo tiene en brazos."], r: "La policía ha matado a un niño inocente."},
        {q: "Texto 6: ¿qué piensan los comerciantes y qué piensa el pueblo?", pasos: ["El empeñista y el tabernero defienden el orden y sus tiendas: «desgracias inevitables».", "El albañil, la trapera y la portera defienden al niño y a los pobres: «el pueblo tiene hambre»."], r: "Los comerciantes justifican la muerte; el pueblo la denuncia."}],
      ojo: "Esperpento = espejo que deforma. Lo feo y lo ridículo sirven para criticar la sociedad."}
  ]
};
window.LYAFpb.asignatura({id: "lengua", n: "Lengua y Literatura", ic: "📖", color: "#7c5cff",
  intro: "Explicaciones en lectura fácil, textos del libro, actividades para elegir en tres niveles y muchas pistas.",
  temas: [F2, F3, F4], pronto: ["Tema 1", "Tema 5"]});
})();
