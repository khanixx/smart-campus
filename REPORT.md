# AI-Driven Software Engineering Practice #09 — Kamaliyev Abylaikhan, 24B031831

- **Class:** Tuesday, 16:00–19:00
- **AI tool:** Claude (claude.ai), model Claude Opus 5.5 (`claude-opus-5-5`)
- **Stack:** JavaScript (ES modules), Vitest 2, Git
- **Project link (live demo):** https://claude.ai/artifact/RbcWdMeWro3TYNu7xMWqhM (share it from the page's Share menu so the instructor can open it)

## 1. Baseline (Task #01)

- Baseline commit: `4c7486d` (tag `baseline`); clean copy kept in `evidence/clean-copy-original-src/`.
- Real output: `evidence/01-baseline-test-output.txt` → **4 failed | 7 passed (11)**.

### Defect log

| Test ID | Input (fixed clock 09:00, bookings B1 10:00–11:00, B2 14:00–15:00) | Expected | Actual | Suspected cause |
|---|---|---|---|---|
| TC04 | 11:00–13:00 (120 min) | Available | Unavailable | Starts exactly at B1 end → BUG-A, not the duration check |
| TC08 | 11:00–12:00 | Available | Unavailable | BUG-A: `<=` in `overlaps()` treats touching endpoints as conflict |
| TC09 | 13:00–14:00 | Available | Unavailable | BUG-A: same line, other endpoint |
| TC11 | 16:00–17:00, then compare `bookings` to a deep copy | Array unchanged `[B2, B1]` | Reordered `[B1, B2]` | BUG-B: `bookings.sort()` sorts the caller's array in place |

## 2. Skill (Tasks #02–#03)

```
bug-detector.zip
└── bug-detector/
    ├── SKILL.md
    └── agents/
        └── openai.yaml   (for ChatGPT)
```

Validated: plain UTF-8/ASCII, named `SKILL.md` (not `.txt`), YAML delimiters are exactly `---`, name is lowercase-hyphen, description says *when* to use it, no secrets.
Optional second skill: `regression-tester.zip` (same structure, no `agents/`).

## 3. Without vs with skill (Tasks #04–#05)

Same input in both chats: `src/availability.js`, the AC list, and the TC08 failure from `evidence/01-baseline-test-output.txt`.

- **Baseline prompt (fresh chat, skill off):** "Find the root cause of the failed room-booking test. Propose minimal patch and regression test. Do not edit code."
- **Skill prompt (fresh chat, skill on):** "Use the bug-detector skill to diagnose the failed room-booking test."

| Criterion | No skill | With skill |
|---|---|---|
| Correct root cause | | |
| Reproducible test | | |
| Minimal proposed patch | | |
| Unsupported claims | | |
| Clarity of explanation | | |

## 4. Repair and regression (Task #06)

One minimal change per bug, test run after each:

| Commit | Change | Result |
|---|---|---|
| `1d19bed` | FIX-A: `<=` → `<` in `overlaps()` | 1 failed / 10 passed (`evidence/02-after-fix-A.txt`) |
| `8af4066` | FIX-B: sort a copy `[...bookings]` | **11 passed / 11** (`evidence/03-final-test-output.txt`) |

Diff: `evidence/code.diff` (2 lines changed). Command: `npx vitest run`.

## 5. Conclusion

_Edit after filling the table in section 3._ The skill made the AI answer follow a fixed structure (defect | evidence | root cause | fix | test) and keep confirmed defects apart from guesses, but it did not find anything the plain prompt missed — both depend on the same code and failing test. The tests prove that touching bookings (11:00 after a 10:00–11:00 booking) are now allowed while real overlaps are still rejected, and that `checkAvailability` no longer reorders the caller's bookings array. They do not prove correctness for multiple rooms, time zones other than the fixed one, or UI behaviour on mobile (AC6 was checked by hand only). One limitation of AI-assisted debugging: the AI only sees what I paste, so it can claim a fix works without running anything — only real terminal output counts as evidence.
