/* Întrebări originale revizuite pentru claritate; identificatorii și indicii răspunsurilor sunt păstrați. */
window.PA_ALGO_LESSONS = {
  "baze": {
    "hook": "Un calculator execută instrucțiuni una câte una. Nu ghicește ce ai vrut să scrii.",
    "story": "Imaginează-ți o casă de marcat: primește două valori, calculează și afișează rezultatul. Programul Python face exact acești pași.",
    "points": [
      "input() citește textul introdus de utilizator.",
      "int(...) transformă acel text într-un număr întreg.",
      "print(...) afișează calculul; nu ai nevoie de mesaje suplimentare dacă se cere doar rezultatul."
    ],
    "walk": [
      "Citești primul număr în a.",
      "Citești al doilea număr în b.",
      "Aduni valorile și afișezi rezultatul."
    ],
    "trap": "Fără int(), două valori text precum \"3\" și \"5\" sunt concatenate în \"35\", nu adunate în 8.",
    "check": {
      "question": "Ce afișează print(\"3\" + \"5\")?",
      "options": [
        "8",
        "35",
        "Eroare"
      ],
      "correct": 1,
      "explanation": "Ambele valori sunt texte; operatorul + lipește șirurile."
    }
  },
  "decizii": {
    "hook": "Un program trebuie uneori să aleagă între mai multe drumuri.",
    "story": "Ca la un semafor: dacă este roșu, aștepți; altfel, poți continua. if decide ce bloc de cod se execută.",
    "points": [
      "if verifică o condiție, de exemplu n % 2 == 0.",
      "else oferă varianta alternativă, iar elif adaugă alte condiții.",
      "Cele patru spații de indentare arată care instrucțiuni fac parte din bloc."
    ],
    "walk": [
      "Citești n și calculezi restul împărțirii la 2.",
      "Dacă restul este zero, afișezi PAR.",
      "În caz contrar, afișezi IMPAR."
    ],
    "trap": "== compară, în timp ce = atribuie. Pentru n = 0, rezultatul este PAR.",
    "check": {
      "question": "Pentru n = 7, care dintre cele două ramuri if/else din programul de mai jos se execută?",
      "options": [
        "Ramura if",
        "Ramura else",
        "Ambele"
      ],
      "correct": 1,
      "explanation": "7 împărțit la 2 are restul 1, deci condiția este falsă.",
      "code": "n = 7\nif n % 2 == 0:\n    print(\"PAR\")\nelse:\n    print(\"IMPAR\")"
    }
  },
  "bucle": {
    "hook": "Când repeți același calcul de multe ori, folosești o buclă.",
    "story": "Pentru a aduna numerele de la 1 la 100, nu ai scrie de 100 de ori operația. Un for trece pe rând prin valori.",
    "points": [
      "range(1, n + 1) produce 1, 2, ..., n.",
      "s = 0 pregătește suma, iar s += i adună fiecare valoare.",
      "while repetă cât timp condiția rămâne adevărată; ai grijă să o poți opri."
    ],
    "walk": [
      "Pentru n = 3, s începe cu 0.",
      "După i = 1, s devine 1; după i = 2, devine 3.",
      "După i = 3, devine 6 și bucla se încheie."
    ],
    "trap": "range(n) nu include n: range(3) produce 0, 1 și 2.",
    "check": {
      "question": "Ce valoare are s după executarea programului de mai jos?",
      "options": [
        "3",
        "6",
        "10"
      ],
      "correct": 1,
      "explanation": "Adunăm 1 + 2 + 3, deci s devine 6.",
      "code": "s = 0\nfor i in range(1, 4):\n    s += i"
    }
  },
  "siruri": {
    "hook": "Un șir de caractere este o secvență de litere, cifre și semne.",
    "story": "Gândește-te la un cuvânt scris pe cartonașe numerotate. În Python, primul caracter are indexul 0.",
    "points": [
      "text[0] este primul caracter; text[-1] este ultimul.",
      "text[a:b] selectează caracterele de la indexul a până înainte de b.",
      "split() desparte textul în cuvinte, iar \"-\".join(...) le unește cu cratimă."
    ],
    "walk": [
      "Citești textul și folosești split() pentru a găsi cuvintele.",
      "Spațiile consecutive nu creează cuvinte suplimentare.",
      "join le reconstruiește cu separatorul ales."
    ],
    "trap": "Șirurile sunt imutabile: replace sau upper returnează un șir nou, nu îl modifică pe cel vechi.",
    "check": {
      "question": "Pentru text = \"abcd\", ce este text[0:2]?",
      "options": [
        "ab",
        "abc",
        "bc"
      ],
      "correct": 0,
      "explanation": "Începem la indexul 0 și ne oprim înainte de indexul 2."
    }
  },
  "liste": {
    "hook": "O listă ține mai multe valori în aceeași variabilă.",
    "story": "În loc să creezi nota1, nota2 și nota3, poți avea note = [8, 9, 10] și să le parcurgi.",
    "points": [
      "Lista este modificabilă: append adaugă elemente, pop elimină.",
      "for x in lista trece prin elemente, câte unul.",
      "O matrice este o listă de linii; fiecare linie trebuie să fie independentă."
    ],
    "walk": [
      "Citești valorile dintr-o linie și le transformi în întregi.",
      "Păstrezi doar valorile pozitive.",
      "Pentru fiecare valoare păstrată, calculezi pătratul."
    ],
    "trap": "a = b nu creează o copie de listă: cele două nume vor indica aceeași listă. Folosește b = a.copy() pentru o listă simplă.",
    "check": {
      "question": "După a = [2, 4] și a.append(6), ce conține a?",
      "options": [
        "[2, 4]",
        "[2, 4, 6]",
        "[6, 2, 4]"
      ],
      "correct": 1,
      "explanation": "append(6) adaugă 6 la sfârșitul listei."
    }
  },
  "colectii": {
    "hook": "Alege structura de date după întrebarea pe care vrei să o rezolvi.",
    "story": "Un set răspunde la „ce valori distincte există?”, iar un dicționar la „de câte ori apare fiecare?”.",
    "points": [
      "set elimină duplicatele, fără să promită ordinea.",
      "Dicționarul asociază o cheie cu o valoare: frecventa[\"mere\"] = 2.",
      "sorted(...) ordonează explicit valorile pentru un rezultat reproductibil."
    ],
    "walk": [
      "Pornești cu d = {}.",
      "Pentru fiecare cuvânt, d.get(x, 0) găsește numărul aparițiilor sau 0.",
      "Adaugi 1 și apoi afișezi cheile sortate cu frecvențele lor."
    ],
    "trap": "set([3, 3, 1]) are două valori distincte, nu trei. Un set nu garantează o ordine de afișare.",
    "check": {
      "question": "De câte ori apare \"ana\" în [\"ana\", \"mere\", \"ana\"]?",
      "options": [
        "1",
        "2",
        "3"
      ],
      "correct": 1,
      "explanation": "Dicționarul frecvențelor ar memora ana: 2."
    }
  },
  "functii": {
    "hook": "O funcție este o rețetă pe care o poți folosi de mai multe ori.",
    "story": "În loc să repeți aceleași calcule în mai multe locuri, le pui într-o funcție și îi trimiți argumente.",
    "points": [
      "def nume(x): definește funcția și parametrul său.",
      "return x * x transmite rezultatul către cel care a apelat funcția.",
      "În recursivitate, funcția se apelează pe o problemă mai mică și trebuie să aibă un caz de oprire."
    ],
    "walk": [
      "Definești patrat(x), care returnează x * x.",
      "Citești numărul n.",
      "Apelezi patrat(n) și îi afișezi rezultatul."
    ],
    "trap": "print() afișează o valoare, dar nu o returnează automat. Fără return, funcția întoarce None.",
    "check": {
      "question": "Ce valoare returnează f() din programul de mai jos, separat de ceea ce afișează?",
      "options": [
        "5",
        "None",
        "\"5\""
      ],
      "correct": 1,
      "explanation": "Print afișează 5; valoarea returnată implicit este None.",
      "code": "def f():\n    print(5)\n\nf()"
    }
  },
  "fisiere": {
    "hook": "Unele probleme citesc datele din fișiere, nu de la tastatură.",
    "story": "Ai un fișier date.in cu numere, iar programul trebuie să scrie suma în date.out.",
    "points": [
      "with open(\"date.in\") as f: deschide fișierul pentru citire și îl închide automat.",
      "f.read().split() extrage toate valorile separate prin spații sau rânduri.",
      "Modul \"w\" creează sau rescrie fișierul de ieșire."
    ],
    "walk": [
      "Deschizi date.in și citești toate numerele.",
      "Le convertești în întregi și calculezi suma.",
      "Deschizi date.out cu modul \"w\" și scrii suma ca text."
    ],
    "trap": "Într-o problemă cu date.out, print(sum(a)) nu este suficient: rezultatul trebuie scris în fișier.",
    "check": {
      "question": "Ce mod al lui open() permite rescrierea unui fișier?",
      "options": [
        "\"r\"",
        "\"w\"",
        "\"rb\""
      ],
      "correct": 1,
      "explanation": "\"w\" deschide fișierul pentru scriere și îi înlocuiește conținutul."
    }
  },
  "module": {
    "hook": "Python vine cu module care rezolvă deja multe operații uzuale.",
    "story": "În loc să calculezi manual dacă mâine este o zi din luna următoare, folosești datetime.",
    "points": [
      "import încarcă un modul sau funcții din acesta.",
      "re.fullmatch verifică dacă întregul text respectă un model.",
      "datetime.strptime transformă un text într-o dată, iar timedelta adaugă zile."
    ],
    "walk": [
      "Citești o dată în format AAAA-LL-ZZ.",
      "strptime o interpretează folosind formatul %Y-%m-%d.",
      "Adaugi timedelta(days=1) și afișezi noua dată."
    ],
    "trap": "Modelele regex simple nu pot valida perfect orice email. Verifică exact cerința problemei.",
    "check": {
      "question": "Ce reprezintă obiectul timedelta(days=1) din modulul datetime?",
      "options": [
        "O durată de o zi",
        "Un an calendaristic",
        "Un șir de caractere cu data"
      ],
      "correct": 0,
      "explanation": "timedelta(days=1) reprezintă durata de o zi."
    }
  },
  "complexitate": {
    "hook": "Două programe pot da același răspuns, dar unul poate face mult mai multă muncă.",
    "story": "Să cauți un nume într-o listă de un milion de elemente poate fi foarte diferit de a înjumătăți repetat intervalul de căutare.",
    "points": [
      "O(n) descrie o parcurgere care crește proporțional cu n.",
      "O(n²) apare, de exemplu, când pentru fiecare element parcurgi toate elementele.",
      "O(log n) apare când problema este înjumătățită la fiecare pas."
    ],
    "walk": [
      "Pornești cu n = 8 și pași = 0.",
      "Înjumătățești n: 8 → 4 → 2 → 1.",
      "Ai făcut 3 înjumătățiri; creșterea este logaritmică."
    ],
    "trap": "Complexitatea nu este timpul exact în secunde și nu se stabilește dintr-un singur test.",
    "check": {
      "question": "Câte înjumătățiri sunt necesare pentru a transforma 16 în 1?",
      "options": [
        "2",
        "4",
        "16"
      ],
      "correct": 1,
      "explanation": "16 → 8 → 4 → 2 → 1: patru pași."
    }
  },
  "divide": {
    "hook": "Divide et Impera înseamnă: împarte, rezolvă bucăți mai mici, combină.",
    "story": "Când cauți un cuvânt într-un dicționar sortat, poți deschide la mijloc și elimina jumătate din pagini.",
    "points": [
      "Identifici subproblema și cazul în care poți răspunde direct.",
      "Împarți problema în părți mai mici.",
      "Combini răspunsurile, dacă problema cere acest pas; căutarea binară elimină o jumătate."
    ],
    "walk": [
      "Pentru putere(a, n), n = 0 are rezultatul 1.",
      "Calculezi o singură dată p = putere(a, n // 2).",
      "Folosești p * p sau p * p * a dacă exponentul este impar."
    ],
    "trap": "Căutarea binară obișnuită funcționează pe o secvență sortată; pe date nesortate poți elimina jumătatea greșită.",
    "check": {
      "question": "În căutarea binară într-o listă sortată crescător, în ce jumătate continui dacă valoarea căutată este mai mare decât elementul din mijloc?",
      "options": [
        "Cauți în jumătatea dreaptă",
        "Cauți în jumătatea stângă",
        "Oprești mereu căutarea"
      ],
      "correct": 0,
      "explanation": "Într-o listă sortată crescător, valorile din stânga nu mai pot conține răspunsul."
    }
  },
  "greedy": {
    "hook": "Greedy înseamnă să alegi acum ceea ce pare cel mai bun, fără să revii.",
    "story": "Dacă trebuie să participi la cât mai multe întâlniri care nu se suprapun, este util să începi cu cea care se termină cel mai devreme.",
    "points": [
      "Ai nevoie de o regulă locală clară pentru fiecare alegere.",
      "Regula trebuie justificată pentru problema concretă.",
      "heapq este o structură care permite extragerea eficientă a valorii minime."
    ],
    "walk": [
      "Ai valorile [8, 3, 5] și creezi un heap.",
      "heapify organizează datele pentru operațiile de heap.",
      "heappop extrage minimul, adică 3."
    ],
    "trap": "Greedy nu garantează optimul pentru orice problemă. De exemplu, nu rezolvă optim orice sistem de monede.",
    "check": {
      "question": "Pentru un heap minim cu valorile 8, 3, 5, ce extrage heappop?",
      "options": [
        "8",
        "3",
        "5"
      ],
      "correct": 1,
      "explanation": "Într-un min-heap, rădăcina este valoarea minimă."
    }
  },
  "dinamica": {
    "hook": "Programarea dinamică evită să rezolvi aceeași subproblemă de prea multe ori.",
    "story": "La Fibonacci, aceeași valoare F(3) ar fi recalculată în mai multe ramuri ale unei recursii naive.",
    "points": [
      "Definești ce reprezintă o stare, de exemplu dp[i].",
      "Calculezi fiecare stare din stări deja cunoscute.",
      "Poți memora rezultate recursiv sau le poți construi iterativ."
    ],
    "walk": [
      "Pentru Fibonacci, pornești cu a = 0 și b = 1.",
      "La fiecare pas actualizezi simultan a, b = b, a + b.",
      "După n pași, a reprezintă F(n)."
    ],
    "trap": "La rucsacul 0/1 nu trebuie să folosești același obiect de mai multe ori; ordinea tranzițiilor contează.",
    "check": {
      "question": "Pentru șirul Fibonacci definit prin F(0)=0, F(1)=1 și F(n)=F(n-1)+F(n-2) pentru n ≥ 2, cât este F(4)?",
      "options": [
        "2",
        "3",
        "4"
      ],
      "correct": 1,
      "explanation": "Șirul începe 0, 1, 1, 2, 3; deci F(4)=3."
    }
  },
  "backtracking": {
    "hook": "Backtracking încearcă variante, revine și explorează alte variante.",
    "story": "Este ca un labirint: alegi un drum, iar dacă nu duce la ieșire te întorci la ultima bifurcație.",
    "points": [
      "Construiești o soluție parțială, pas cu pas.",
      "Verifici dacă următoarea alegere este permisă.",
      "După apelul recursiv revii la starea anterioară pentru altă alegere."
    ],
    "walk": [
      "Pentru un șir de 2 biți, alegi mai întâi 0 sau 1.",
      "Pentru fiecare alegere, mai adaugi 0 sau 1.",
      "Obții în ordine 00, 01, 10, 11."
    ],
    "trap": "Fără caz de oprire, recursia poate continua la nesfârșit. Fără revenirea la starea anterioară, ramurile se pot amesteca.",
    "check": {
      "question": "Câte șiruri binare distincte de lungime 3 există?",
      "options": [
        "3",
        "6",
        "8"
      ],
      "correct": 2,
      "explanation": "Fiecare dintre cele trei poziții are două opțiuni: 2 × 2 × 2 = 8."
    }
  }
};
