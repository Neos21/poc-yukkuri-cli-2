// Shift-JIS �� CR+LF �ŃR�[�f�B���O�����t�@�C��

const childProcess = require('node:child_process');
const path         = require('node:path');

console.log('���� JS �t�@�C���� Shift-JIS�ECR+LF ����I');

console.log('C# Shift-JIS -----');
console.log(childProcess.execFileSync(path.resolve(__dirname, '../2-cs-echo/shift-jis.exe'), ['�e�X�g']).toString());
console.log('C# Shift-JIS =====');

console.log('C# UTF-8 -----');
console.log(childProcess.execFileSync(path.resolve(__dirname, '../2-cs-echo/utf-8.exe'), ['�e�X�g']).toString());
console.log('C# UTF-8 =====');

console.log('�I���');
