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
| Correct root cause | Yes: both bugs (`<=` in `overlaps()`, in-place `sort`); explained TC04 as BUG-A | Yes: same two bugs; reproduced all 4 failures on a scratch copy first |
| Reproducible test | Yes: 6 tests (R1–R6), local-time helper, frozen array for BUG-B | Yes: 3 tests (REG-A, REG-A2, REG-B) with explicit UTC dates, independent of machine time zone |
| Minimal proposed patch | Mostly: fixed `<=`, but also rewrote the loop to `.some()` (more than needed) | Yes: one line per bug; offered `[...bookings].sort()` as an alternative to deleting the sort |
| Unsupported claims | One assumption (fixture times), stated openly | None: TC04 cause explicitly marked as *hypothesis* because the test file was not attached |
| Clarity of explanation | Clear, but free-form layout | Clear, fixed structure: defect, evidence, root cause, fix, test, expected result; also flagged the AC1 edge case `start == now` |

Screenshots: `evidence/screenshots/04-no-skill-*.png` (no skill), `06-with-skill.png` (with skill), `03-skill-installed.png` (activation).

## 4. Repair and regression (Task #06)

One minimal change per bug, test run after each:

| Commit | Change | Result |
|---|---|---|
| `1d19bed` | FIX-A: `<=` → `<` in `overlaps()` | 1 failed / 10 passed (`evidence/02-after-fix-A.txt`) |
| `8af4066` | FIX-B: sort a copy `[...bookings]` | **11 passed / 11** (`evidence/03-final-test-output.txt`) |

Diff: `evidence/code.diff` (2 lines changed). Command: `npx vitest run`.

## 5. Conclusion

Both answers found the same two root causes, so the skill did not make the AI smarter. What it changed was discipline: the answer followed the defect | evidence | root cause | fix | test structure, kept the patch to one line per bug, and marked the TC04 explanation as a hypothesis instead of stating it as fact. The tests prove that touching bookings (11:00 after a 10:00–11:00 booking) are now allowed while real overlaps are still rejected, and that `checkAvailability` no longer reorders the caller's bookings array. They do not prove correctness for multiple rooms, time zones other than the fixed one, or UI behaviour on mobile (AC6 was checked by hand only). One limitation of AI-assisted debugging: the AI only sees what I paste, so it can claim a fix works without running anything — only real terminal output counts as evidence.
