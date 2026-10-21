# Part 3 — Full Stack Phonebook

AI-assisted implementation prepared with Codex. This work is not yet submitted. The Express/Mongoose application is implemented and tested locally; MongoDB Atlas provisioning and public deployment are still pending. There is no verified public application URL yet.

## Local setup

Requires Node.js >=22.3 and MongoDB, or an Atlas connection string.

1. Run `npm ci` in this backend directory, then `npm --prefix frontend ci`.
2. Copy `.env.example` to `.env` and set `MONGODB_URI`. The real `.env` is ignored by git. Never put passwords in committed files.
3. Run `npm run build` to build the React frontend and copy its output into the backend's `dist/` directory.
4. Run `npm start`, or `npm run dev` for automatic restarts. The backend defaults to port 3001 and serves both the frontend and `/api/persons`.
5. For a separate frontend dev server, run `npm --prefix frontend run dev`; Vite proxies `/api` to port 3001.

`npm run demo` runs a loopback-only demonstration with a real temporary MongoDB process and fictional sample contacts at http://127.0.0.1:3003 . It is only for local verification: its data is discarded when stopped, and it does not satisfy the Atlas or deployment exercises.

## API and validation

- GET `/api/persons`: all contacts; GET `/api/persons/:id`: one contact.
- POST `/api/persons`: create; PUT `/api/persons/:id`: update; DELETE `/api/persons/:id`: delete.
- GET `/info`: database entry count and request receipt time.
- Name is required, trimmed, and at least 3 characters. A case-normalized unique database index prevents duplicate names.
- Number is required, at least 8 characters, and must contain a 2–3 digit prefix, one hyphen, and a digits-only suffix. Saving the updated document also applies full Mongoose validation.
- JSON responses expose `id` and omit MongoDB internals and the normalized uniqueness key.
- Central middleware handles validation failures, malformed ids, duplicate names, invalid JSON, and database failures.
- Morgan logs the tiny fields plus POST data for the exercise. Use fictional contacts only in this learning application.
- The frontend uses relative `/api/persons` URLs and displays backend validation error messages. Confirmations are inline accessible page controls.

## Database CLI

With `MONGODB_URI` set, `node mongo.js` lists contacts. `node mongo.js unused "CLI Contact" "040-1234567"` adds a contact; the first argument is unused in direct-URI mode.

For the course's password-argument format, configure a non-secret `MONGODB_URI_TEMPLATE` containing `<password>`; `node mongo.js PASSWORD "Name" "040-1234567"` substitutes the encoded password. Prefer direct secret environment configuration outside this exercise because command-line passwords may be visible in process listings/history. The connection is always closed after the operation.

## Verification — 21 October 2026

- Backend ESLint and frontend lint passed.
- Frontend production build and copy to backend `dist/` passed.
- Seven integration tests passed against a real local MongoDB process: normalized list/info; persisted create/read/update/delete; missing fields, short names, invalid phone formats; case-insensitive duplicates; validation on update without corrupting stored data; malformed ids/JSON and missing routes; and CLI add/list with connection cleanup.
- HTTP verification confirmed Express serves the Part 3 HTML and referenced production JS/CSS assets, and `/api/persons` returns the local MongoDB sample records.
- Browser checks of the Express-served frontend showed the MongoDB sample contacts, displayed the backend validation message for a two-character name, created a fictional test contact, and updated its number successfully. A subsequent browser reload was interrupted by Chrome extension UI. API-level delete and persistence checks passed in the integration suite; the full public deployment/browser flow is still pending.
- `requests/persons.rest` contains requests for manual REST-client checking. No real cloud data is used in the automated tests.

## Remaining work before submission

- Provision the free Atlas cluster and a database user restricted to the phonebook database; configure authorized network access and the secret connection string.
- Verify the database CLI and CRUD against Atlas.
- Deploy the backend (which serves the compiled frontend) to a free hosting service; put the verified public application URL here.
- Verify browser CRUD, validation feedback, `/info`, and persistence on the deployed application.
- Submit only after these cloud requirements are actually met. No deployment or Atlas exercise is claimed complete by the local test results.

Official material: https://fullstackopen.com/en/part3/
