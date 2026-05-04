const fs = require('fs');
const content = fs.readFileSync('src/lib/body-segmentation.js', 'utf8');
const lines = content.split('\n');
const line17 = lines[16];
console.log('Length:', line17.length);
console.log('Near 489:', line17.substring(450, 550));
console.log('Char at 489:', line17[489-1]);
