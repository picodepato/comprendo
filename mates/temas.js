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

/* 4.º ESO PDC · Tema 2: el libro empieza en el punto 2 (proporcionalidad directa). Los ejercicios, en mates/pdc.js */
const P2 = {
  id: "p2", n: 2, titulo: "Proporcionalidad y porcentajes", ic: "%", color: "#2fbf71", banco: "LYAMatesPDC", dec: true,
  intro: "Comprar fruta, repartir un premio, las rebajas, el IVA o lo que te da el banco: casi todo se calcula con proporciones y porcentajes.",
  aps: [
    {n: 1, ic: "📈", titulo: "Proporcionalidad directa",
      idea: "Dos magnitudes son directamente proporcionales si, cuando una se hace el doble, el triple o la mitad, la otra también.",
      reglas: [
        "Una <b>magnitud</b> es algo que se puede medir o contar: kilos, euros, horas, kilómetros…",
        "Son <b>directas</b> si al doble le toca el doble y a la mitad, la mitad. Ejemplo: kilos de fruta y lo que pagas.",
        "En una tabla de proporcionalidad directa, <b>abajo : arriba</b> da siempre el mismo número (la <b>razón</b>).",
        "<b>Reducción a la unidad</b>: calcula lo que corresponde a 1 (se <b>divide</b>) y luego multiplica por lo que te piden.",
        "<b>Regla de tres directa</b>: se colocan los datos en dos filas y se multiplica <b>en cruz</b>: x = b · p : a."],
      ejemplos: [
        {q: "Si 3 kg de cerezas cuestan 4,5 €, ¿cuánto cuestan 4 kg?", pasos: ["Más kilos, más dinero → directa.", "1 kg → 4,5 : 3 = 1,5 €.", "4 kg → 4 · 1,5 = 6 €."], r: "6 €"},
        {q: "Un tren hace 220 km en 2 h. ¿Cuántos km hace en 5 h?", pasos: ["Regla de tres: 2 h → 220 km; 5 h → x.", "x = 5 · 220 : 2 = 1.100 : 2."], r: "550 km"}],
      ojo: "Que las dos crezcan no basta: tiene que ser en la misma proporción. Con el doble de edad no mides el doble."},
    {n: 2, ic: "📉", titulo: "Proporcionalidad inversa",
      idea: "Son inversamente proporcionales si, cuando una se hace el doble, la otra se hace la mitad (y al revés).",
      reglas: [
        "Ejemplo: cuantos más albañiles, <b>menos</b> días tardan. El doble de albañiles tarda la mitad.",
        "En una tabla inversa, <b>arriba · abajo</b> da siempre el mismo número.",
        "<b>Reducción a la unidad</b>: con 1 solo se tarda más, así que se <b>multiplica</b>; luego se divide entre lo que te piden.",
        "<b>Regla de tres inversa</b>: se multiplica <b>en línea</b> (los de la misma fila) y se divide: x = a · p : b."],
      ejemplos: [
        {q: "2 personas cortan el césped en 6 h. ¿Cuánto tardan 3 personas?", pasos: ["Más personas, menos tiempo → inversa.", "1 persona → 2 · 6 = 12 h.", "3 personas → 12 : 3 = 4 h."], r: "4 h"},
        {q: "A 120 km/h se tarda 4 h. ¿Cuánto a 80 km/h?", pasos: ["Más despacio, más tiempo → inversa.", "x = 120 · 4 : 80 = 480 : 80."], r: "6 h"}],
      ojo: "Antes de calcular, pregúntate: si una sube, ¿la otra sube o baja? Si baja, es inversa."},
    {n: 3, ic: "🧱", titulo: "Proporcionalidad compuesta",
      idea: "Es cuando hay tres magnitudes o más. Se mira cada una por separado con la que te preguntan: directa o inversa.",
      reglas: [
        "Compara cada magnitud con la que te preguntan, <b>como si las demás no cambiaran</b>.",
        "Luego <b>reduce a la unidad</b>: lo que hace 1 obrero en 1 hora, 1 máquina en 1 día…",
        "Si es <b>directa</b>, para pasar a 1 se divide; si es <b>inversa</b>, se multiplica.",
        "Al final, se multiplica o divide por los datos nuevos."],
      ejemplos: [
        {q: "2 obreros, 5 h al día, hacen 50 m de valla. ¿Y 4 obreros, 6 h al día?", pasos: ["Obreros y metros: directa. Horas y metros: directa.", "1 obrero, 1 h → 50 : 2 : 5 = 5 m.", "4 obreros, 6 h → 5 · 4 · 6."], r: "120 m"},
        {q: "5 máquinas hacen 90 polos en 12 h. ¿Cuántas máquinas para 150 polos en 10 h?", pasos: ["Polos y máquinas: directa. Horas y máquinas: inversa (más horas, menos máquinas).", "1 máquina en 1 h → 90 : 5 : 12 = 1,5 polos.", "En 10 h, una máquina hace 15 polos → 150 : 15."], r: "10 máquinas"}],
      ojo: "No te líes: en cada relación, piensa solo en dos magnitudes a la vez."},
    {n: 4, ic: "💯", titulo: "Porcentajes",
      idea: "Un porcentaje (%) es una parte de cada 100. El 15 % de algo son 15 de cada 100.",
      reglas: [
        "El <b>a % de b</b> = a · b : 100. Ejemplo: 15 % de 35 = 15 · 35 : 100 = 5,25.",
        "Trucos: el <b>50 %</b> es la mitad, el <b>25 %</b> la cuarta parte, el <b>10 %</b> dividir entre 10.",
        "<b>¿Qué % es?</b> parte · 100 : total. 200 de 800 → 200 · 100 : 800 = 25 %.",
        "<b>¿Cuál es el total?</b> Si 240 es el 30 %, el total es 240 · 100 : 30 = 800.",
        "El <b>total</b> siempre es el <b>100 %</b>. Lo que falta para el 100 % es «el resto»."],
      ejemplos: [
        {q: "Una clase de 30 alumnos tiene un 40 % de chicos. ¿Cuántas chicas hay?", pasos: ["Chicos: 40 · 30 : 100 = 12.", "Chicas: 30 − 12."], r: "18 chicas"},
        {q: "El 30 % de los alumnos está en 2.º y son 240. ¿Cuántos alumnos hay?", pasos: ["30 % → 240; 100 % → x.", "x = 240 · 100 : 30."], r: "800 alumnos"}],
      ojo: "Lee bien qué es el 100 %: casi siempre es lo que había al principio o el total."},
    {n: 5, ic: "⬆️", titulo: "Aumentos porcentuales",
      idea: "Subir un a % es quedarte con el 100 % más ese a %. Por ejemplo, con el IVA del 21 % pagas el 121 %.",
      reglas: [
        "<b>Método 1</b>: calcula el aumento (el a %) y súmalo a la cantidad.",
        "<b>Método 2</b>: multiplica directamente por <b>1 + a/100</b>. Subir un 16 % es multiplicar por 1,16.",
        "<b>Precio de antes</b>: el precio final es el (100 + a) %. Antes = final · 100 : (100 + a), o final : 1,a.",
        "<b>¿Qué % ha subido?</b> (subida · 100) : lo que había al principio."],
      ejemplos: [
        {q: "Una cámara cuesta 240 € sin IVA. Con un 16 % de IVA, ¿cuánto pago?", pasos: ["Aumento: 16 · 240 : 100 = 38,4 €.", "240 + 38,4. (O 240 · 1,16.)"], r: "278,4 €"},
        {q: "Después de subir un 15 %, algo cuesta 17,25 €. ¿Cuánto costaba?", pasos: ["17,25 € es el 115 %.", "17,25 · 100 : 115 = 1.725 : 115."], r: "15 €"}],
      ojo: "Para volver al precio de antes NO se resta el % al precio final: se divide entre 1,a."},
    {n: 6, ic: "⬇️", titulo: "Disminuciones porcentuales",
      idea: "Rebajar un a % es quedarte con el 100 % menos ese a %. Con un 10 % de descuento pagas el 90 %.",
      reglas: [
        "<b>Método 1</b>: calcula el descuento (el a %) y réstalo.",
        "<b>Método 2</b>: multiplica por <b>1 − a/100</b>. Rebajar un 25 % es multiplicar por 0,75.",
        "<b>Precio de antes</b>: final · 100 : (100 − a), o final : 0,…",
        "<b>Rebajas seguidas</b>: la segunda se hace sobre el precio ya rebajado. Un 10 % y luego un 20 % <b>no</b> es un 30 %: es multiplicar por 0,9 y por 0,8."],
      ejemplos: [
        {q: "Un pantalón de 24 € con un 10 % de descuento", pasos: ["Descuento: 10 · 24 : 100 = 2,4 €.", "24 − 2,4. (O 24 · 0,9.)"], r: "21,6 €"},
        {q: "Un polo de 60 €: −10 % y luego −20 %", pasos: ["60 · 0,9 = 54 €.", "54 · 0,8 = 43,2 €. (Con un 30 % serían 42 €: no es lo mismo.)"], r: "43,2 €"}],
      ojo: "Los porcentajes seguidos no se suman: cada uno se calcula sobre el precio que hay en ese momento."},
    {n: 7, ic: "🏦", titulo: "Interés simple",
      idea: "Cuando dejas dinero en el banco, cada año te dan un porcentaje de ese dinero: son los intereses.",
      reglas: [
        "<b>Capital</b> (C): el dinero que metes. <b>Rédito</b> (r): el % que te dan cada año. <b>Tiempo</b> (t): los años.",
        "Interés de <b>un año</b>: C · r : 100.",
        "Interés de <b>t años</b>: <b>I = C · r · t : 100</b>.",
        "Al final tienes <b>C + I</b>.",
        "Si te falta C, r o t, despeja: por ejemplo, C = I · 100 : (r · t)."],
      ejemplos: [
        {q: "200.000 € al 5 % durante 3 años", pasos: ["Un año: 200.000 · 5 : 100 = 10.000 €.", "3 años: 10.000 · 3."], r: "30.000 € de intereses"},
        {q: "¿Qué capital da 3.000 € en 3 años al 10 %?", pasos: ["Un año: 3.000 : 3 = 1.000 €.", "1.000 € es el 10 % → C = 1.000 · 100 : 10."], r: "10.000 €"}],
      ojo: "Los intereses no son todo el dinero: el total al final es capital + intereses."},
    {n: 8, ic: "🍕", titulo: "Repartos proporcionales",
      idea: "Repartir proporcionalmente es dar más a quien ha puesto (o comido, o trabajado) más.",
      reglas: [
        "<b>1.º</b> Suma todas las partes (lo que puso, comió o trabajó cada uno).",
        "<b>2.º</b> Divide el total entre esa suma: es lo que vale <b>una parte</b>.",
        "<b>3.º</b> Multiplica lo que vale una parte por las partes de cada uno.",
        "Comprueba: lo de todos sumado tiene que dar el total."],
      ejemplos: [
        {q: "Una pizza de 8 porciones cuesta 12 €: Juan come 4, Ana 3 y Luis 1. ¿Cuánto paga cada uno?", pasos: ["Partes: 4 + 3 + 1 = 8.", "Una porción: 12 : 8 = 1,5 €.", "Juan 4 · 1,5 = 6 €; Ana 3 · 1,5 = 4,5 €; Luis 1,5 €."], r: "6 €, 4,5 € y 1,5 €"},
        {q: "María pone 3.000 €, Pedro 2.000 € y Diana 4.000 €. Ganan 1.800 €.", pasos: ["Partes: 9.000 €.", "Cada euro puesto: 1.800 : 9.000 = 0,2 €.", "María 600 €, Pedro 400 €, Diana 800 €."], r: "600 €, 400 € y 800 €"}],
      ojo: "Repartir a partes iguales (dividir entre el número de personas) no es un reparto proporcional."}
  ]
};
T2.banco = "LYAMatesBanco";
/* Los cursos, cada uno con su apartado propio (#mates-<id del curso>) y sus temas dentro.
   Para añadir un curso: un objeto más aquí ({id: número + letras, p. ej. "2eso" o "3pdc", n, ic, color, intro, temas, pronto})
   y sus temas con ids nuevos (letra + número, p. ej. "s3"; la letra no puede repetir la de otro curso si los números chocan). */
const CURSOS = [
  {id: "1eso", n: "1.º ESO", ic: "1️⃣", color: "#4f8cff", intro: "Números enteros, y pronto más temas del curso.", temas: [T2],
    pronto: ["Números naturales", "Divisibilidad", "Fracciones", "Números decimales", "Proporcionalidad", "Álgebra", "Geometría", "Estadística"]},
  {id: "4pdc", n: "4.º ESO PDC", ic: "4️⃣", color: "#2fbf71", intro: "Diversificación (PDC): proporcionalidad y porcentajes, y pronto más temas.", temas: [P2],
    pronto: ["Números reales", "Álgebra", "Funciones", "Geometría", "Estadística y probabilidad"]}];
const tema = id => CURSOS.flatMap(c => c.temas).find(t => t.id === id);
const curso = id => CURSOS.find(c => c.id === id);
const cursoDe = id => CURSOS.find(c => c.temas.some(t => t.id === id));
/* el banco de ejercicios de cada tema (mates/banco.js o mates/pdc.js) */
const banco = id => window[(tema(id) || {}).banco || "LYAMatesBanco"] || window.LYAMatesBanco;
window.LYAMatesTemas = {cursos: CURSOS, T2, P2, tema, curso, cursoDe, banco};
})();
