// UTF-8 の LF でコーディングしたファイル

const childProcess = require('node:child_process');
const path         = require('node:path');

console.log('この JS ファイルは UTF-8・LF だよ！');

console.log('C# Shift-JIS -----');
console.log(childProcess.execFileSync(path.resolve(__dirname, '../2-cs-echo/shift-jis.exe'), ['ほげ']).toString());
console.log('C# Shift-JIS =====');

console.log('C# UTF-8 -----');
console.log(childProcess.execFileSync(path.resolve(__dirname, '../2-cs-echo/utf-8.exe'), ['テスト']).toString());
console.log('C# UTF-8 =====');

console.log('終わり');
