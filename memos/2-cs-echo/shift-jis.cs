// �R���p�C�� : `C:\Windows\Microsoft.NET\Framework\v4.0.30319\csc.exe /nologo /platform:x86 .\shift-jis.cs`
using System;

public class UTF8BOM {
  public static void Main(string[] args) {
    Console.WriteLine("���� C# �t�@�C���� Shift-JIS�ECR+LF �ō쐬���Ă��܂�");
    if(args.Length == 0) {
      Console.WriteLine("�����Ȃ�");
    } else {
      Console.WriteLine("��1���� : {0}", args[0]);
    }
    Console.WriteLine("�I���");
  }
}
