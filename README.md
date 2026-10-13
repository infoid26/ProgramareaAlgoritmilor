# PA · Programarea Algoritmilor · INFO ID 26

Aplicație statică pentru studiu individual, organizată după temele materialelor locale ale profesorului Ceaușescu Ciprian. Conținutul este creat/adaptat pentru grupă. Fișierele originale din Curs și Laborator rămân locale și sunt excluse prin .gitignore.

## Cum folosești aplicația

Prima pagină este un singur traseu de învățare: introducerea în Python, apoi capitolele de Programarea Algoritmilor. Nu există meniu sau bară laterală. Sigla PA din partea de sus te aduce înapoi la traseu, iar „Continuă învățarea” reia ultima lecție vizitată.

1. Începe cu cele cinci lecții introductive. Acestea se deblochează pe măsură ce le finalizezi.
2. Continuă cu un capitol PA. „Alege o lecție scurtă” afișează lecțiile capitolului; „Continuă” deschide prima lecție nefinalizată.
3. Citește explicația, răspunde la întrebare și scrie codul. O lecție PA include cel mult trei exerciții.
4. Apasă „Verifică”. După răspunsul corect sau trecerea tuturor testelor exercițiului, poți continua la pasul următor.

**Cele 16 elemente numerotate din partea PA sunt capitole, nu exerciții.** În total sunt 260 de exerciții:

| Parte | Capitole / lecții | Exerciții | Cazuri de test |
| --- | --- | ---: | ---: |
| Introducere Python | 5 lecții | 15 | 33 |
| Materia PA și completări | 14 capitole principale + 2 suplimentare, împărțite în 86 de lecții scurte | 245 | 751 |
| Total | 91 de lecții | 260 | 784 |

Capitolele PA includ 55 de fișe de concepte. Ordinea urmărește cunoștințele necesare unui începător, fără să reproducă obligatoriu numerotarea materialelor profesorului.

Lista completă a completărilor și limitelor este în [site/completari.md](site/completari.md), iar numerele pe capitole în [site/coverage.md](site/coverage.md).

## Editor și verificare

Scrii codul în editor și apeși „Verifică” sau Ctrl + Enter. Datele de intrare ale testelor sunt furnizate automat; nu trebuie introduse manual. La exercițiile care nu citesc date, caseta de intrare nu apare. Pentru încercări proprii, deschide „Încearcă date proprii” sau „Fișierele pentru rulare” și folosește „Rulează cu aceste date”.

Când cerința include scrierea unui modul propriu, câmpul său de cod rămâne vizibil și este folosit la toate testele. Erorile indică explicația, fișierul și linia. Modificarea codului principal sau a modulului necesită o nouă verificare. Indiciile și o posibilă rezolvare sunt disponibile separat.

Python rulează în browser prin Pyodide; prima încărcare necesită internet. Fișierele de lucru sunt temporare, iar execuția este oprită automat după 10 secunde pentru fiecare test.

Pentru trasee, subșiruri, rucsac, programări, cuburi, împărțiri și alte probleme constructive, verificatorul acceptă soluții alternative valide cu valoarea optimă a cazului. Pentru enumerări cu ordine liberă, verifică mulțimea completă și lipsa duplicatelor. Pentru coduri aleatorii verifică formatul. Nu impune o singură ieșire de referință acolo unde cerința admite mai multe soluții.

Testele nu demonstrează folosirea tehnicii cerute, complexitatea sau corectitudinea pentru orice intrare. Lecțiile includ raționamente, recurențe, invariante și întrebări; studentul trebuie să poată justifica soluția. Modulele/testarea/obiectele și unele aplicații avansate sunt marcate suplimentar; prezența lor în folder nu confirmă automat cerințe de examen.

## Evaluare

Slide-ul Notare din prezentarea introductivă locală indică 70% examen scris și 30% proiect, cu predare până la 24.01 și prezentare în ziua examenului. Intervalul sesiunii din slide este 25.01.2027–14.02.2027. Structura exactă a subiectelor și condițiile detaliate nu apar acolo. Un model de laborator din 2025 este material de pregătire, nu un barem actual confirmat.

## Progres și copii de siguranță

Codul, rezultatele verificărilor, XP, nivelul și zilele consecutive se păstrează local în browser. Nu există conturi sau sincronizare între dispozitive. Ștergerea datelor browserului poate elimina progresul.

La finalul traseului, deschide „Mai multe opțiuni”, apoi „Caută o problemă sau salvează progresul”. Acolo poți căuta exerciții, descărca lucrul tău și restaura un export. Identificatorii exercițiilor și cheile de salvare existente au fost păstrate.

## Acces

Aplicația va fi disponibilă la [pa.infoid26.ro](https://pa.infoid26.ro/). Se folosește direct în browser, fără instalare sau server local.

## Publicare pe GitHub Pages

Aplicația este statică și nu necesită un server Python în producție. Publică `index.html`, folderul `site/` și `.nojekyll`, păstrând structura fișierelor. Folderul `site/` include și fișierele Python folosite de evaluator. Scripturile de generare pot rămâne în repository pentru întreținere.

Materialele originale din `Curs/`, `Laborator/` și extragerile din `.audit/` sunt excluse prin `.gitignore`; nu le încărca manual. Această documentație nu confirmă că aplicația a fost publicată sau că un domeniu a fost configurat.

## Întreținere și verificare

După modificarea surselor de exerciții, regenerează conținutul și verifică soluțiile de referință și evaluatorul:

```powershell
python scripts/build_exercises.py
python scripts/validate_content.py
python scripts/validate_runner.py
python scripts/validate_constructive.py
```

`validate_content.py` verifică exercițiile PA, `validate_runner.py` verifică și introducerea Python prin evaluator, iar `validate_constructive.py` verifică acceptarea soluțiilor alternative, respingerea celor incorecte și izolarea modulelor. Pentru modificări ale interfeței, verifică și navigarea, editorul și afișarea pe telefon în browser.
