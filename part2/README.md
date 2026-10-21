# Part 2 — collections, forms, and server data

AI-assisted work prepared with Codex, with assistance disclosed. Review the implementations and the official material before submitting them. Part 2 has not been submitted yet.

## Run

Each application is independent. Run `npm ci` in its directory, then `npm run dev`. Each also provides `npm run build` and `npm run lint`.

- `courseinfo` (2.1–2.5): Course is a separate module; courses and their parts use stable keys and map; totals use reduce, including an initial zero value.
- `phonebook` (2.6–2.17): first run `npm run server` in a second terminal to start JSON Server at http://localhost:3001, then run the frontend. `db.json` contains fictional course sample contacts. All requests use Axios through `src/services/persons.js`. Success and error messages have different styles. Name matching/filtering are case insensitive. Updating an existing name and deleting a contact use an inline accessible confirmation with Confirm/Cancel buttons. Duplicate identical records show an error notification. Missing server records are removed from the local view after a failed update/delete. This final version uses page notifications and inline confirmation instead of blocking native browser alerts.
- `countries` (2.18–2.20): the official Helsinki REST Countries API supplies country details and capital coordinates. Search handles too many results, 2–10 results with show buttons, one match, and no matches. Capital weather uses the Open-Meteo API without a paid account or API key. Weather displays temperature, condition, wind speed, timestamp, and attribution. Aborting requests and keyed country components prevent outdated weather from appearing for a different country.

## Verification — 21 October 2026

All three applications passed `npm run lint` and `npm run build`.

Browser checks:

- Courseinfo displayed two courses with different part counts (4 and 2) and totals 42 and 10.
- Phonebook initially loaded all four contacts from JSON Server. Filtering with ADA displayed only Ada Lovelace. Adding FSO Test Contact sent a POST; replacing its number used PUT without duplicating the name. Both the database file and GET /persons contained exactly one updated contact.
- A second browser tab retained the contact while the first deleted it. Trying to update it from the stale tab produced the expected 404, displayed a red error notification, and removed the stale contact from the view. The original four sample contacts were unchanged, and temporary test data was removed.
- Countries initially displayed the too-many-results message. Query sw returned four matches; show Sweden displayed its capital, area, language, flag, and live Stockholm weather (temperature and wind). A non-matching query displayed no matches. Uppercase FINLAND opened Finland automatically with its details.
- Countries browser logs showed no application errors during these checks. The Phonebook 404 is intentional evidence of error handling.

## Learner review

Explain how map/reduce build the course list, why useEffect loads initial data, why a confirmed server response drives state changes, and how a stale record produces a 404. Try changing country searches while a weather request is loading. Record actual personal study time separately; no study hours are inferred from agent execution time.

## Sources

- https://fullstackopen.com/en/part2/
- https://studies.cs.helsinki.fi/restcountries/
- https://open-meteo.com/en/docs
- https://github.com/typicode/json-server
