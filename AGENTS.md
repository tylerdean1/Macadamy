# AI Contribution Guidelines for Codex

These guidelines merge repository instructions and AI contribution expectations to help agents work effectively:

- Run `npm test` and fix any failures before committing.
- Follow the established code style and adhere to ESLint rules from `eslint.config.js`.
- Use clear, descriptive commit messages.
- Document new components in `README.md` and update documentation or comments when behavior changes.
- Consult `src/lib/database.types.ts` for backend types and definitions before making changes.
- Ensure all data access uses RPC functions—avoid direct table calls.
- Maintain strict type safety in accordance with `database.types.ts`.
- Add comments to code explaining the purpose of major code blocks and reasoning where appropriate.
- Network access to external resources is already granted in the environment settings.
