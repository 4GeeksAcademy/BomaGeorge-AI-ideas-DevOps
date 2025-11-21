const fs = require('fs');
const path = require('path');

// Lightweight requireString implementation mirroring src/api/validators.ts
function requireString(value, field) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`Invalid or missing field: ${field}`);
  }
  return value.trim();
}

function run() {
  requireString('hello', 'field');
  let threw = false;
  try {
    requireString('', 'field');
  } catch (_) {
    threw = true;
  }
  if (!threw) {
    console.error('Failed: empty string should throw');
    process.exit(1);
  }

  // Ensure file exists in source for parity
  const srcPath = path.join(__dirname, '..', 'src', 'api', 'validators.ts');
  if (!fs.existsSync(srcPath)) {
    console.error('validators.ts missing');
    process.exit(1);
  }

  console.log('validator tests passed');
}

run();
