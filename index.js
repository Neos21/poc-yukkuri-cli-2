const childProcess = require('node:child_process');
const path         = require('node:path');
const util         = require('node:util');
const execFileAsync = util.promisify(childProcess.execFile);

/** @type {string} MeCab の実行ファイルのフルパス */
const meCabPath = 'C:/Program Files/MeCab/bin/mecab.exe';
/** @type {string} MeCab が使用する辞書のディレクトリへのフルパス */
const dicPath   = 'C:/Program Files/MeCab/dic/unidic-csj-3.1.1/';


/** @type {Object} 半角カタカナをキー、全角カタカナを値とした連想配列 */
const katakanaMap = {
  'ｶﾞ': 'ガ',  'ｷﾞ': 'ギ',  'ｸﾞ': 'グ',  'ｹﾞ': 'ゲ',  'ｺﾞ': 'ゴ',  // 全角・半角を先に行う
  'ｻﾞ': 'ザ',  'ｼﾞ': 'ジ',  'ｽﾞ': 'ズ',  'ｾﾞ': 'ゼ',  'ｿﾞ': 'ゾ',
  'ﾀﾞ': 'ダ',  'ﾁﾞ': 'ヂ',  'ﾂﾞ': 'ヅ',  'ﾃﾞ': 'デ',  'ﾄﾞ': 'ド',
  'ﾊﾞ': 'バ',  'ﾋﾞ': 'ビ',  'ﾌﾞ': 'ブ',  'ﾍﾞ': 'ベ',  'ﾎﾞ': 'ボ',
  'ﾊﾟ': 'パ',  'ﾋﾟ': 'ピ',  'ﾌﾟ': 'プ',  'ﾍﾟ': 'ペ',  'ﾎﾟ': 'ポ',
  'ｳﾞ': 'ヴ',  'ﾜﾞ': 'ヷ',  'ｦﾞ': 'ヺ',
  'ｱ' : 'ア',  'ｲ' : 'イ',  'ｳ' : 'ウ',  'ｴ' : 'エ',  'ｵ' : 'オ',
  'ｶ' : 'カ',  'ｷ' : 'キ',  'ｸ' : 'ク',  'ｹ' : 'ケ',  'ｺ' : 'コ',
  'ｻ' : 'サ',  'ｼ' : 'シ',  'ｽ' : 'ス',  'ｾ' : 'セ',  'ｿ' : 'ソ',
  'ﾀ' : 'タ',  'ﾁ' : 'チ',  'ﾂ' : 'ツ',  'ﾃ' : 'テ',  'ﾄ' : 'ト',
  'ﾅ' : 'ナ',  'ﾆ' : 'ニ',  'ﾇ' : 'ヌ',  'ﾈ' : 'ネ',  'ﾉ' : 'ノ',
  'ﾊ' : 'ハ',  'ﾋ' : 'ヒ',  'ﾌ' : 'フ',  'ﾍ' : 'ヘ',  'ﾎ' : 'ホ',
  'ﾏ' : 'マ',  'ﾐ' : 'ミ',  'ﾑ' : 'ム',  'ﾒ' : 'メ',  'ﾓ' : 'モ',
  'ﾔ' : 'ヤ',  'ﾕ' : 'ユ',  'ﾖ' : 'ヨ',
  'ﾗ' : 'ラ',  'ﾘ' : 'リ',  'ﾙ' : 'ル',  'ﾚ' : 'レ',  'ﾛ' : 'ロ',
  'ﾜ' : 'ワ',  'ｦ' : 'ヲ',  'ﾝ' : 'ン',
  'ｧ' : 'ァ',  'ｨ' : 'ィ',  'ｩ' : 'ゥ',  'ｪ' : 'ェ',  'ｫ' : 'ォ',
  'ｯ' : 'ッ',  'ｬ' : 'ャ',  'ｭ' : 'ュ',  'ｮ' : 'ョ',  '･' : '・',
  '｡' : '。',  '､' : '、',  'ｰ' : 'ー',  '｢' : '「',  '｣' : '」'
};
/** @type {RegExp} 半角カタカナを特定する正規表現 */
const hankakuKatakanaRegExp = new RegExp(`(${Object.keys(katakanaMap).join('|')})`, 'g');
/**
 * 半角カタカナを全角カタカナに変換する
 * 
 * @param {string} text 文字列
 * @return {string} 半角カタカナを全角カタカナに変換した文字列
 */
const hankakuKatakanaToZenkakuKatakana = text => text.replace(hankakuKatakanaRegExp, match => katakanaMap[match]).replace((/ﾞ/g), '゛').replace((/ﾟ/g), '゜');

/**
 * MeCab を呼び出す
 * 
 * @param {string} inputText MeCab に解析させたい文字列
 * @return {Promise<string>} MeCab の解析結果
 * @throws MeCab の呼び出しに失敗した場合
 */
