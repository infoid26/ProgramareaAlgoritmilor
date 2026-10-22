# Logare Microsoft și progres PA în aceeași bază ca Tehnici Web

Integrarea folosește același model din `TehniciWeb/scripts/accounts.mjs`: Azure App Service Authentication (Easy Auth) + PostgreSQL. Supabase nu mai este utilizat. Au fost pregătite codul și verificările locale; această modificare nu configurează și nu publică resurse Azure.

## Interfață

În dreapta sus apare „Conectare cu Microsoft”. După conectare, apare numele din identitatea confirmată de Microsoft și „Logout”. Adresa este disponibilă la trecerea peste nume. Browserul nu cere și nu stochează parola universitară sau tokenurile Microsoft; sesiunea este gestionată de Azure.

Site-ul poate fi folosit fără cont, cu progres local. Dacă autentificarea nu este activată pe server, controlul este dezactivat. Pe o găzduire statică fără API, cursul rămâne utilizabil, dar logarea și salvarea SQL nu funcționează.

## Găzduirea

GitHub Pages nu poate executa backendul Node necesar. Pentru logare activă, `pa.infoid26.ro` trebuie servit de App Service sau de un proxy către acest backend pe aceeași origine. Nu trimite API-ul de progres către alt domeniu din JavaScript.

Nu publica pachetul PA peste aplicația App Service care servește deja Tehnici Web. Folosește o aplicație PA separată sau pregătește explicit un router pentru cele două domenii. Conexiunea PostgreSQL poate fi aceeași, fără mutarea și fără ștergerea datelor Tehnici Web.

Pornirea este `npm ci` și `npm start`, cu Node 24. În Azure sunt respectate `PORT` și bind-ul `0.0.0.0`; local, portul implicit este 8010 și autentificarea este oprită. Pentru un alt port local: `PORT=8011 node scripts/serve.mjs` într-un shell compatibil sau setează variabila de mediu în PowerShell. Health check: `/api/health`.

## Microsoft Entra / Easy Auth

1. Activează Authentication → Microsoft pe aplicația PA, folosind aceleași reguli universitare ca în Tehnici Web. Păstrează accesul anonim la curs; accesul la salvarea progresului rămâne restricționat pe server.
2. Poți reutiliza înregistrarea Entra existentă dacă administratorul permite, adăugând callback-ul exact `https://pa.infoid26.ro/.auth/login/aad/callback`. Păstrează callback-ul Tehnici Web; nu îl înlocui. Secretul se configurează numai în Azure.
3. Păstrează verificarea issuer-ului, audienței, nonce și HTTPS. Configurează același tenant universitar verificat pentru TW. `AUTH_UNIVERSITY_TENANT_IDS` este o listă explicită de GUID-uri; domeniul de email singur nu autorizează accesul.
4. Asigură claim-urile `tid`, `oid`, `preferred_username` sau `upn`, plus `name` pentru afișare. Sunt acceptate doar domeniile exacte `s.unibuc.ro` și `unibuc.ro`. Invitații cu `#EXT#`, alte tenant-uri și alte tipuri de identitate sunt respinși.
5. Node trebuie expus exclusiv prin intrarea App Service cu Easy Auth activ. Nu activa un bypass local și nu simula antetele `X-MS-CLIENT-PRINCIPAL`. `WEBSITE_INSTANCE_ID` și `WEBSITE_AUTH_ENABLED` provin din platformă.

Metoda de autentificare și antetele injectate de platformă sunt descrise de Microsoft: https://learn.microsoft.com/en-us/azure/app-service/configure-authentication-user-identities

## Setările aplicației PA

| Nume | Valoare |
| --- | --- |
| `AUTH_ENABLED` | `true`, numai după activarea Easy Auth |
| `AUTH_ORIGIN` | `https://pa.infoid26.ro` |
| `AUTH_UNIVERSITY_TENANT_IDS` | Aceleași ID-uri universitare verificate folosite pentru TW |
| `PROGRESS_USE_AZURE_POSTGRESQL` | `true` pentru reutilizarea setărilor Azure existente |
| `AZURE_POSTGRESQL_HOST` | Același server ca în TW |
| `AZURE_POSTGRESQL_PORT` | Același port, implicit 5432 |
| `AZURE_POSTGRESQL_USER` | Cont SQL cu acces la tabela PA |
| `AZURE_POSTGRESQL_PASSWORD` | Secretul, numai în setările Azure |
| `AZURE_POSTGRESQL_DATABASE` | Aceeași bază de progres ca în TW (`infoid-db` în documentația sa locală) |

Alternativ, `PROGRESS_DATABASE_URL` are prioritate. Conexiunea impune verificarea certificatului TLS; pentru connection string sunt permise `sslmode=verify-full` sau lipsa parametrului, caz în care driverul primește explicit verificarea certificatului. Nu folosi `sslmode=require`, `no-verify`, `disable` sau `rejectUnauthorized:false`. Nu copia secrete în repository, în HTML, în JavaScript sau în exemplele de configurație.

Serverul creează `public.pa_account_progress` la prima accesare validă. Poți executa în prealabil `backend/schema.sql`, fără să atingi `tw_account_progress`. Contul SQL trebuie să aibă permisiunile necesare pentru tabela PA; nu sunt necesare privilegii pentru ștergerea sau schimbarea tabelului TW.

## Date și sincronizare

- Identitatea progresului: perechea Microsoft tenant ID + object ID, nu emailul trimis de browser.
- PA: `public.pa_account_progress`. Tehnici Web: `tw_account_progress`. Nu se suprascriu.
- Fiecare utilizator are propriile coduri, fișiere, verificări, răspunsuri și poziție în curs. Copia locală este separată pe cont.
- Progresul anonim din browser este importat o singură dată, în primul cont care îl preia; codul existent în cont are prioritate. Nu este atribuit automat celui de-al doilea cont de pe același calculator.
- Salvările sunt parametrizate și condiționate de versiune. Modificările din exerciții diferite pot fi reunite automat; modificările incompatibile ale aceluiași exercițiu opresc sincronizarea și oferă export local înainte de încărcarea copiei din cont.
- O filă deschisă cu alt cont este refuzată de API. La deconectare, datele contului rămân în copia lui locală, dar la reîncărcare se revine la progresul anonim. Pe un calculator comun, șterge datele site-ului după export dacă nu vrei să rămână copia locală.
- Rezultatele sunt progres de autoevaluare; nu sunt note oficiale sau dovadă că o anumită metodă algoritmică a fost folosită.

## Verificări

`npm run check:accounts` execută verificări ale restricțiilor Microsoft, API-ului și SQL-ului pe PostgreSQL local prin PGlite, plus teste simulate ale interfeței și sincronizării. Testele verifică faptul că datele TW existente nu sunt modificate.

După configurarea Azure trebuie testate efectiv: un cont student și unul cadru didactic, un cont extern refuzat, numele afișat, Logout, două conturi pe același browser și recuperarea progresului pe alt dispozitiv. Aceste teste OAuth și conectarea la baza Azure nu pot fi confirmate din testele locale.
