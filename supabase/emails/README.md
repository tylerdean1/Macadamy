# Supabase Email Template Mapping (Macadamy)

Use this folder as the source of truth for Supabase Auth email templates.

## How to apply
1. Open Supabase Dashboard → Authentication → Email.
2. Click a template row (for example, **Confirm sign up**).
3. Copy the full HTML from the mapped file below.
4. Paste into the template editor and save.
5. Repeat for all templates.

## Template → File mapping
- **Confirm sign up** → [confirm-sign-up.html](./confirm-sign-up.html)
- **Invite user** → [invite-user.html](./invite-user.html)
- **Magic link** → [magic-link.html](./magic-link.html)
- **Change email address** → [change-email-address.html](./change-email-address.html)
- **Reset password** → [reset-password.html](./reset-password.html)
- **Reauthentication** → [reauthentication.html](./reauthentication.html)

## Notes
- These templates are table-based with inline styles for email-client compatibility.
- Keep Supabase variables (like `{{ .ConfirmationURL }}` and `{{ .SiteURL }}`) unchanged.
- After updating templates, send test emails from Supabase to verify rendering and links.
