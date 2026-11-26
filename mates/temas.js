/* COMPRENDO · Matemáticas: las explicaciones de cada apartado (escritas a mano, con palabras nuestras; no copian el libro).
   Cada apartado: {n, titulo, ic, idea (una frase), reglas [HTML], ejemplos [{q, pasos: [HTML], r}], ojo (lo que más se confunde)}.
   Los ejercicios los hace mates/banco.js. */
(() => {
const T2 = {
  id: "t2", n: 2, titulo: "Números enteros", ic: "➖➕", color: "#4f8cff",
  intro: "Los números que pueden ser positivos, negativos o cero. Sirven para temperaturas bajo cero, sótanos, deudas, profundidades o años antes de Cristo.",
  aps: [
    {n: 1, ic: "📏", titulo: "Números enteros y la recta",
      idea: "Los números enteros son los positivos (+1, +2, +3…), el 0 y los negativos (−1, −2, −3…). Se escriben con la letra ℤ.",
      reglas: [
        "Usamos <b>negativos</b> para lo que está por debajo de cero: bajo el nivel del mar, sótanos, deudas, grados bajo cero o años antes de Cristo.",
        "El <b>0</b> no es ni positivo ni negativo.",
        "En la <b>recta numérica</b> el 0 va en el centro, los positivos a la derecha y los negativos a la izquierda, todos a la misma distancia.",
        "El <b>valor absoluto</b> |a| es la distancia del número al 0: es el número sin su signo. |−7| = 7 y |+7| = 7.",
        "El <b>opuesto</b> es el número que está a la misma distancia del 0 pero al otro lado: se cambia el signo. Op(+4) = −4 y Op(−4) = +4.",
        "Los positivos se pueden escribir sin el +: +5 = 5."],
      ejemplos: [
        {q: "Un submarino está a 120 m bajo el nivel del mar.", pasos: ["«Bajo el nivel del mar» es por debajo de cero → negativo."], r: "−120"},
        {q: "|−9| y Op(−9)", pasos: ["Valor absoluto: la distancia al 0, sin signo → 9.", "Opuesto: cambio el signo → +9."], r: "|−9| = 9 · Op(−9) = +9"}],
      ojo: "El valor absoluto nunca es negativo: |▢| = −4 no tiene solución."},
    {n: 2, ic: "⚖️", titulo: "Comparar y ordenar",
      idea: "De dos números enteros, es mayor el que está más a la derecha en la recta.",
      reglas: [
        "Cualquier <b>positivo</b> es mayor que cualquier <b>negativo</b>. El 0 es mayor que los negativos y menor que los positivos.",
        "Entre dos <b>positivos</b>, es mayor el de mayor valor absoluto: +8 > +3.",
        "Entre dos <b>negativos</b>, es mayor el de <b>menor</b> valor absoluto: −3 > −8 (−3 está más cerca del 0, más a la derecha).",
        "Para <b>ordenar</b>: separa positivos y negativos, ordena cada grupo y coloca el 0 en medio."],
      ejemplos: [
        {q: "Ordena de mayor a menor: −9, 0, +3, +8, −7, −10, +4", pasos: ["Positivos: +8 > +4 > +3.", "Negativos (menor valor absoluto, mayor): −7 > −9 > −10.", "Todo junto, con el 0 en medio."], r: "+8 > +4 > +3 > 0 > −7 > −9 > −10"}],
      ojo: "−10 es MENOR que −2, aunque 10 sea mayor que 2."},
    {n: 3, ic: "➕", titulo: "Suma y resta de dos enteros",
      idea: "Para sumar, mira si los dos números tienen el mismo signo o no. Para restar, suma el opuesto.",
      reglas: [
        "<b>Mismo signo</b>: se suman los valores absolutos y se deja el mismo signo. (−6) + (−1) = −7.",
        "<b>Distinto signo</b>: se resta el valor absoluto menor del mayor y se pone el signo del que tiene mayor valor absoluto. (−5) + (+3) = −2.",
        "<b>Restar</b> es sumar el opuesto del segundo: (+3) − (−4) = (+3) + (+4) = +7.",
        "Sumar o restar 0 no cambia el número."],
      ejemplos: [
        {q: "(−5) + (+3)", pasos: ["Distinto signo: 5 − 3 = 2.", "El de mayor valor absoluto es −5 → signo −."], r: "−2"},
        {q: "(−2) − (−7)", pasos: ["Resta → sumo el opuesto: (−2) + (+7).", "Distinto signo: 7 − 2 = 5, signo +."], r: "+5"}],
      ojo: "Dos negativos sumados dan siempre negativo; pero restar un negativo es sumar."},
    {n: 4, ic: "🧮", titulo: "Suma y resta de varios",
      idea: "Primero se quitan los paréntesis (forma abreviada); después se suman los positivos por un lado y los negativos por otro.",
      reglas: [
        "<b>Regla 1</b>: al primer número se le quita el paréntesis; si es positivo, se escribe sin signo. (+3) → 3.",
        "<b>Regla 2</b>: si delante del paréntesis hay un <b>+</b>, se deja el signo del número. +(−8) = −8 · +(+1) = +1.",
        "<b>Regla 3</b>: si delante hay un <b>−</b>, se cambia el signo del número. −(+6) = −6 · −(−4) = +4.",
        "Con la forma abreviada: suma los positivos, suma los negativos y resta los dos resultados.",
        "Si hay <b>paréntesis con operaciones dentro</b>, primero se hace lo de dentro y luego se quitan."],
      ejemplos: [
        {q: "(−6) − (+4) + (+2) + (+5) − (−7) + (−3)", pasos: ["Forma abreviada: −6 − 4 + 2 + 5 + 7 − 3.", "Positivos: 2 + 5 + 7 = 14. Negativos: 6 + 4 + 3 = 13.", "14 − 13."], r: "1"},
        {q: "6 + (−5 + 3 − 2) − (4 − 7 + 1 − 9) − 8", pasos: ["Dentro de los paréntesis: (−4) y (−11).", "6 + (−4) − (−11) − 8 = 6 − 4 + 11 − 8."], r: "5"}],
      ojo: "Un − delante del paréntesis cambia el signo de lo que sale: 6 − (−11) = 6 + 11."},
    {n: 5, ic: "✖️", titulo: "Multiplicación y división",
      idea: "Se multiplican (o dividen) los valores absolutos y el signo sale con la regla de los signos.",
      reglas: [
        "<b>Regla de los signos</b> (igual para · y para :): + y + → + · − y − → + · + y − → − · − y + → −.",
        "Con palabras: <b>signos iguales dan +</b> y <b>signos distintos dan −</b>.",
        "Con <b>varios</b> números: primero el signo (si hay un número par de negativos, +; si es impar, −) y luego se opera de <b>izquierda a derecha</b>."],
      ejemplos: [
        {q: "(−42) : (−6)", pasos: ["Signos iguales → +.", "42 : 6 = 7."], r: "+7"},
        {q: "(−8) · (−3) : (+4) : (−2)", pasos: ["Tres negativos (impar) → signo −.", "8 · 3 = 24; 24 : 4 = 6; 6 : 2 = 3."], r: "−3"}],
      ojo: "Las divisiones y multiplicaciones seguidas se hacen en orden, de izquierda a derecha: 18 : 3 · 2 = 6 · 2 = 12."},
    {n: 6, ic: "⚡", titulo: "Potencias",
      idea: "Una potencia es una multiplicación de factores iguales: aⁿ = a · a · … · a (n veces). a es la base y n el exponente.",
      reglas: [
        "Si la <b>base es positiva</b>, la potencia es siempre positiva.",
        "Si la <b>base es negativa</b>: con exponente <b>par</b> sale positiva y con exponente <b>impar</b>, negativa.",
        "<b>Ojo con el paréntesis</b>: (−2)⁴ = (−2)·(−2)·(−2)·(−2) = +16, pero −2⁴ = −(2·2·2·2) = −16. En −2⁴ la base es 2 y el menos va delante."],
      ejemplos: [
        {q: "(−4)³", pasos: ["4³ = 4 · 4 · 4 = 64.", "Base negativa y exponente impar → signo −."], r: "−64"},
        {q: "−5²", pasos: ["La base es 5: 5² = 25.", "El − de delante se queda."], r: "−25"}],
      ojo: "(−1) elevado a un número par da 1, y a un impar da −1, por grande que sea el exponente."},
    {n: 7, ic: "√", titulo: "Raíz cuadrada",
      idea: "La raíz cuadrada de a es un número b que, al cuadrado, da a: √a = b porque b² = a.",
      reglas: [
        "Los números con raíz exacta se llaman <b>cuadrados perfectos</b>: 1, 4, 9, 16, 25, 36…",
        "Un número <b>positivo</b> tiene <b>dos raíces</b>, una positiva y otra negativa: √36 = ±6, porque 6² = 36 y (−6)² = 36.",
        "Un número <b>negativo no tiene</b> raíz cuadrada: ningún número al cuadrado da negativo.",
        "Si no es cuadrado perfecto, la <b>raíz entera</b> es el mayor número cuyo cuadrado no se pasa del radicando. El <b>resto</b> es radicando − raíz².",
        "En las operaciones combinadas se usa solo la raíz positiva."],
      ejemplos: [
        {q: "√92", pasos: ["9² = 81 ≤ 92 y 10² = 100 > 92 → no es exacta.", "Raíz entera: 9. Resto: 92 − 81 = 11."], r: "Raíz 9 y resto 11"},
        {q: "√−16", pasos: ["Ningún número al cuadrado da −16."], r: "No existe"}],
      ojo: "El resto nunca puede ser mayor que 2 · raíz: si lo es, la raíz entera era más grande."},
    {n: 8, ic: "🧩", titulo: "Operaciones combinadas",
      idea: "Cuando hay varias operaciones juntas, se hacen en un orden fijo (la jerarquía).",
      reglas: [
        "<b>1.º</b> Lo de dentro de los <b>paréntesis y corchetes</b> (empezando por el de más adentro).",
        "<b>2.º</b> Las <b>potencias y raíces</b>.",
        "<b>3.º</b> Las <b>multiplicaciones y divisiones</b>, de izquierda a derecha.",
        "<b>4.º</b> Las <b>sumas y restas</b>, de izquierda a derecha.",
        "Las raíces, en las combinadas, solo con su valor positivo: √49 = 7."],
      ejemplos: [
        {q: "√49 − (−2) · (−4) − 6² : (−9)", pasos: ["Potencias y raíces: 7 − (−2) · (−4) − 36 : (−9).", "Multiplicaciones y divisiones: 7 − (+8) − (−4).", "Sumas y restas: 7 − 8 + 4."], r: "3"},
        {q: "(−√25) + [(−2)³ − (+2) : (−1)] : (−3) − (+5) · [(−3) + (−2)]", pasos: ["Dentro de los corchetes: [−8 + 2] = [−6] y [−5].", "Raíz: −5 + (−6) : (−3) − (+5) · (−5).", "· y : → −5 + 2 + 25."], r: "22"}],
      ojo: "18 : 3 · 2 no es 18 : 6: se hace de izquierda a derecha → 6 · 2 = 12."}
  ]
};
window.LYAMatesTemas = {cursos: [{id: "1eso", n: "1.º ESO", temas: [T2], pronto: ["Números naturales", "Divisibilidad", "Fracciones", "Números decimales", "Proporcionalidad", "Álgebra", "Geometría", "Estadística"]}], T2};
})();
