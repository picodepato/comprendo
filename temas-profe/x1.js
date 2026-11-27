/* COMPRENDO · Tema de ejemplo de «Temas de mis profes» (solo lo ve el admin): sirve de modelo para la rutina de cada mañana.
   Petición: 2.º ESO · Matemáticas · Tema 4 «Las fracciones» · alumnado: lectura fácil. Formato explicado en temas-profe/RUTINA.md. */
(() => {
const {E, REL, CLA} = window.LYATemasProfe;
window.LYATemasProfe.registrar({
  id: "x1", profe: "admin", curso: "2.º ESO", asignatura: "Matemáticas", peticion: "ejemplo",
  tema: {
    id: "x1", n: 4, titulo: "Las fracciones (ejemplo)", ic: "🍕", color: "#7c5cff",
    intro: "Una fracción dice en cuántas partes iguales partimos algo y cuántas cogemos. Aprendemos a leerlas y a ver cuándo dos fracciones valen lo mismo.",
    aps: [
      {n: 1, ic: "🍕", titulo: "Qué es una fracción",
        idea: "Una fracción tiene dos números: el de abajo dice en cuántas partes iguales partimos; el de arriba, cuántas partes cogemos.",
        reglas: [
          "El número de <b>abajo</b> es el <b>denominador</b>: en cuántas partes iguales está partido el todo.",
          "El número de <b>arriba</b> es el <b>numerador</b>: cuántas partes cogemos.",
          "<b>3/4</b> se lee «<b>tres cuartos</b>»: partimos en 4 y cogemos 3.",
          "Si el numerador y el denominador son <b>iguales</b> (4/4), tenemos <b>el todo entero</b>: vale 1."],
        glosario: [["Numerador", "El número de arriba. Las partes que coges."], ["Denominador", "El número de abajo. Las partes que hay en total."]],
        ejemplos: [{q: "Una pizza está partida en 8 trozos iguales y te comes 3. ¿Qué fracción te has comido?", pasos: ["Partes en total: 8 → abajo.", "Partes que coges: 3 → arriba."], r: "3/8 (tres octavos)"}],
        ojo: "Las partes tienen que ser IGUALES. Si no, no es una fracción."},
      {n: 2, ic: "⚖️", titulo: "Fracciones equivalentes",
        idea: "Dos fracciones son equivalentes cuando valen lo mismo, aunque tengan números distintos.",
        reglas: [
          "<b>1/2</b> y <b>2/4</b> valen lo mismo: media pizza es igual que dos cuartos de pizza.",
          "Para hacer una equivalente, <b>multiplica</b> (o divide) <b>arriba y abajo por el mismo número</b>.",
          "Ejemplo: 1/3 → multiplico por 2 arriba y abajo → <b>2/6</b>."],
        glosario: [["Equivalente", "Que vale lo mismo."]],
        ejemplos: [{q: "¿Es 2/3 equivalente a 4/6?", pasos: ["2 × 2 = 4 arriba.", "3 × 2 = 6 abajo.", "Arriba y abajo por el mismo número → sí."], r: "Sí, son equivalentes."}],
        ojo: "Hay que hacer lo mismo ARRIBA y ABAJO. Si solo cambias uno, la fracción cambia."}]},
  banco: {
    nombres: {1: "Qué es una fracción", 2: "Fracciones equivalentes"},
    manual: {
      1: [
        E(1, "Partes", "En 3/4, ¿qué número dice en cuántas partes partimos?", ["El 4", "El 3"], ["El 3 es el de arriba: las partes que coges."],
          ["Mira el número de abajo.", "El de abajo es el denominador.", "Es el 4."], "El denominador (abajo) dice en cuántas partes partimos: 4."),
        E(1, "Leer", "¿Cómo se lee 1/2?", ["Un medio", "Un dos"], ["Las fracciones no se leen así."],
          ["Piensa en «media pizza».", "1/2 es la mitad.", "Se lee «un medio»."], "1/2 se lee «un medio»."),
        E(1, "Partes", "Una tarta en 6 trozos iguales. Coges 1. ¿Qué fracción es?", ["1/6", "6/1"], ["Abajo van las partes en total (6), no arriba."],
          ["¿Cuántas partes hay en total?", "En total hay 6: van abajo.", "Coges 1: va arriba."], "1/6: arriba lo que coges, abajo el total."),
        E(2, "Partes", "En 5/8, ¿cómo se llama el 5?", ["Numerador", "Denominador", "Entero"], ["El denominador es el de abajo (8).", "No es un número entero, es parte de una fracción."],
          ["Está arriba.", "El de arriba son las partes que coges.", "Se llama numerador."], "El número de arriba es el numerador."),
        E(2, "El todo", "¿Cuánto vale 4/4?", ["1 (el todo entero)", "4", "0"], ["4/4 no son 4 pizzas: es una pizza entera.", "Has cogido todas las partes, no ninguna."],
          ["Partes en total: 4. Partes que coges: 4.", "Has cogido todas.", "Todas las partes = el todo = 1."], "Si coges todas las partes tienes el todo: 4/4 = 1."),
        REL(3, "Leer", "Une cada fracción con cómo se lee.", [["1/2", "un medio"], ["1/3", "un tercio"], ["3/4", "tres cuartos"], ["2/5", "dos quintos"]],
          ["Fíjate en el número de abajo.", "2 → medios, 3 → tercios, 4 → cuartos, 5 → quintos."], "Se dice el número de arriba y luego el de abajo: medios, tercios, cuartos, quintos."),
        CLA(3, "El todo", "¿Es menos de 1 o es 1 entero?", ["Menos de 1", "1 entero"], [["2/3", 0, "Coges 2 de 3: no llegas al todo."], ["5/5", 1, "Arriba y abajo iguales: el todo."], ["1/4", 0, "Solo 1 de 4."], ["8/8", 1, "Todas las partes."]],
          ["Compara el número de arriba con el de abajo.", "Si son iguales, es el todo."], "Arriba = abajo → 1 entero. Arriba más pequeño → menos de 1.")],
      2: [
        E(1, "Equivalentes", "¿1/2 y 2/4 valen lo mismo?", ["Sí", "No"], ["Media pizza y dos cuartos de pizza son lo mismo."],
          ["Piensa en una pizza.", "Dos cuartos son la mitad de la pizza.", "Sí valen lo mismo."], "Sí: 1/2 = 2/4."),
        E(1, "Hacer equivalentes", "Para hacer una equivalente de 1/3, multiplico arriba y abajo por 2. ¿Qué sale?", ["2/6", "2/3"], ["Solo has multiplicado arriba. Hay que hacerlo también abajo."],
          ["1 × 2 arriba.", "3 × 2 abajo.", "Arriba 2, abajo 6."], "1 × 2 = 2 y 3 × 2 = 6 → 2/6."),
        E(2, "Equivalentes", "¿Cuál es equivalente a 3/5?", ["6/10", "6/5", "3/10"], ["Solo se ha cambiado el de arriba.", "Solo se ha cambiado el de abajo."],
          ["Busca la que tenga arriba y abajo multiplicados por el mismo número.", "3 × 2 = 6 y 5 × 2 = 10."], "3/5 × 2/2 = 6/10."),
        E(2, "Hacer equivalentes", "¿Qué hay que hacer para que una fracción siga valiendo lo mismo?", ["Multiplicar arriba y abajo por el mismo número", "Sumar 1 arriba", "Multiplicar solo abajo"],
          ["Sumar no mantiene el valor.", "Si cambias solo abajo, la fracción cambia."], ["Lo que haces arriba, también abajo.", "Y tiene que ser multiplicar o dividir."], "Arriba y abajo por el mismo número."),
        REL(3, "Equivalentes", "Une cada fracción con su equivalente.", [["1/2", "3/6"], ["2/3", "4/6"], ["1/4", "2/8"], ["3/5", "9/15"]],
          ["Multiplica arriba y abajo por el mismo número.", "1/2 × 3 = 3/6."], "Cada pareja tiene arriba y abajo multiplicados por el mismo número.")]},
    parejas: [["Numerador", "El de arriba", 1], ["Denominador", "El de abajo", 1], ["3/4", "Tres cuartos", 1], ["4/4", "El todo (1)", 1], ["1/2", "2/4", 2], ["1/3", "2/6", 2], ["Equivalente", "Vale lo mismo", 2]]},
  /* versiones adaptadas: solo lo que cambia (por apartado) */
  adaptado: {
    tdah: {
      tema: {intro: "Una fracción = partes iguales. Abajo: cuántas hay. Arriba: cuántas coges.",
        aps: [{n: 1, idea: "Abajo: partes que hay. Arriba: partes que coges.",
          reglas: ["<b>Abajo</b> = partes que hay (<b>denominador</b>).", "<b>Arriba</b> = partes que coges (<b>numerador</b>).", "<b>3/4</b> = «tres cuartos»."]},
          {n: 2, idea: "Equivalentes = valen lo mismo.",
          reglas: ["<b>1/2 = 2/4</b>.", "Multiplica <b>arriba y abajo</b> por el <b>mismo número</b>."]}]},
      banco: {manual: {
        1: [
          E(1, "Partes", "3/4. ¿Cuál es el de <b>abajo</b>?", ["4", "3"], ["El 3 está arriba."], ["Mira abajo.", "Abajo hay un 4."], "Abajo está el 4."),
          E(1, "Partes", "Pizza en 8 trozos. Comes 3. ¿Fracción?", ["3/8", "8/3"], ["Abajo va el total: 8."], ["Total: 8 → abajo.", "Comes 3 → arriba."], "3/8."),
          E(1, "Leer", "1/2 se lee…", ["Un medio", "Un dos"], ["No se lee así."], ["Media pizza.", "«Un medio»."], "«Un medio»."),
          E(2, "El todo", "4/4 vale…", ["1", "4", "0"], ["No son 4 pizzas.", "Lo coges todo."], ["Coges todas las partes.", "Todo = 1."], "4/4 = 1."),
          REL(2, "Leer", "Une.", [["1/2", "un medio"], ["1/3", "un tercio"], ["1/4", "un cuarto"]], ["Mira el de abajo.", "2 medios, 3 tercios, 4 cuartos."], "Medios, tercios, cuartos."),
          CLA(3, "El todo", "¿Menos de 1 o 1 entero?", ["Menos de 1", "1 entero"], [["2/3", 0, "No llegas."], ["5/5", 1, "Iguales."], ["1/4", 0, "Poco."]], ["¿Arriba = abajo?", "Iguales → 1."], "Iguales → 1.")]}}}
  }
});
})();
