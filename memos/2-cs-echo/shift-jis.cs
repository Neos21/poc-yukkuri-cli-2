// コンパイル : `C:\Windows\Microsoft.NET\Framework\v4.0.30319\csc.exe /nologo /platform:x86 .\shift-jis.cs`
using System;

public class UTF8BOM {
  public static void Main(string[] args) {
    Console.WriteLine("この C# ファイルは Shift-JIS・CR+LF で作成しています");
    if(args.Length == 0) {
      Console.WriteLine("引数なし");
    } else {
      Console.WriteLine("第1引数 : {0}", args[0]);
    }
    Console.WriteLine("終わり");
  }
}
