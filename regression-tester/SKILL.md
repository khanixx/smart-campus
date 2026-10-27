---
name: regression-tester
description: Derive regression tests from acceptance criteria after a bug fix. Use when adding or reviewing Vitest tests for the Smart Campus room availability function.
---

# Regression Tester

## Procedure
1. List every acceptance criterion (AC1-AC6) and map each one to at least one test.
2. Use a fixed clock (inject `now`) - never call `new Date()` without arguments.
3. Create fresh fixtures in `beforeEach`; never share mutable data between tests.
4. Assert exact results (`'Available'` / `'Unavailable'`), not just truthiness.
5. Add boundary cases: equal start/end, exactly 120 min, 121 min, touching endpoints.
6. Assert non-mutation: deep-copy inputs before the call and compare after.
7. Run tests only if a terminal tool is available; otherwise say so.
8. Report unexecuted tests honestly - never claim "tests passed" without real output.

## Output
Table: AC | test ID | input | expected | executed? (yes/no)
