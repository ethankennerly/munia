# Monte Carlo Test-First Exploration

## User Input

```text
$ARGUMENTS
```

## Steps

Proceed in strict order, strictly following these steps:
0. You **MUST** consider the user input before proceeding (if not empty).
1. Assume the code may be wrong.
2. Randomly generate multiple plausible hypotheses about possible code paths; balance exploration vs exploitation.
3. For each hypothesis, write a separate black-box candidate test.
4. Run each candidate test; discard any that pass with the bug or rely on implementation details.
5. Repeat steps 2–4 until you have 3–6 valid, mutually exclusive hypotheses with verified tests.
6. Output all valid candidate tests; do NOT attempt to fix the code.
7. If 3+ valid tests cannot be generated, explicitly state so.
8. No comments in test code or in output.
9. Only output user input prompt name followed by 1 to 50 characters that summarize status.