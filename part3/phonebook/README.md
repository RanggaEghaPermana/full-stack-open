# Part 3 — Full Stack Phonebook

AI-assisted implementation prepared with Codex. This work is not yet submitted. The Express/Mongoose application uses an actual free Atlas M0 cluster and is deployed with its compiled React frontend.

Public application: **https://rangga-fso-phonebook.vercel.app**

API: https://rangga-fso-phonebook.vercel.app/api/persons

Information: https://rangga-fso-phonebook.vercel.app/info

## Local setup

Requires Node.js >=22.3 and MongoDB, or an Atlas connection string.

1. Run `npm ci` in this backend directory, then `npm --prefix frontend ci`.
2. Copy `.env.example` to `.env` and set `MONGODB_URI`. The real `.env` is ignored by git. Never put passwords in committed files.
3. Run `npm run build` to build the React frontend and copy its output into the backend's `public/` directory.
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
- Frontend production build and copy to backend `public/` passed.
- Seven integration tests passed against a real local MongoDB process: normalized list/info; persisted create/read/update/delete; missing fields, short names, invalid phone formats; case-insensitive duplicates; validation on update without corrupting stored data; malformed ids/JSON and missing routes; and CLI add/list with connection cleanup.
- HTTP verification confirmed Express serves the Part 3 HTML and referenced production JS/CSS assets, and `/api/persons` returns the local MongoDB sample records.
- Public deployment checks passed without a Vercel login: frontend HTML, API JSON, and `/info` all return HTTP 200.
- Remote checks against the actual Atlas database passed create/read/update/delete, duplicate rejection, invalid names and ids, validation on update without changing stored data, and cleanup.
- Browser checks on the public application passed creating a fictional contact, updating it, verifying persistence in a fresh page, and deleting it through the inline confirmation. The test contact was removed.
- The database CLI successfully added and listed a fictional contact in Atlas.
- `requests/persons.rest` contains requests for manual REST-client checking. Automated integration tests use an isolated local database.

## Deployment

The dedicated Vercel project `fso-phonebook` deploys the Express backend and compiled frontend from this directory, using the Singapore region. The generated frontend is copied to `public/`, which Vercel serves as static assets. The connection string is supplied as a Production Secret. Code deployment was verified at commit `70ba9c5`.

Atlas uses the free M0 tier in Singapore. Its database user is restricted to read/write on database `phonebook` and scoped to cluster `fso-phonebook`. The network access list includes the local setup IP and `0.0.0.0/0` to permit Vercel's dynamic outbound addresses; database credentials are still required. The URI is stored only in a gitignored local `.env` and the production secret. This course app has no user authentication and contains only fictional demonstration contacts.

All implementation and cloud verification requirements for exercises 3.1–3.21 are ready for learner review and submission. The submission form also exposes checkbox22 for the ESLint stage; the backend ESLint configuration and passing lint check cover it.

Official material: https://fullstackopen.com/en/part3/
