
## Refactor the code under test

Simplify the solution while ensuring all tests continue to pass.

Rules:
- Solve the core 80% only
- Prefer standard library and idiomatic patterns
- No speculative abstractions
- No premature optimization
- No comments
- Reuse existing code where possible
- Merge duplicate procedures
- Merge duplicate functions
- Merge duplicate constants
- Merge duplicate definitions
- Merge duplicate variables 
- Merge duplicate sources of truth
- Extract React business logic into library TS files
- Extract React UI code into UI component TSX files
- Extract React hooks into hook TS files
- Maximize extracted code into business logic of library TS files
- Minimize extracted code of React UI code into UI component TSX files
- Minimize extracted code of React hooks code into hook TS files
- No refactors outside the scope of the code under test
- All pre-push tests pass
- Limit output to "refactor: " followed by 1 to 50 characters that summarize status.