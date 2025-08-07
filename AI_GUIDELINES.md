# AI Contribution Guidelines

These guidelines help AI agents work effectively in this repository:

- Run `npm test` and fix any failures before committing.
- Follow the established code style and adhere to ESLint rules.
- Use clear, descriptive commit messages.
- Update documentation or comments when behavior changes.
- Consult `src/lib/database.types.ts` for backend types and definitions before making changes.
- Ensure all data access uses RPC functions—avoid direct table calls.
- Maintain strict type safety in accordance with `database.types.ts`.
- Add comments to code explaining the purpose of major code blocks and reasoning where appropriate.
