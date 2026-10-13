/* Întrebări originale pentru parcursul interactiv. Indexul corect pornește de la 0. */
window.PA_INTERACTIVE = {
'intro-print': [
{ question: 'Ce afișează instrucțiunea print("Salut!")?', options: ['Ghilimelele și textul', 'Salut!', 'Nimic până la input()'], correct: 1, explanation: 'print() afișează conținutul textului, fără ghilimele.' },
{ question: 'Ce rezultat are programul print(2 + 3)?', options: ['23', '5', '2 + 3', 'Eroare'], correct: 1, explanation: 'Expresia numerică este calculată înainte de afișare: 2 + 3 = 5.' }
],
'intro-variabile': [
{ question: 'După x = 4 și x = x + 2, cât este x?', options: ['4', '6', '42', '2'], correct: 1, explanation: 'A doua atribuire înlocuiește valoarea veche cu 4 + 2.' },
{ question: 'Ce afișează print(3 * (2 + 1))?', options: ['7', '9', '6', '321'], correct: 1, explanation: 'Parantezele sunt evaluate mai întâi: 2 + 1 = 3, apoi 3 * 3 = 9.' }
],
'intro-citire': [
{ question: 'Ce tip de date returnează input() în Python?', options: ['int', 'str', 'float', 'bool'], correct: 1, explanation: 'input() returnează întotdeauna un șir de caractere (str).' },
{ question: 'Dacă tastezi 2 și apoi 3, ce afișează print(input() + input())?', options: ['5', '23', '6', 'Eroare'], correct: 1, explanation: 'Cele două rezultate sunt texte, iar operatorul + le concatenează.' }
],
'intro-conditii': [
{ question: 'Ce operator compară două valori pentru egalitate?', options: ['=', '==', '!=', '>='], correct: 1, explanation: '= este atribuire, == testează egalitatea.' },
{ question: 'Ce afișează if 5 > 3: print("DA")?', options: ['DA', 'NU', '5 > 3', 'Nimic'], correct: 0, explanation: 'Condiția este adevărată, așa că blocul indentat este executat.' }
],
'intro-bucle': [
{ question: 'De câte ori se execută for i in range(3)?', options: ['2', '3', '4', 'La infinit'], correct: 1, explanation: 'range(3) generează 0, 1, 2: în total trei valori.' },
{ question: 'Cu ce valoare inițializezi de regulă o sumă acumulată?', options: ['1', '0', '-1', 'n'], correct: 1, explanation: '0 este elementul neutru al adunării: s = 0, apoi s += i.' }
]
};
