window.PA_BEGINNER = {
  "lessons": [
    {
      "id": "intro-print",
      "title": "01 · Primele instrucțiuni",
      "subtitle": "Afișarea textului, print() și ordinea instrucțiunilor",
      "duration": "10–15 min",
      "lesson": [
        "Python execută instrucțiunile de sus în jos. Prima funcție utilă este print(), care afișează un rezultat.",
        "Textul se scrie între ghilimele: print(\"Salut!\"). Numerele se pot afișa fără ghilimele: print(42).",
        "Un apel print() adaugă implicit un rând nou. Poți folosi mai multe apeluri pentru mai multe linii."
      ],
      "example": "print(\"Salut, Python!\")\nprint(2 + 3)",
      "explain": "Prima linie afișează textul. A doua calculează suma înainte de afișare. Obții două linii: Salut, Python! și 5."
    },
    {
      "id": "intro-variabile",
      "title": "02 · Variabile și calcule",
      "subtitle": "Numere, atribuiri și operatori aritmetici",
      "duration": "15–20 min",
      "lesson": [
        "O variabilă este un nume asociat unei valori. Scrii pret = 12 pentru a reține numărul 12.",
        "Operatorii +, -, * și / fac operații aritmetice. Parantezele stabilesc ordinea calculului.",
        "În Python, = atribuie o valoare; nu înseamnă „egal matematic”. Folosește print() ca să vezi valorile calculate."
      ],
      "example": "pret = 12\ncantitate = 3\nprint(pret * cantitate)",
      "explain": "pret și cantitate memorează numere întregi; rezultatul este 36."
    },
    {
      "id": "intro-citire",
      "title": "03 · Date de intrare",
      "subtitle": "input(), int() și șiruri de caractere",
      "duration": "15–20 min",
      "lesson": [
        "input() citește o linie și o returnează ca text (str). Poți salva răspunsul într-o variabilă: nume = input().",
        "Pentru calcule cu întregi folosești int(input()). Dacă uiți int(), \"2\" + \"3\" devine \"23\", nu 5.",
        "În editor, câmpul „Date de intrare” simulează tastatura. Fiecare apel input() citește următoarea linie."
      ],
      "example": "nume = input()\nprint(\"Salut,\", nume)",
      "explain": "Pentru intrarea Ana, rezultatul este Salut, Ana. print() pune implicit un spațiu între argumente."
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
      "example": "varsta = int(input())\nif varsta >= 18:\n    print(\"Major\")\nelse:\n    print(\"Minor\")",
      "explain": "Pentru 18 afișează Major, iar pentru 17 afișează Minor. Operatorul >= include valoarea 18."
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
      "title": "Salut, Python!",
      "statement": "Afișează exact mesajul Salut, Python! pe o singură linie. Nu se citesc date de intrare.",
      "hint": "Folosește print() cu text între ghilimele.",
      "solution": "print(\"Salut, Python!\")",
      "explanation": "Folosește print() cu text între ghilimele.",
      "level": "Începător",
      "starter": "print(\"...\")\n",
      "tests": [
        {
          "input": "",
          "expected": "Salut, Python!"
        }
      ],
      "compare": "lines",
      "origin": "Exercițiu original pentru cursul introductiv."
    },
    {
      "id": "intro-print-02",
      "chapter": "intro-print",
      "title": "Două mesaje",
      "statement": "Afișează pe prima linie Încep să programez, iar pe a doua linie Pas cu pas. Nu citi date.",
      "hint": "Apelează print() de două ori.",
      "solution": "print(\"Încep să programez\")\nprint(\"Pas cu pas\")",
      "explanation": "Apelează print() de două ori.",
      "level": "Începător",
      "starter": "# Scrie codul tău aici.\n",
      "tests": [
        {
          "input": "",
          "expected": "Încep să programez\nPas cu pas"
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
      "starter": "# Scrie codul tău aici.\n",
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
      "statement": "Setează variabila pret la 18 și variabila bilete la 4. Afișează prețul total. Nu citi date.",
      "hint": "Înmulțește pret cu bilete.",
      "solution": "pret = 18\nbilete = 4\nprint(pret * bilete)",
      "explanation": "Înmulțește pret cu bilete.",
      "level": "Începător",
      "starter": "# Scrie codul tău aici.\n",
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
      "statement": "Setează puncte = 40. Adaugă 15 puncte și afișează noua valoare. Nu citi date.",
      "hint": "Actualizează valoarea prin puncte += 15.",
      "solution": "puncte = 40\npuncte += 15\nprint(puncte)",
      "explanation": "Actualizează valoarea prin puncte += 15.",
      "level": "Începător",
      "starter": "# Scrie codul tău aici.\n",
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
      "statement": "Ai durata = 90 și parcurs = 35. Calculează câte minute au rămas și afișează rezultatul. Nu citi date.",
      "hint": "Scade parcurs din durata.",
      "solution": "durata = 90\nparcurs = 35\nprint(durata - parcurs)",
      "explanation": "Scade parcurs din durata.",
      "level": "Începător",
      "starter": "# Scrie codul tău aici.\n",
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
      "title": "Salut personalizat",
      "statement": "Citește un nume pe prima linie și afișează Salut, urmat de un spațiu și nume.",
      "hint": "input() citește text. print(\"Salut,\", nume) adaugă spațiul.",
      "solution": "nume = input()\nprint(\"Salut,\", nume)",
      "explanation": "input() citește text. print(\"Salut,\", nume) adaugă spațiul.",
      "level": "Începător",
      "starter": "# Scrie codul tău aici.\n",
      "tests": [
        {
          "input": "Ana",
          "expected": "Salut, Ana"
        },
        {
          "input": "Mara",
          "expected": "Salut, Mara"
        },
        {
          "input": "Alex",
          "expected": "Salut, Alex"
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
      "solution": "varsta = int(input())\nprint(varsta + 1)",
      "explanation": "Convertește rezultatul input() cu int() înainte de a aduna 1.",
      "level": "Începător",
      "starter": "# Scrie codul tău aici.\n",
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
      "solution": "pret = int(input())\ncantitate = int(input())\nprint(pret * cantitate)",
      "explanation": "Ai nevoie de două apeluri int(input()) și o înmulțire.",
      "level": "Începător",
      "starter": "# Scrie codul tău aici.\n",
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
      "statement": "Citește vârsta. Pentru vârste sub 12 ani afișează REDUCERE; altfel afișează NORMAL.",
      "hint": "Folosește if varsta < 12: urmat de else.",
      "solution": "varsta = int(input())\nif varsta < 12:\n    print(\"REDUCERE\")\nelse:\n    print(\"NORMAL\")",
      "explanation": "Folosește if varsta < 12: urmat de else.",
      "level": "Începător",
      "starter": "# Scrie codul tău aici.\n",
      "tests": [
        {
          "input": "7",
          "expected": "REDUCERE"
        },
        {
          "input": "12",
          "expected": "NORMAL"
        },
        {
          "input": "25",
          "expected": "NORMAL"
        }
      ],
      "compare": "lines",
      "origin": "Exercițiu original pentru cursul introductiv."
    },
    {
      "id": "intro-conditii-02",
      "chapter": "intro-conditii",
      "title": "Temperatura afară",
      "statement": "Citește temperatura întreagă. Afișează INGHET dacă temperatura este cel mult 0, altfel NU INGHET.",
      "hint": "Condiția corectă este temperatura <= 0.",
      "solution": "temperatura = int(input())\nif temperatura <= 0:\n    print(\"INGHET\")\nelse:\n    print(\"NU INGHET\")",
      "explanation": "Condiția corectă este temperatura <= 0.",
      "level": "Începător",
      "starter": "# Scrie codul tău aici.\n",
      "tests": [
        {
          "input": "-5",
          "expected": "INGHET"
        },
        {
          "input": "0",
          "expected": "INGHET"
        },
        {
          "input": "7",
          "expected": "NU INGHET"
        }
      ],
      "compare": "lines",
      "origin": "Exercițiu original pentru cursul introductiv."
    },
    {
      "id": "intro-conditii-03",
      "chapter": "intro-conditii",
      "title": "Semafor simplu",
      "statement": "Citește un text exact: verde, galben sau rosu. Afișează MERGI pentru verde, ATENTIE pentru galben și STOP pentru rosu.",
      "hint": "Poți lega cele trei variante cu if, elif și else.",
      "solution": "culoare = input()\nif culoare == \"verde\":\n    print(\"MERGI\")\nelif culoare == \"galben\":\n    print(\"ATENTIE\")\nelse:\n    print(\"STOP\")",
      "explanation": "Poți lega cele trei variante cu if, elif și else.",
      "level": "Începător",
      "starter": "# Scrie codul tău aici.\n",
      "tests": [
        {
          "input": "verde",
          "expected": "MERGI"
        },
        {
          "input": "galben",
          "expected": "ATENTIE"
        },
        {
          "input": "rosu",
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
      "statement": "Citește întregul n între 0 și 10. Afișează mesajul Bravo! de exact n ori, fiecare pe o linie.",
      "hint": "for _ in range(n): repetă corpul buclei de n ori.",
      "solution": "n = int(input())\nfor _ in range(n):\n    print(\"Bravo!\")",
      "explanation": "for _ in range(n): repetă corpul buclei de n ori.",
      "level": "Începător",
      "starter": "# Scrie codul tău aici.\n",
      "tests": [
        {
          "input": "3",
          "expected": "Bravo!\nBravo!\nBravo!"
        },
        {
          "input": "1",
          "expected": "Bravo!"
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
      "starter": "# Scrie codul tău aici.\n",
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
      "starter": "# Scrie codul tău aici.\n",
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