const callMeCab = inputText => new Promise(resolve => {
  const childMecab = childProcess.spawn(meCabPath, ['-d', dicPath]);
  childMecab.stdin.setEncoding('utf-8');
  // 標準出力を取得して返す
  let stdout = '';
  childMecab.stdout.on('data', (chunk) => { stdout += chunk; });
  childMecab.stdout.on('end' , (     ) => { resolve(stdout); });
  // 標準入力にテキストを挿入する
  childMecab.stdin.write(inputText);
  childMecab.stdin.end();
});

/** @type {Array<string>} MeCab の解析結果のカラム定義 */
const meCabColumns = [
  // 属性ラベル : No : 属性名           : 階層   : 説明
  'word'    ,  //  0 : 元の単語 (独自)  : -      : -
  'pos1'    ,  //  1 : 品詞大分類       : 語形   : -
  'pos2'    ,  //  2 : 品詞中分類       : 語形   : -
  'pos3'    ,  //  3 : 品詞小分類       : 語形   : -
  'pos4'    ,  //  4 : 品詞細分類       : 語形   : -
  'cType'   ,  //  5 : 活用型           : 語形   : -
  'cForm'   ,  //  6 : 活用形           : 語形   : -
  'lForm'   ,  //  7 : 語彙素読み       : 語彙素 : lemma のカタカナ表記
  'lemma'   ,  //  8 : 語彙素表記       : 語彙素 : 語彙素見出し
  'orth'    ,  //  9 : 書字形出現形     : 書字形 : orthBase が活用変化を受けたもの
  'pron'    ,  // 10 : 発音形出現形     : 発音形 : pronBase が活用変化を受けたもの
  'orthBase',  // 11 : 書字形基本形     : 書字形 : 書字形見出し
  'pronBase',  // 12 : 発音形基本形     : 発音形 : 発音形見出し (カタカナ表記)
  'goshu'   ,  // 13 : 語種             : 語彙素 : -
  'iType'   ,  // 14 : 語頭変化型       : 語形   : -
  'iForm'   ,  // 15 : 語頭変化形       : 語形   : -
  'fType'   ,  // 16 : 語末変化型       : 語形   : -
  'fForm'   ,  // 17 : 語末変化形       : 語形   : -
  'iConType',  // 18 : 語頭変化結合形   : 語形   : -
  'fConType',  // 19 : 語末変化結合形   : 語形   : -
  'type'    ,  // 20 : 語彙素類         : 語彙素 : -
  'kana'    ,  // 21 : 仮名形出現形     : 書字形 : orth のカタカナ表記
  'kanaBase',  // 22 : 仮名形基本形     : 書字形 : orthBase のカタカナ表記
  'form'    ,  // 23 : 語形             : 語形   : formBase が活用変化を受けたもの
  'formBase',  // 24 : 語形基本形       : 語形   : 語形見出し (カタカナ表記)
  'aType'   ,  // 25 : アクセント型     : 発音形 : アクセント核の位置
  'aConType',  // 26 : アクセント結合型 : 発音形 : -
  'aModType',  // 27 : アクセント修飾型 : 発音形 : -
  'lid'     ,  // 28 : 語彙表 ID        : -      : -
  'lemmaId'    // 29 : 語彙素 ID        : 語彙素 : -
];
/**
 * @typedef {Object} MeCabResult パースした MeCab の解析結果の1項目をまとめる連想配列
 * @property {string} word      0 : 元の単語 (独自)  : -      : -
 * @property {string} pos1      1 : 品詞大分類       : 語形   : -
 * @property {string} pos2      2 : 品詞中分類       : 語形   : -
 * @property {string} pos3      3 : 品詞小分類       : 語形   : -
 * @property {string} pos4      4 : 品詞細分類       : 語形   : -
 * @property {string} cType     5 : 活用型           : 語形   : -
 * @property {string} cForm     6 : 活用形           : 語形   : -
 * @property {string} lForm     7 : 語彙素読み       : 語彙素 : lemma のカタカナ表記
 * @property {string} lemma     8 : 語彙素表記       : 語彙素 : 語彙素見出し
 * @property {string} orth      9 : 書字形出現形     : 書字形 : orthBase が活用変化を受けたもの
 * @property {string} pron     10 : 発音形出現形     : 発音形 : pronBase が活用変化を受けたもの
 * @property {string} orthBase 11 : 書字形基本形     : 書字形 : 書字形見出し
 * @property {string} pronBase 12 : 発音形基本形     : 発音形 : 発音形見出し (カタカナ表記)
 * @property {string} goshu    13 : 語種             : 語彙素 : -
 * @property {string} iType    14 : 語頭変化型       : 語形   : -
 * @property {string} iForm    15 : 語頭変化形       : 語形   : -
 * @property {string} fType    16 : 語末変化型       : 語形   : -
 * @property {string} fForm    17 : 語末変化形       : 語形   : -
 * @property {string} iConType 18 : 語頭変化結合形   : 語形   : -
 * @property {string} fConType 19 : 語末変化結合形   : 語形   : -
 * @property {string} type     20 : 語彙素類         : 語彙素 : -
 * @property {string} kana     21 : 仮名形出現形     : 書字形 : orth のカタカナ表記
 * @property {string} kanaBase 22 : 仮名形基本形     : 書字形 : orthBase のカタカナ表記
 * @property {string} form     23 : 語形             : 語形   : formBase が活用変化を受けたもの
 * @property {string} formBase 24 : 語形基本形       : 語形   : 語形見出し (カタカナ表記)
 * @property {string} aType    25 : アクセント型     : 発音形 : アクセント核の位置
 * @property {string} aConType 26 : アクセント結合型 : 発音形 : -
 * @property {string} aModType 27 : アクセント修飾型 : 発音形 : -
 * @property {string} lid      28 : 語彙表 ID        : -      : -
 * @property {string} lemmaId  29 : 語彙素 ID        : 語彙素 : -
 */

