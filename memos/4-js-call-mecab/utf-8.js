// https://github.com/syuilo/ai/blob/4af8ba0d5dd25dfaa004ad42df6314646aa12d53/src/modules/keyword/mecab.ts
// https://stackoverflow.com/questions/13230370/nodejs-child-process-write-to-stdin-from-an-already-initialised-process

const childProcess = require('node:child_process');

const callMecab = (inputText, dicName) => new Promise(resolve => {
  const childMecab = childProcess.spawn('C:/Program Files/MeCab/bin/mecab.exe', ['-d', `C:/Program Files/MeCab/dic/${dicName}`]);
  childMecab.stdin.setEncoding('utf-8');
  //childMecab.stdout.pipe(process.stdout);  // ターミナルにリアルタイムに表示する
  
  let stdout = '';
  childMecab.stdout.on('data', (chunk) => { stdout += chunk; });
  childMecab.stdout.on('end' , (     ) => { resolve(stdout); });
  
  childMecab.stdin.write(inputText);
  childMecab.stdin.end();
});

(async () => {
  console.log('この JS ファイルは UTF-8・LF だよ！');
  console.log(await callMecab('ほーりほり！', 'ipadic'));  // Mecab デフォルトの IPADic
  console.log(await callMecab('ほーりほり！', 'unidic-csj-3.1.1'));  // 話し言葉
  console.log(await callMecab('ほーりほり！', 'unidic-cwj-3.1.1'));  // 書き言葉
  console.log(await callMecab('ほーりほり！', 'unidic-ymm'));        // YMM の UniDic
  console.log('終わり');
})();

// - C# は Shift-JIS・UTF-8 のエンコーディングは関係ないっぽい (コンパイルしちゃうから)
//   - どちらでも GitBash で文字化けしない
// - Node.js に関して、GitBash、PowerShell ともに
//   - UTF-8 エンコーディングの JS が正常に表示される・exe への引数も正しく渡せる
//   - Shift-JIS エンコーディングの JS は文字化けする
// - VSCode のターミナルから JS を実行すると C# 呼び出しが文字化けする (JS・C# の組み合わせ関係なく全部文字化けする)
