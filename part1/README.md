# Part 1 — React applications

AI-assisted implementations prepared with Codex. Review the source and behavior before reporting the exercises as completed. The applications use local React state and intentionally reset on page refresh.

## Applications

- `courseinfo`: final state for 1.1–1.5, using Header, Content, Part, and Total components; the course object and its parts live in App.
- `unicafe`: final state for 1.6–1.11, with three feedback counters, conditional statistics, average, positive percentage, and table rows.
- `anecdotes`: final state for 1.12–1.14, with random selection, independent vote counts updated immutably, and the most-voted entry. The anecdote texts are original study examples. Ties choose the first entry; random selection may repeat the current entry.

## Run an application

In the corresponding directory, run `npm ci`, then `npm run dev`. Use `npm run build` to build it and `npm run lint` to check the source.

## Review checklist

- Explain how props move the course data between components.
- Explain why zero feedback is handled before division.
- Explain why the votes array is copied before updating it.
- Try feedback sequences containing only bad votes, only neutral votes, and mixed votes.
- Vote for different anecdotes and check that their counts stay independent.

Submitted successfully on 21 October 2026: all 14 exercises and two hours supplied by the learner. AI assistance is disclosed in the submission comment.

Sources:
- https://fullstackopen.com/en/part1/introduction_to_react/
- https://fullstackopen.com/en/part1/java_script/
- https://fullstackopen.com/en/part1/a_more_complex_state_debugging_react_apps/

## Verification — 21 October 2026

- All three applications: `npm run lint` and `npm run build` passed.
- Courseinfo browser: all three parts rendered and total exercises = 31.
- Unicafe browser: initial state shows no feedback; one bad vote gives average -1 and 0% positive; 2 good + 1 neutral + 1 bad gives total 4, average 0.25 and 50% positive.
- Anecdotes browser: the first entry retained 2 votes after switching to a different entry with 0 votes; voting the second entry to 3 changed the most-voted entry correctly.
- Vite browser logs showed connection messages with no application errors during these checks.
