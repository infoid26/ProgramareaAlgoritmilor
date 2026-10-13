# Programarea Algoritmilor · INFO ID 26

AlgoLab este o platformă statică interactivă de învățare Python și algoritmi, creată pentru grupa INFO ID 26. Acest repository **nu conține** fișierele de curs, laboratoarele sau rezolvările distribuite de profesor. Exercițiile și recapitulările de pe site sunt create/adaptate ca material suplimentar de studiu; formatul examenului nu este confirmat.

## Ce include

- **Curs Python:** 5 lecții interactive pe câte 8 pași, 10 quiz-uri cu feedback, 15 exerciții rezolvate direct în lecție și 33 de cazuri de test, plus deblocarea progresivă a lecțiilor.
- **Traseul de algoritmică:** 14 capitole cu explicații pas cu pas, analogii pentru începători, exemple desfăcute pe linii, două quiz-uri originale pe capitol și 120 de probleme rezolvate chiar în lecție.
- **Exerciții pe capitole:** 120 de probleme cu 376 de cazuri de verificare, indicii și rezolvări de referință, în trei niveluri.
- **Editor Python în browser:** rulare cu date introduse, verificare automată, explicații pentru erori, salvare locală de soluții, export/import progres JSON și descărcare `.py`.
- **Progres de tip gamification:** XP calculat din quiz-uri corecte (10 XP fiecare, inclusiv două pe fiecare capitol de algoritmică), exerciții introductive (20 XP), probleme de algoritmică (25 XP), lecții Python finalizate (40 XP), capitole de algoritmică completate (30 XP), niveluri și zile consecutive de activitate. Punctele nu se dublează la repetare.
- **Fără backend și fără conturi:** codul rulează local în browser folosind Pyodide. Pentru prima încărcare este necesar internetul.

Soluțiile pentru cursul introductiv se păstrează separat prin identificatori `intro-*`; nu sunt incluse în numărul celor 120 de exerciții pentru materie. La export, se includ însă toate soluțiile salvate, quiz-urile finalizate și zilele de activitate. Importul restaurează răspunsurile corecte, dar soluțiile de cod importate trebuie reverificate.

## Rulare locală

Din rădăcina repository-ului, cu Python instalat:

```bat
py -m http.server 8010 --bind 127.0.0.1
```

Deschide în browser `http://127.0.0.1:8010/`. **Nu** deschide `index.html` direct prin `file:///`: browserul blochează workerul JavaScript. După publicarea prin GitHub Pages, această problemă nu apare.

## Structură

```text
index.html
.nojekyll
.gitignore
site/
  app.js
  python-course.js
  interactive-content.js
  algorithm-quizzes.js
  algorithm-lessons.js
  journey.js
  exercises.js
  exercises.json
  playground.js
  python-worker.js
  runner.py
  style.css
  coverage.md
scripts/
  build_exercises.py
  validate_content.py
  validate_runner.py
```

Nu copia folderele locale `Curs/` și `Laborator/` în repository. Fișierul `.gitignore` din arhivă le exclude explicit, inclusiv dacă rămân pe calculator. Dacă au fost deja adăugate în indexul Git, `.gitignore` nu le dezindexează; elimină-le din index înainte de `git push`. `site/python-course.js` este o colecție proprie, independentă de generator. `scripts/build_exercises.py` generează fișierele `site/exercises.js`, `site/exercises.json`, `site/coverage.md`, fără a include materiale sau linkuri către fișierele profesorului.

## Verificări

```bat
py scripts/build_exercises.py
py scripts/validate_content.py
py scripts/validate_runner.py
```

Testele verifică ieșirile cunoscute și unele cerințe de structură; nu demonstrează complexitatea sau corectitudinea pentru orice intrare. Pentru executare este folosit un worker nou, cu limită de timp per test. Platforma nu este destinată rulării de cod din surse necunoscute într-un evaluator securizat.

## Publicare cu GitHub Pages

În repository-ul GitHub, deschide **Settings → Pages → Build and deployment** și selectează **Deploy from a branch**, `main`, `/(root)`. Site-ul va fi disponibil la adresa `https://infoid26.github.io/ProgramareaAlgoritmilor/` dacă organizația permite GitHub Pages.

## Progres și compatibilitate

Soluțiile deja salvate în `localStorage` sub `pa-drafts-v2` rămân disponibile. Quiz-urile și zilele de activitate sunt salvate separat sub `pa-journey-v1`. XP se recalculează din reușite, fără a permite acumularea repetată de puncte pentru aceeași problemă. Streak-ul reflectă doar zilele în care au fost înregistrate reușite noi, nu simpla accesare a site-ului.

Fluxurile ghidate sunt `#curs-python` → `#lectie-python/intro-print/0` și `#traseu` → `#capitol/baze/0`. În ambele, editorul apare **în același ecran** cu exercițiul; după verificare se deblochează butonul „Continuă” către următorul exercițiu, fără navigare înainte-înapoi. Lista `#exercitii` rămâne disponibilă pentru exersare liberă. În continuare, site-ul folosește căi relative pentru GitHub Pages. Progresul existent (`pa-drafts-v2` și `pa-journey-v1`) este păstrat. Aplicația funcționează și din subdirectorul GitHub Pages al repository-ului. Pentru evaluarea codului, se păstrează `site/python-worker.js` și `site/runner.py` fără modificări.

## Modificări ale fluxului ghidat

- Nu mai este necesar să părăsești lecția pentru a rezolva un exercițiu; același editor se mută între ecranele lecțiilor, fără a schimba evaluatorul Python.
- Datele din editor se salvează separat pentru fiecare problemă la fiecare modificare. La un test trecut apare direct legătura către problema următoare.
- Quiz-urile de algoritmică sunt acum două per capitol și sunt integrate în lecția pe pași; XP se acordă o singură dată pentru fiecare reușită.
- Testele Python de referință: 409 cazuri și 8 verificări pentru erori/output parțial. Sintaxa JavaScript este verificată cu `node --check`. Întrucât mediul de lucru nu a permis încărcarea completă a paginii în browserul de test, fluxul UI necesită un test manual pe GitHub Pages.
