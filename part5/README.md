# Part 5 — Blog List frontend and tests

AI-assisted implementation prepared with Codex from the official requirements, for learner review. No model solution was used. Not submitted yet.

## Run and review

1. In `../part4/bloglist`, run `npm ci` and `npm run demo` for a loopback-only real temporary MongoDB database on port3005. Use its `requests/blogs.rest` to create a fictional demo user. Normal development can use a separately configured persistent Blog List database.
2. In `bloglist-frontend`, run `npm ci` and `npm run dev`. Open http://127.0.0.1:5185 . Vite proxies `/api` to port3005. Restart an older running demo after the Part5 authentication changes.
3. `/` shows the public list sorted by likes. Blog titles open `/blogs/:id`; visitors see details and creator information, authenticated readers can like, and only the creator sees removal controls. `/login` handles login; `/create` is protected and available through navigation when logged in. Creation, deletion, login and logout return to `/`.

Notifications last five seconds. Login persists across reload and is cleared on logout or token rejection. Failed creation retains its input. Blog links accept only HTTP(S) protocols. Likes require authentication in both frontend and backend, preserve creator information, and reorder the list. Removal uses accessible inline confirmation with a cancellation option.

Styled Components defines form surfaces, navigation, notifications and detail cards. Layout adapts to narrow screens; fields use labels, statuses/alerts expose notifications, and controls retain visible focus styles. Styling uses the existing neutral blue/white application palette.

## Exercise review

- 5.1–5.12: login, persistent session/logout, authenticated creation, notifications, separated form state, togglable form/ref, expandable details, likes, creator information, sorting, confirmed removal and ESLint. This earlier stage is retained in git history at `91056f4`; its build/lint, seven component tests and nine Chromium tests passed before the subsequent routing requirements changed the UI.
- 5.13–5.16: earlier component tests cover hidden/revealed details, two like handler calls and form payload. The current single-blog tests were then updated as required by5.27; form tests still verify the submitted payload and retained input after failure.
- 5.17–5.23: separate Playwright project tests login, create, like, creator deletion, other-user restrictions, sorting and session persistence. Its original nine-test version passed; the current suite follows the routed UI.
- 5.24–5.26: React Router navigation, public root list, separate login and parameterized blog page, authenticated likes, protected create route, and redirects after mutations/login/logout.
- 5.27: updated component tests check anonymous users see information without mutation buttons, authenticated noncreators see only like, and creators also see remove.
- 5.28: updated Playwright tests exercise routed login success/failure, create, like and delete. Extra coverage retains sorting and session persistence and checks anonymous API likes are rejected.
- 5.29–5.31: Styled Components styles forms, navigation/notifications and single-blog details. Screenshots of login, creation and detail views are captured by the visual review scenario.

Later routing requirements supersede the earlier default login screen, inline creation toggle and expandable list-item UI. Review those earlier exercise states in the commit above. The final application uses the updated requirements.

## Verification

Backend ESLint and23 API/helper tests pass. Frontend ESLint, production build and five Vitest/Testing Library component tests pass. The updated isolated Chromium suite passed all11 tests in17.3 seconds on21 October2026, including routed navigation/mutations, anonymous restrictions, sorted likes, persistent login/logout and screenshots of styled login/create/detail views. The three screenshots were visually reviewed with no clipping or overlapping content.

Playwright starts dedicated loopback servers on5186 and3006 with a fresh real temporary MongoDB database and random signing secret. Reset exists only in the isolated test launcher, never the normal app. One worker avoids reset races. No Atlas credentials or production data are used. The GitHub Actions workflow installs and verifies all three projects, but its hosted execution is blocked before the first step by a GitHub account billing lock; no billing settings were changed. Local Playwright execution was explicitly requested by the learner and provides the end-to-end verification.

To reproduce: install dependencies in backend, frontend and `bloglist-e2e`; in the E2E directory run `npx playwright install chromium` then `npm test`. Reports, traces and screenshots are generated for diagnosis and excluded from git.

Official material: https://fullstackopen.com/en/part5/
