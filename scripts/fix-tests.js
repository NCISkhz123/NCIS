const fs = require('fs');

function replaceFile(path) {
  if (!fs.existsSync(path)) return;
  let content = fs.readFileSync(path, 'utf8');
  content = content.replace(/CONSUMABLE_INTERNAL/g, 'CONSUMABLE');
  content = content.replace(/CONSUMABLE_DISTRIBUTION/g, 'CONSUMABLE');
  content = content.replace(/hospitalUnitName:/g, 'hospitalUnitId: "unit-1", hospitalUnitName:');
  fs.writeFileSync(path, content, 'utf8');
}

replaceFile('tests/unit/components/cssd/remaining-transaction-pages.test.tsx');
replaceFile('tests/unit/components/cssd/transaction-pages.test.tsx');
replaceFile('tests/unit/lib/cssd/codegen/item-code.test.ts');
