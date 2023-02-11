// コンパイル : `C:\Windows\Microsoft.NET\Framework\v4.0.30319\csc.exe /nologo /platform:x86 .\atk1.cs`
using System;                          // Console
using System.IO;                       // MemoryStream
using System.Media;                    // SoundPlayer
using System.Runtime.InteropServices;  // Marshal

public class ATK1F1 {
  const string dllPath = ".\\atk1-f1.dll";
  [DllImport(dllPath)]
  public static extern IntPtr AquesTalk_Synthe(string koe, int iSpeed, ref int size);
  [DllImport(dllPath)]
  public static extern void AquesTalk_FreeWave(IntPtr wavPtr);
}
public class ATK1F2 {
  const string dllPath = ".\\atk1-f2.dll";
  [DllImport(dllPath)]
  public static extern IntPtr AquesTalk_Synthe(string koe, int iSpeed, ref int size);
  [DllImport(dllPath)]
  public static extern void AquesTalk_FreeWave(IntPtr wavPtr);
}

public class ATK1 {
  public static void Main(string[] args) {
    if(args.Length != 2) {
      Console.WriteLine("ERROR : 引数が2つ設定されていません。終了します");
      return;
    }
    
    // 声の種類を指定する
    string voiceType = args[0];
    if(voiceType != "f1" && voiceType != "f2") {
      voiceType = "f1";
    }
    
    const int iSpeed = 100;
    string koe = args[1];
    
    // 音声ファイルとしてそのまま保存可能なバイト列の先頭ポイントを取得する
    int size = 0;
    IntPtr wavPtr = IntPtr.Zero;
    try {
      if(voiceType == "f1") {
        wavPtr = ATK1F1.AquesTalk_Synthe(koe, iSpeed, ref size);  // throws
      } else if(voiceType == "f2") {
        wavPtr = ATK1F2.AquesTalk_Synthe(koe, iSpeed, ref size);  // throws
      } else {
        Console.WriteLine("ERROR : 不正なボイス種類を指定されています。終了します。");
        return;
      }
      
      if(wavPtr == IntPtr.Zero) {
        Console.WriteLine("ERROR : 音声生成に失敗しました。不正な文字が使われた可能性があります。終了します");
        return;
      }
    }
    catch(Exception exception) {
      Console.WriteLine("ERROR : 例外が発生しました・終了します");
      Console.WriteLine(exception);
      return;
    }
    
    // C# で扱えるようにマネージド側へコピーする
    byte[] wav = new byte[size];
    Marshal.Copy(wavPtr, wav, 0, size);
    // アンマネージドポインタは用がなくなった瞬間に解放する
    if(voiceType == "f1") {
      ATK1F1.AquesTalk_FreeWave(wavPtr);
    } else if(voiceType == "f2") {
      ATK1F2.AquesTalk_FreeWave(wavPtr);
    } else {
      Console.WriteLine("ERROR : 不正なボイス種類を指定されています。終了します。");
      return;
    }
    // 同期再生する
    using(var ms = new MemoryStream(wav))
    using(var sp = new SoundPlayer(ms)) {
      sp.PlaySync();
    }
  }
}