/**
 * MeCab の解析結果を二次元配列に変換する
 * 
 * @param {string} rawMeCabResult MeCab の解析結果
 * @return {Array<Array<string>>} 二次元配列に変換した MeCab の解析結果
 */
const splitToArray = rawMeCabResult => {
  const lines = rawMeCabResult.replace((/\r\n/g), '\n').trim().split('\n');
  lines.pop();  // 末尾の `EOS` の行を消す
  return lines.map(line => {
    const [word, rawValues] = line.split('\t');
    const values = rawValues.split(',').map(value => value.replace((/"/g), ''));  // ダブルクォートを除去する
    return [word, ...values];
  });
};

/**
 * 二次元配列に変換された MeCab の解析結果をオブジェクトの配列に変換する
 * 
 * @param {Array<Array<string>>} splittedMeCabResult 二次元配列に変換された MeCab の解析結果
 * @return {Array<{MeCabResult}>} オブジェクトの配列に変換した MeCab の解析結果
 */
const parseMeCabResult = splittedMeCabResult => splittedMeCabResult.map(line => line.reduce((parsed, columnValue, index) => {
  const keyName = meCabColumns[index] ?? String(index);  // 万が一、解析結果のカラム数の方が多かった場合は添字を直接キーにする
  parsed[keyName] = columnValue;
  return parsed;
}, {}));

/**
 * 全角カタカナをひらがなに変換する
 * 
 * @param {string} text 文字列
 * @return {string} 全角カタカナ部分がひらがなに変換された文字列
 */
const katakanaToHiragana = text => text.replace((/[\u30a1-\u30f6]/g), match => String.fromCharCode(match.charCodeAt(0) - 0x60));

/**
 * AquesTalk 向けに入力文字列をパースする
 * 
 * @param {MeCabResult} meCabResult パースした MeCab の解析結果
 * @return {string} AquesTalk 向けの文字列
 */
const parseForAtk = meCabResult => {
  const rawText = meCabResult.map(columns => {
    if(columns.goshu === '記号') {
      if(columns.orth === '！') return '、。';  // アクセント記号 : ビックリマーク
      if(['、', '「', '」', '『', '』'].includes(columns.orth)) return ',';  // アクセント記号 : 読点、カギカッコ (独自)
      if(['。', '？', ',', ';', '/', '+'].includes(columns.orth)) return columns.orth;  // その他アクセント記号はそのまま受け入れる
      return '';  // 定義されていない記号は除去する
    }
    
    if(columns.kana != null && columns.kana !== '') return columns.kana;  // カタカナ表記があればそれを返す
    if(columns.kana != null && columns.orth !== '') return columns.orth;  // カタカナ表記がなければ読み方を返す
    return columns.word;  // 他に返せるモノがなかったら元の文字列を返す
  }).join('');
  const hiraganaText = katakanaToHiragana(rawText);
  console.log(0, meCabResult);
  console.log(1, rawText);
  console.log(2, hiraganaText);
  return hiraganaText;
};


(async () => {
  const rawInputText = process.argv[2] ?? 'こんにちは';
  // MeCab は半角カタカナ・半角句読点の辞書が弱いようなので、先に全角カタカナに変換しておく
  const inputText = hankakuKatakanaToZenkakuKatakana(rawInputText);
  // TODO : 他の半角記号の対応 `!?`
  
  const rawMeCabResult = await callMeCab(inputText);
  const splittedMeCabResult = splitToArray(rawMeCabResult);
  const meCabResult = parseMeCabResult(splittedMeCabResult);
  const textToSpeech = parseForAtk(meCabResult);
  
  // 発話させる文字列
  console.log(textToSpeech);
  // 発話する
  const { stdout, stderr } = await execFileAsync(path.resolve(__dirname, './atk1.exe'), ['f1', textToSpeech]);
  if(stdout !== '' || stderr !== '') return console.error('発話に失敗');
  
  console.log('終わり');
})();
