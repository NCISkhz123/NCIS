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
  if (content.includes('new Date().toISOString().slice(0, 10)')) {
    content = content.replace(/new Date\(\)\.toISOString\(\)\.slice\(0, 10\)/g, "format(new Date(), 'yyyy-MM-dd')");
    if (!content.includes('import { format }')) {
      content = 'import { format } from "date-fns";\n' + content;
    }
    fs.writeFileSync(file, content);
    console.log('Fixed', file);
  }
});
