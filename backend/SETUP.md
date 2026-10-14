# Activarea conturilor Microsoft și salvării SQL

Codul este pregătit, dar autentificarea este dezactivată implicit. Nu a fost creat un proiect extern, o aplicație Microsoft sau o bază de date. Site-ul poate rămâne pe GitHub Pages.

Implementarea de referință folosește Supabase Auth + PostgreSQL. Dacă viitorul serviciu SQL este diferit, `schema.sql` nu este portabil fără modificări: folosește `auth.users`, `auth.identities`, RLS și RPC Supabase. Va fi necesar un API care validează tokenurile Microsoft; browserul nu se conectează direct la SQL cu o parolă.

## 1. Microsoft Entra

Obține de la administratorul universității Tenant ID-ul și dreptul de a înregistra o aplicație. Nu presupune că cele două domenii aparțin aceluiași tenant: administratorul trebuie să confirme. Dacă au tenant-uri diferite, integrarea trebuie adaptată înainte de activare.

Înregistrează aplicația pentru tenant-ul universitar confirmat. În această variantă restricția tenant-ului este obligatorie. Nu activa folosind `common` sau `consumers`.

Configurează redirect URI de tip Web: `https://PROJECT_REF.supabase.co/auth/v1/callback`. Creează Client Secret; valoarea secretului se introduce numai în providerul Azure din Supabase, niciodată în GitHub sau `auth-config.js`. Notează expirarea secretului.

În manifest păstrează claims existente și adaugă `email` și `xms_edov` la ID token conform documentației Supabase. Nu permite domenii de email neverificate. Restricția de domeniu singură nu înlocuiește verificarea identității de Microsoft și limitarea tenant-ului. Politicile universității pot solicita aprobarea administratorului pentru autentificare.

Sursă: https://supabase.com/docs/guides/auth/social-login/auth-azure

## 2. Supabase și PostgreSQL

1. Creează proiectul în regiunea potrivită. Verifică planul, limitele și condițiile serviciului înainte de activare.
2. Execută `backend/schema.sql` în SQL Editor. Scriptul nu șterge progresul existent; recreează numai politica specifică aplicației.
3. În Authentication → Hooks, activează **Before User Created** cu funcția `public.pa_before_user_created`. Fără acest pas, filtrarea creării contului nu este activă, chiar dacă accesul SQL rămâne restricționat.
4. Dezactivează email/parolă, anonymous sign-in, ceilalți provideri și identity linking manual. Activează numai Azure/Microsoft.
5. Introdu Client ID, Client Secret și Azure Tenant URL: `https://login.microsoftonline.com/TENANT_ID_CONFIRMAT`.
6. Setează Site URL `https://pa.infoid26.ro/` și redirect allowlist exact `https://pa.infoid26.ro/`. Pentru testare adaugă separat URL-ul local, fără wildcard-uri de producție.

Sursa hook: https://supabase.com/docs/guides/auth/auth-hooks/before-user-created-hook
Sursa RLS: https://supabase.com/docs/guides/database/postgres/row-level-security

## 3. Configurația site-ului

Completează `site/auth-config.js` cu URL-ul proiectului și cheia **publishable** (sau legacy anon), apoi `enabled:true`. Cheia publică este destinată browserului; accesul este limitat de RLS și RPC. Nu introduce `service_role`, chei secret sau parola SQL. Configurația Microsoft și secretul rămân exclusiv la serviciul Auth.

Bundle-ul `site/account.js` trebuie publicat cu celelalte fișiere. Pentru regenerare: `npm ci`, apoi `npx esbuild site/account-source.js --bundle --minify --format=iife --outfile=site/account.js`.

## Comportament și izolare

Butonul Microsoft apare în dreapta sus. Fără configurare explică faptul că serviciul nu este activat. Utilizatorii pot continua studiul local fără conectare. Microsoft confirmă identitatea; hook-ul respinge alte domenii la crearea contului. SQL verifică identitatea Azure confirmată, domeniul exact și ID-ul autentificat la fiecare acces. `user_metadata` nu autorizează accesul.

Fiecare utilizator are propriul rând de progres și propria copie locală. Codul, rezultatele, întrebările și zilele de activitate se sincronizează. Progresul anonim poate fi copiat explicit în cont; codul existent în cont are prioritate. La deconectare revine copia anonimă, fără ștergerea acesteia. Nu există listă publică de emailuri sau progres.

Salvarea folosește o versiune verificată atomic. Dacă alt dispozitiv a salvat o versiune nouă, aplicația nu o suprascrie automat. Utilizatorul poate exporta lucrul local și încărca versiunea din cloud. La pierderea conexiunii, codul rămâne local și poate fi sincronizat ulterior. Nu este sincronizare colaborativă în timp real.

Marcajele de exerciții rezolvate sunt autoevaluare, nu note oficiale: studentul își poate modifica starea în propriul browser. SQL stochează progresul, nu certifică rezultatele Python. Pe un calculator comun, deconectează-te și șterge datele site-ului după export: copia locală a contului rămâne în browser.

## Verificări obligatorii înainte de activare

- Cont real `@s.unibuc.ro` și cont real `@unibuc.ro`: autentificare, salvare, reîncărcare pe alt browser.
- Alt domeniu, inclusiv `@unibuc.ro.example.com`: respins la creare și acces SQL.
- Utilizatorul A nu poate citi sau modifica rândul lui B, nici schimbând `user_id` sau metadata.
- Token expirat, utilizator neconectat, provider diferit: fără acces SQL.
- Două dispozitive care salvează simultan: conflict explicit, fără suprascriere.
- Modul propriu și cod principal: import, editare, reverificare și restaurare.
- Deconectare și conectare cu alt cont pe același browser: fără amestecarea progresului.
- Configurație absentă, conexiune căzută și callback OAuth cu eroare: aplicația rămâne utilizabilă local.

Aceste verificări cu identități reale și SQL necesită serviciul configurat; nu pot fi confirmate numai din proiectul local.

Testele locale cu răspunsuri simulate se rulează cu `node scripts/validate_account.cjs`. Ele verifică configurația dezactivată, restaurarea și salvarea progresului și conflictele de versiune; nu înlocuiesc testele OAuth și SQL de mai sus. Licențele SDK sunt în `site/account-licenses.txt`.
