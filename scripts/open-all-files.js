// open-all-files.ts
import { exec } from 'child_process';
import { glob } from 'glob';

// Only match .ts, .tsx, .css, .sql files
const patterns = [
  '**/*.ts',
  '**/*.tsx',
  '**/*.css',
  '**/*.sql'
];

const files = await glob(patterns, {
  nodir: true,
  ignore: ['node_modules/**', 'dist/**', 'supabase/**']
});

if (files.length === 0) {
  console.log('No files found.');
  process.exit(0);
}

console.log(`Found ${files.length} files:`);
files.forEach(f => console.log('  ' + f));

process.stdout.write('\nOpen these files in VS Code? (y/n): ');
process.stdin.setEncoding('utf8');
process.stdin.once('data', (input) => {
  if (input.trim().toLowerCase() === 'y') {
    // Wrap each path in quotes in case it contains spaces
    const fileArgs = files.map(f => `"${f}"`).join(' ');

    // Open all files in one VS Code instance
    exec(`code ${fileArgs}`, (error) => {
      if (error) {
        console.error('Error opening files in VS Code:', error);
      }
    });
  } else {
    console.log('Aborted.');
  }
  process.stdin.pause();
});
