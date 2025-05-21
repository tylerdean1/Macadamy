import { exec } from 'child_process';
import { glob } from 'glob';

console.log('Current working directory:', process.cwd());

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

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function openFilesWithDelay(files, delayMs = 300) {
  for (const file of files) {
    console.log('Opening:', file);
    exec(`start "" "${file}"`);
    await delay(delayMs);
  }
}

if (files.length === 0) {
  console.log('No files found.');
} else {
  console.log('Files that would be opened:', files);
  // Ask for confirmation before opening
  process.stdout.write('Open these files? (y/n): ');
  process.stdin.setEncoding('utf8');
  process.stdin.once('data', async (input) => {
    if (input.trim().toLowerCase() === 'y') {
      await openFilesWithDelay(files, 300); // 300ms delay between each open
    } else {
      console.log('Aborted.');
    }
    process.stdin.pause();
  });
}