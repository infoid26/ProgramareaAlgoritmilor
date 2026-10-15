window.PA_BEGINNER = {
  "lessons": [
    {
      "id": "intro-print",
      "title": "01 · Primele instrucțiuni",
      "subtitle": "Afișarea textului, print() și ordinea instrucțiunilor",
      "duration": "10–15 min",
      "lesson": [
        "Python execută instrucțiunile de sus în jos. Prima funcție utilă este print(), care afișează un rezultat.",
        "Textul se scrie între ghilimele: print(\"Hello World\"). Numerele se pot afișa fără ghilimele: print(42).",
        "Un apel print() adaugă implicit un rând nou. Poți folosi mai multe apeluri pentru mai multe linii."
      ],
      "example": "print(\"Hello World\")\nprint(2 + 3)",
      "explain": "Prima linie afișează textul. A doua calculează suma înainte de afișare. Obții două linii: Hello World și 5."
    },
    {
      "id": "intro-variabile",
      "title": "02 · Variabile și calcule",
      "subtitle": "Numere, atribuiri și operatori aritmetici",
      "duration": "15–20 min",
      "lesson": [
        "O variabilă este un name asociat unei valori. Scrii price = 12 pentru a reține numărul 12.",
        "Operatorii +, -, * și / fac operații aritmetice. Parantezele stabilesc ordinea calculului.",
        "În Python, = atribuie o valoare; nu înseamnă „egal matematic”. Folosește print() ca să vezi valorile calculate."
      ],
      "example": "price = 12\nquantity = 3\nprint(price * quantity)",
      "explain": "price și quantity memorează numere întregi; rezultatul este 36."
    },
    {
      "id": "intro-citire",
      "title": "03 · Date de intrare",
      "subtitle": "input(), int() și șiruri de caractere",
      "duration": "15–20 min",
      "lesson": [
        "input() citește o linie și o returnează ca text (str). Poți salva răspunsul într-o variabilă: name = input().",
        "Pentru calcule cu întregi folosești int(input()). Dacă uiți int(), \"2\" + \"3\" devine \"23\", nu 5.",
        "Fiecare apel input() citește următoarea linie. La verificare, aplicația furnizează automat liniile de intrare ale exercițiului."
      ],
      "example": "name = input()\nprint(\"User:\", name)",
      "explain": "Pentru intrarea Ana, rezultatul este User: Ana. print() pune implicit un spațiu între argumente."
    },
    {
      "id": "intro-conditii",
      "title": "04 · Decizii cu if",
      "subtitle": "Condiții, comparații, else și indentare",
      "duration": "20–25 min",
      "lesson": [
        "if permite executarea unor instrucțiuni doar când o condiție este adevărată. Compară cu ==, <, >, <= sau >=.",
        "Instrucțiunile din interiorul unui if sau else trebuie indentate consecvent, de obicei cu patru spații.",
        "Folosește if/else când ai două variante. elif te ajută să verifici alternative suplimentare."
      ],
      "example": "age = int(input())\nif age >= 18:\n    print(\"Adult\")\nelse:\n    print(\"Minor\")",
      "explain": "Pentru 18 afișează Adult, iar pentru 17 afișează Minor. Operatorul >= include valoarea 18."
    },
    {
      "id": "intro-bucle",
      "title": "05 · Repetări cu for",
      "subtitle": "range(), iterații și acumularea unui rezultat",
      "duration": "20–25 min",
      "lesson": [
        "O buclă for execută un bloc pentru fiecare valoare dintr-o secvență. range(n) produce 0, 1, ..., n-1.",
        "Pentru valori de la 1 la n inclusiv, folosește range(1, n + 1). Limita din dreapta nu este inclusă.",
        "Pentru o sumă repetată, pornește cu s = 0 și adaugă valorile folosind s += i."
      ],
      "example": "n = int(input())\nfor i in range(1, n + 1):\n    print(i)",
      "explain": "Pentru 3, bucla afișează 1, 2 și 3 pe rânduri separate."
    }
  ],
  "exercises": [
    {
      "id": "intro-print-01",
      "chapter": "intro-print",
      "title": "Mesaj de stare",
      "statement": "Afișează exact textul `Hello World` pe o singură linie. Nu se citesc date de intrare.",
      "hint": "Folosește print() cu text între ghilimele.",
      "solution": "print(\"Hello World\")",
      "explanation": "Folosește print() cu text între ghilimele.",
      "level": "Începător",
      "starter": "",
      "tests": [
        {
          "input": "",
          "expected": "Hello World"
        }
      ],
      "compare": "lines",
      "origin": "Exercițiu original pentru cursul introductiv."
    },
    {
      "id": "intro-print-02",
      "chapter": "intro-print",
      "title": "Două mesaje",
      "statement": "Afișează exact textul `Connection established` pe prima linie și `Access granted` pe a doua linie. Nu se citesc date de intrare.",
      "hint": "Apelează print() de două ori.",
      "solution": "print(\"Connection established\")\nprint(\"Access granted\")",
      "explanation": "Apelează print() de două ori.",
      "level": "Începător",
      "starter": "",
      "tests": [
        {
          "input": "",
          "expected": "Connection established\nAccess granted"
        }
      ],
      "compare": "lines",
      "origin": "Exercițiu original pentru cursul introductiv."
    },
    {
      "id": "intro-print-03",
      "chapter": "intro-print",
      "title": "Primul calcul",
      "statement": "Fără să citești date, afișează rezultatul expresiei (7 + 5) * 2. Afișează un număr, nu expresia.",
      "hint": "Calculează expresia în apelul print().",
      "solution": "print((7 + 5) * 2)",
      "explanation": "Calculează expresia în apelul print().",
      "level": "Începător",
      "starter": "",
      "tests": [
        {
          "input": "",
          "expected": "24"
        }
      ],
      "compare": "lines",
      "origin": "Exercițiu original pentru cursul introductiv."
    },
    {
      "id": "intro-variabile-01",
      "chapter": "intro-variabile",
      "title": "Bilete la film",
      "statement": "Setează variabila `price` la 18 și variabila `tickets` la 4. Afișează prețul total. Nu citi date.",
      "hint": "Înmulțește price cu tickets.",
      "solution": "price = 18\ntickets = 4\nprint(price * tickets)",
      "explanation": "Înmulțește price cu tickets.",
      "level": "Începător",
      "starter": "",
      "tests": [
        {
          "input": "",
          "expected": "72"
        }
      ],
      "compare": "lines",
      "origin": "Exercițiu original pentru cursul introductiv."
    },
    {
      "id": "intro-variabile-02",
      "chapter": "intro-variabile",
      "title": "Puncte bonus",
      "statement": "Setează `points` = 40. Adaugă 15 `points` și afișează noua valoare. Nu citi date.",
      "hint": "Actualizează valoarea prin points += 15.",
      "solution": "points = 40\npoints += 15\nprint(points)",
      "explanation": "Actualizează valoarea prin points += 15.",
      "level": "Începător",
      "starter": "",
      "tests": [
        {
          "input": "",
          "expected": "55"
        }
      ],
      "compare": "lines",
      "origin": "Exercițiu original pentru cursul introductiv."
    },
    {
      "id": "intro-variabile-03",
      "chapter": "intro-variabile",
      "title": "Minute rămase",
      "statement": "Ai `duration` = 90 și `elapsed` = 35. Calculează câte minute au rămas și afișează rezultatul. Nu citi date.",
      "hint": "Scade elapsed din duration.",
      "solution": "duration = 90\nelapsed = 35\nprint(duration - elapsed)",
      "explanation": "Scade elapsed din duration.",
      "level": "Începător",
      "starter": "",
      "tests": [
        {
          "input": "",
          "expected": "55"
        }
      ],
      "compare": "lines",
      "origin": "Exercițiu original pentru cursul introductiv."
    },
    {
      "id": "intro-citire-01",
      "chapter": "intro-citire",
      "title": "Identificarea utilizatorului",
      "statement": "Citește un nume de pe o singură linie și păstrează-l în variabila `name`. Afișează pe o singură linie textul `User:`, un spațiu și numele citit. De exemplu, pentru Ana afișează `User: Ana`.",
      "hint": "input() citește text. print(\"User:\", name) adaugă spațiul.",
      "solution": "name = input()\nprint(\"User:\", name)",
      "explanation": "input() citește text. print(\"User:\", name) adaugă spațiul.",
      "level": "Începător",
      "starter": "",
      "tests": [
        {
          "input": "Ana",
          "expected": "User: Ana"
        },
        {
          "input": "Mara",
          "expected": "User: Mara"
        },
        {
          "input": "Alex",
          "expected": "User: Alex"
        }
      ],
      "compare": "lines",
      "origin": "Exercițiu original pentru cursul introductiv."
    },
    {
      "id": "intro-citire-02",
      "chapter": "intro-citire",
      "title": "Anul viitor",
      "statement": "Citește o vârstă întreagă și afișează vârsta pe care o vei avea anul viitor.",
      "hint": "Convertește rezultatul input() cu int() înainte de a aduna 1.",
      "solution": "age = int(input())\nprint(age + 1)",
      "explanation": "Convertește rezultatul input() cu int() înainte de a aduna 1.",
      "level": "Începător",
      "starter": "",
      "tests": [
        {
          "input": "20",
          "expected": "21"
        },
        {
          "input": "0",
          "expected": "1"
        },
        {
          "input": "35",
          "expected": "36"
        }
      ],
      "compare": "lines",
      "origin": "Exercițiu original pentru cursul introductiv."
    },
    {
      "id": "intro-citire-03",
      "chapter": "intro-citire",
      "title": "Cumpărături",
      "statement": "Citește pe două linii prețul întreg al unui produs și cantitatea întreagă. Afișează costul total.",
      "hint": "Ai nevoie de două apeluri int(input()) și o înmulțire.",
      "solution": "price = int(input())\nquantity = int(input())\nprint(price * quantity)",
      "explanation": "Ai nevoie de două apeluri int(input()) și o înmulțire.",
      "level": "Începător",
      "starter": "",
      "tests": [
        {
          "input": "12\n3",
          "expected": "36"
        },
        {
          "input": "7\n0",
          "expected": "0"
        },
        {
          "input": "5\n11",
          "expected": "55"
        }
      ],
      "compare": "lines",
      "origin": "Exercițiu original pentru cursul introductiv."
    },
    {
      "id": "intro-conditii-01",
      "chapter": "intro-conditii",
      "title": "Bilet cu reducere",
      "statement": "Citește o vârstă întreagă de pe o singură linie. Dacă vârsta este mai mică decât 12, afișează exact `DISCOUNT`; în caz contrar, afișează exact `STANDARD`.",
      "hint": "Folosește if age < 12: urmat de else.",
      "solution": "age = int(input())\nif age < 12:\n    print(\"DISCOUNT\")\nelse:\n    print(\"STANDARD\")",
      "explanation": "Folosește if age < 12: urmat de else.",
      "level": "Începător",
      "starter": "",
      "tests": [
        {
          "input": "7",
          "expected": "DISCOUNT"
        },
        {
          "input": "12",
          "expected": "STANDARD"
        },
        {
          "input": "25",
          "expected": "STANDARD"
        }
      ],
      "compare": "lines",
      "origin": "Exercițiu original pentru cursul introductiv."
    },
    {
      "id": "intro-conditii-02",
      "chapter": "intro-conditii",
      "title": "Temperatura afară",
      "statement": "Citește o temperatură întreagă de pe o singură linie. Dacă `temperature` este mai mică sau egală cu 0, afișează exact `FREEZING`; dacă este mai mare decât 0, afișează exact `ABOVE FREEZING`.",
      "hint": "Condiția corectă este temperature <= 0.",
      "solution": "temperature = int(input())\nif temperature <= 0:\n    print(\"FREEZING\")\nelse:\n    print(\"ABOVE FREEZING\")",
      "explanation": "Condiția corectă este temperature <= 0.",
      "level": "Începător",
      "starter": "",
      "tests": [
        {
          "input": "-5",
          "expected": "FREEZING"
        },
        {
          "input": "0",
          "expected": "FREEZING"
        },
        {
          "input": "7",
          "expected": "ABOVE FREEZING"
        }
      ],
      "compare": "lines",
      "origin": "Exercițiu original pentru cursul introductiv."
    },
    {
      "id": "intro-conditii-03",
      "chapter": "intro-conditii",
      "title": "Semafor simplu",
      "statement": "Citește exact unul dintre textele `green`, `yellow` sau `red`, cu litere mici. Afișează pe o singură linie `GO` pentru `green`, `WAIT` pentru `yellow` sau `STOP` pentru `red`.",
      "hint": "Poți lega cele trei variante cu if, elif și else.",
      "solution": "color = input()\nif color == \"green\":\n    print(\"GO\")\nelif color == \"yellow\":\n    print(\"WAIT\")\nelse:\n    print(\"STOP\")",
      "explanation": "Poți lega cele trei variante cu if, elif și else.",
      "level": "Începător",
      "starter": "",
      "tests": [
        {
          "input": "green",
          "expected": "GO"
        },
        {
          "input": "yellow",
          "expected": "WAIT"
        },
        {
          "input": "red",
          "expected": "STOP"
        }
      ],
      "compare": "lines",
      "origin": "Exercițiu original pentru cursul introductiv."
    },
    {
      "id": "intro-bucle-01",
      "chapter": "intro-bucle",
      "title": "Afișează de n ori",
      "statement": "Citește un număr întreg n (0 ≤ n ≤ 10). Afișează exact textul `Task completed` de n ori, fiecare apariție pe o linie separată. Pentru n = 0, nu afișa niciun mesaj.",
      "hint": "for _ in range(n): repetă corpul buclei de n ori.",
      "solution": "n = int(input())\nfor _ in range(n):\n    print(\"Task completed\")",
      "explanation": "for _ in range(n): repetă corpul buclei de n ori.",
      "level": "Începător",
      "starter": "",
      "tests": [
        {
          "input": "3",
          "expected": "Task completed\nTask completed\nTask completed"
        },
        {
          "input": "1",
          "expected": "Task completed"
        },
        {
          "input": "0",
          "expected": ""
        }
      ],
      "compare": "lines",
      "origin": "Exercițiu original pentru cursul introductiv."
    },
    {
      "id": "intro-bucle-02",
      "chapter": "intro-bucle",
      "title": "Numără pașii",
      "statement": "Citește n între 1 și 20. Afișează toate numerele de la 1 până la n inclusiv, fiecare pe linie nouă.",
      "hint": "range(1, n + 1) include n.",
      "solution": "n = int(input())\nfor i in range(1, n + 1):\n    print(i)",
      "explanation": "range(1, n + 1) include n.",
      "level": "Începător",
      "starter": "",
      "tests": [
        {
          "input": "3",
          "expected": "1\n2\n3"
        },
        {
          "input": "1",
          "expected": "1"
        },
        {
          "input": "5",
          "expected": "1\n2\n3\n4\n5"
        }
      ],
      "compare": "lines",
      "origin": "Exercițiu original pentru cursul introductiv."
    },
    {
      "id": "intro-bucle-03",
      "chapter": "intro-bucle",
      "title": "Stele pe o linie",
      "statement": "Citește n între 0 și 20. Construiește un șir cu n caractere * printr-o buclă for și afișează-l.",
      "hint": "Începe cu rezultat = \"\", apoi adaugă \"*\" la fiecare pas.",
      "solution": "n = int(input())\nrezultat = \"\"\nfor _ in range(n):\n    rezultat += \"*\"\nprint(rezultat)",
      "explanation": "Începe cu rezultat = \"\", apoi adaugă \"*\" la fiecare pas.",
      "level": "Începător",
      "starter": "",
      "tests": [
        {
          "input": "3",
          "expected": "***"
        },
        {
          "input": "0",
          "expected": ""
        },
        {
          "input": "5",
          "expected": "*****"
        }
      ],
      "compare": "lines",
      "origin": "Exercițiu original pentru cursul introductiv."
    }
  ]
};
