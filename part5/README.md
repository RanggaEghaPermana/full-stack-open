# Part 5 — Blog List frontend and tests

AI-assisted implementation prepared with Codex from the official requirements, for learner review. No model solution was used. Not submitted yet.

## Run and review

1. In `../part4/bloglist`, run `npm ci` and `npm run demo` for a loopback-only real temporary MongoDB database on port3005. Use its `requests/blogs.rest` to create a fictional demo user. Normal development can instead use a separately configured persistent Blog List database.
2. In `bloglist-frontend`, run `npm ci` and `npm run dev`. Open http://127.0.0.1:5185 . The Vite proxy sends `/api` to port3005.
3. Log in, create a blog, show/hide its details, add likes, cancel/confirm removal as its creator, and log out. Login state persists across reload until logout or token rejection. Only the creator sees removal controls; the backend independently enforces ownership.

The new-blog form owns its input state, is hidden initially, and closes on cancel or successful creation through the Togglable component's ref. Notifications last five seconds. Requests handle server errors, and failed creation retains the input. Likes reorder blogs in descending order while retaining populated creator details. Removal confirmation uses accessible inline controls instead of a blocking native browser dialog. Blog URL links accept only HTTP(S) protocols.

## Exercise review

- 5.1–5.4: login, persistent session/logout, authenticated creation, success/error notifications.
- 5.5–5.7: togglable form with ref, separate form/input state, expandable blog details.
- 5.8–5.11: persisted likes, retained creator information, sorted list, creator-only deletion control with confirmation.
- 5.12: ESLint configuration and passing lint check.
- 5.13–5.16: component tests cover initial title/author with URL/likes hidden, revealed details, two like handler calls, and form submission payload.
- 5.17–5.23: separate Playwright project covers initial login form, successful/failed login, create, like, creator delete, other-user controls, and like ordering. An additional test verifies session persistence and logout after reload.

The implementation uses the Part4 backend's likes-only update endpoint, sending the complete blog fields for course compatibility; the backend preserves stored content and ownership. Backend user→blogs virtual population avoids stale duplicate references. The final application state incorporates later requirements.

## Verification

Frontend build and ESLint pass. Seven Vitest/Testing Library component tests pass. Live browser verification against the actual local backend/MongoDB passed invalid and valid login, hidden then auto-closing creation form, persisted blog and two likes in a new page, creator name after liking, descending ordering, hidden remove controls for a second user, and cancelled/confirmed deletion.

The GitHub Actions workflow `Blog List tests` installs all three projects, runs backend lint/23 tests, frontend lint/7 tests/build, then the nine Chromium end-to-end tests. Playwright starts dedicated servers on5186 and3006 with a fresh temporary MongoDB and random signing secret. Reset is registered only in that loopback-only test launcher and is absent from the normal application. No Atlas secret or production database is used. CI execution is pending; a passing result is not yet claimed.

To run the suite yourself: install dependencies in backend, frontend, and `bloglist-e2e`; in the E2E directory run `npx playwright install chromium` then `npm test`. The suite starts and stops its isolated servers automatically, with one worker to avoid shared reset races. Reports/traces are generated for diagnosis and excluded from git.

Official material: https://fullstackopen.com/en/part5/
