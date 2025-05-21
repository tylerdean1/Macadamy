const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const cmd = 'npx supabase gen types typescript --project-id koaxmrtrzhilnzjbiybr --schema public';
try {
    const output = execSync(cmd, { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'inherit'] });
    fs.writeFileSync(path.join(__dirname, '../src/lib/database.types.ts'), output);
    console.log('Types generated successfully!');
} catch (err) {
    console.error('Failed to generate types:', err);
    process.exit(1);
}
