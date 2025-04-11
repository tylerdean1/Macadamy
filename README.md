Macadamy.io Construction Project Tracker

Macadamy.io is a real-time construction progress tracking platform tailored for transportation infrastructure projects. It enables contractors and engineers to manage quantities, track daily progress, and ensure compliance with government contracts by organizing data by contract, WBS, map, and line code.


🔧 Key Features



📊 Line Code Calculators


Each pay item (line code) has a dedicated calculator template that tracks input, measurements, and progress. Templates are based on real-world DOT standards (e.g., NCDOT, SCDOT) and include:

LC 1 - Mobilization: Tracks lump sum progress

LC 2 - Borrow Excavation: Calculates truck loads with shrinkage

LC 3 - Incidental Stone Base: Measures by tons

LC 4 - Shoulder Reconstruction: Measures in shoulder miles

LC 5–7 - Milling Templates: Track milling areas in SY and CY with precision

LC 8 - Asphalt Paving: Includes spread rate, type, tack rate, and target tonnage

LC 14 - Patch Milling: Combines milling and asphalt patching logic

LC 15–16 - Curb Ramps: Tracked per EA (each), with station and side of road


🗺️ Hierarchical Data Structure


Progress and allocations are structured by:

Contract → WBS → Map → Line Code Calculations

Each map contains multiple line code calculations with allotted and completed totals


🧠 Smart Templates


Templates automatically calculate quantities like:

SY, CY, LF, EA, TON, GAL, etc.

Handles complex calculations such as asphalt tonnage based on depth and spread rate

Conditional logic for paint striping, patch statuses, and excavation loads


🧪 Real-Time Updates & Validation


Users enter field data from the frontend, which calculates totals in real-time

Backend validations ensure data integrity, including unit consistency and required fields


👥 Role-Based Permissions


Admins and engineers can create and manage formulas

Field users input measurements without affecting templates


🧰 Tech Stack


Frontend: React (TypeScript), Tailwind CSS

Backend: Supabase (PostgreSQL, Auth, Realtime)

Database: SQL-defined templates and structure with real-time triggers

Authentication: Supabase Auth with custom profile handling and avatars

Infrastructure: Vercel (frontend hosting), Supabase (DB and API)

Dev Tools: Docker (optional for local Supabase testing), Continue Extension for AI-enhanced development


📁 Project Structure


project-root/
├── src/
│   ├── components/      # UI components
│   ├── pages/           # Main app pages (ContractDashboard, Settings, etc.)
│   ├── types/           # Supabase TypeScript types (auto-generated)
├── supabase/            # (Removed if using remote-only mode)
├── .env.local           # Environment config
├── package.json


📌 Current Status


✅ Fully integrated with remote Supabase project: koaxmrtrzhilnzjbiybr

✅ Supabase types generated to src/types/supabase.ts

✅ Docker removed (project uses remote Supabase only)

✅ Line code templates finalized for LC 1 through LC 16

✅ User profile and auth flow implemented

🗑️ Docker Removal

Docker was originally used to run Supabase locally but was removed to simplify the setup. All data now runs against the remote Supabase backend.

To reflect this change:

The /supabase folder was deleted

supabase start / supabase stop are no longer required


🚀 Getting Started


# 1. Install dependencies
npm install

# 2. Run the dev server
npm run dev

# 3. Generate types (optional)
supabase gen types typescript > src/types/supabase.ts


📢 Contribution Notes


Line codes are modular and defined via SQL inserts

Each calculator can be filtered by map, WBS, or contract

Every update recalculates progress totals per map


🧼 Dev Tips


Be sure your Supabase CLI is up-to-date

Keep your supabase.ts types file synced using the command above

When debugging Supabase, try supabase link again if your project changes