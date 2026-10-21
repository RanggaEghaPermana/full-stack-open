# Part 4 — Blog List backend

AI-assisted work prepared with Codex from the official exercise requirements. No model solutions were used. Submitted on21 October2026:23 exercises, with AI assistance and the two-hour estimate disclosed.

## Run

Use Node >=22.3. Run `npm ci`, copy `.env.example` to `.env`, configure a separate Blog List MongoDB database and a random signing `SECRET`, then run `npm run dev`. `npm start` starts without watch mode. Do not use the deployed Phonebook database or reuse its restricted credentials for this application.

For a self-contained local demonstration, run `npm run demo`. This creates a real temporary MongoDB process and a random ephemeral signing secret, binds Express only to http://127.0.0.1:3005, and discards its database on shutdown. Create a fictional user using `requests/blogs.rest`; those examples are local demonstration values. The frontend is implemented in Part 5.

## API

- `GET /api/blogs` and `GET /api/blogs/:id` list blogs, including creator username/name.
- `POST /api/users` creates a user with username, name, password. Username/password require three characters; usernames are unique; bcrypt stores hashes only. Passwords longer than bcrypt's 72-byte limit are rejected.
- `GET /api/users` lists users and populated blog summaries. No password/hash is returned.
- `POST /api/login` verifies credentials and returns an HS256 token valid for one hour.
- `POST /api/blogs` requires a Bearer token and assigns its user as creator, ignoring supplied ownership. Title and URL are required; omitted likes default to zero.
- `DELETE /api/blogs/:id` requires the creator's token; another user receives403, missing/invalid token401, absent blog404.
- `PUT /api/blogs/:id` updates a finite nonnegative numeric likes value. The later routed Part5 stage now requires a Bearer token for likes as well; other fields and ownership cannot be overwritten.

The application is split into controllers, models, configuration, database connection, logger and middleware. Express5 forwards rejected async handlers to centralized error middleware. `tokenExtractor` and route-specific `userExtractor` are separate middleware. User→blogs uses a Mongoose virtual population so the blog's creator reference is the single stored source of truth and deletion cannot leave stale duplicate references.

## Exercise review

- 4.1–4.2: runnable npm backend, watch mode, modular routes/models/config/logger, independently checked local HTTP add/list.
- 4.3–4.7: dummy, totalLikes, favoriteBlog, mostBlogs and mostLikes; empty/singleton/multiple/tie inputs tested with original fictional fixtures.
- 4.8–4.12: SuperTest GET count/JSON, public id, authenticated POST persistence, default likes, missing title/URL rejection.
- 4.13–4.14: async REST delete/update with persisted results and rejected-update checks.
- 4.15–4.17: users, bcrypt, invalid/duplicate signup tests, populated references in both list APIs.
- 4.18–4.22: login tokens, token creator assignment, extraction middleware, creator-only delete and reusable user lookup.
- 4.23: all creation tests use valid tokens; missing/invalid/expired token failures are covered.

These are final application states; later authentication requirements supersede the temporary unauthenticated creation and arbitrary-user assignment stages.

## Verified 21 October 2026

`npm run lint` passed. `npm test` passed **23 tests**, including16 API integration tests using SuperTest against a real local MongoDB process, and7 helper tests. Each run creates an isolated test database via mongodb-memory-server; no Atlas credentials or production data are accessed. Test mode selects `TEST_MONGODB_URI` independently from development.

API checks include normalized identifiers, hidden credentials, hash verification, populated references, token validity, creator authorization, field validation, duplicate users, malformed ids/JSON, unknown endpoints, persistence and rejected mutations. A separate HTTP client also verified local signup→login→create→list→like→delete against the running demo; its fictional test blog was removed.

Official material: https://fullstackopen.com/en/part4/
