// Shift-JIS の CR+LF でコーディングしたファイル

console.log('この JS ファイルは Shift-JIS・CR+LF でコーディングしています。');
console.log('引数 -----');
console.log(process.argv);
console.log('引数 =====');
console.log(process.argv[2] === 'hoge' ? 'Do you say "hoge"?'       : '????');
console.log(process.argv[2] === 'ほげ' ? '「ほげ」と言いましたね？' : '????');

console.log('終わり');
