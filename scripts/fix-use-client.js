const fs = require('fs');
function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = dir + '/' + file;
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      if (!file.includes('node_modules') && !file.includes('.next')) {
        results = results.concat(walk(file));
      }
    } else { 
      if (file.endsWith('.ts') || file.endsWith('.tsx')) results.push(file);
    }
  });
  return results;
}
const files = walk('./src');
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (content.startsWith('import { format } from "date-fns";\n"use client";')) {
    content = content.replace('import { format } from "date-fns";\n"use client";', '"use client";\nimport { format } from "date-fns";');
    fs.writeFileSync(file, content);
    console.log('Fixed use client order in', file);
  }
});
