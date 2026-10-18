"use client";
import { useState, useRef } from "react";

export default function Home() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [status, setStatus] = useState("พร้อมใช้งาน");
  const [audioUrl, setAudioUrl] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setVideoFile(file);
    setVideoUrl(URL.createObjectURL(file));
    setAudioUrl("");
    setStatus(`โหลดแล้ว: ${file.name}`);
  };

  const extractAudio = async () => {
    if (!videoFile) {
      setStatus("⚠️ กรุณาเลือกไฟล์วิดีโอก่อน");
      return;
    }
    try {
      setIsProcessing(true);
      setStatus("⏳ กำลังโหลด FFmpeg...");
      const { FFmpeg } = await import("@ffmpeg/ffmpeg");
      const { fetchFile } = await import("@ffmpeg/util");
      const ffmpeg = new FFmpeg();
      
      ffmpeg.on("progress", ({ progress }) => {
        setStatus(`⏳ กำลังแยกเสียง... ${Math.round(progress * 100)}%`);
      });

      await ffmpeg.load();
      setStatus("⏳ กำลังประมวลผล...");
      await ffmpeg.writeFile("input.mp4", await fetchFile(videoFile));
      await ffmpeg.exec(["-i", "input.mp4", "-vn", "-q:a", "0", "-map", "a", "output.mp3"]);
      const data = await ffmpeg.readFile("output.mp3");
      const url = URL.createObjectURL(new Blob([data as any], { type: "audio/mp3" }));
      setAudioUrl(url);
      setStatus("✅ แยกเสียงเสร็จแล้ว! พร้อมดาวน์โหลด");
    } catch (err: any) {
      console.error(err);
      setStatus("❌ เกิดข้อผิดพลาด: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0f0f0f] text-white flex flex-col">
      {/* Header */}
      <header className="h-[56px] bg-[#1c1c1c] border-b border-[#2a2a2a] flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white text-black font-black flex items-center justify-center rounded">M</div>
          <span className="font-bold text-[15px] tracking-wide">MyCut Clone - Web Version</span>
          <span className="text-[11px] bg-[#2a2a2a] px-2 py-0.5 rounded text-zinc-400 ml-2">BETA</span>
        </div>
        <div className="text-[12px] text-zinc-400">capcut-clone-indol.vercel.app</div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Tools */}
        <div className="w-[64px] bg-[#1c1c1c] border-r border-[#2a2a2a] flex flex-col items-center py-4 gap-6">
          <button className="w-10 h-10 bg-white text-black rounded-lg flex items-center justify-center text-xl">✂️</button>
          <div className="flex flex-col gap-4 text-[20px] text-zinc-500">
            <span>🎬</span><span>🎵</span><span>📝</span><span>✨</span>
          </div>
        </div>

        {/* Center Preview */}
        <div className="flex-1 flex flex-col bg-[#0f0f0f]">
          <div className="flex-1 flex items-center justify-center p-6 bg-[#111]">
            {videoUrl ? (
              <video src={videoUrl} controls className="max-w-full max-h-[50vh] rounded-lg shadow-2xl bg-black" />
            ) : (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-full max-w-[560px] aspect-video border-2 border-dashed border-zinc-700 rounded-xl flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-white transition"
              >
                <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center text-3xl">＋</div>
                <div className="text-center">
                  <p className="font-semibold">ลากไฟล์มาวาง หรือคลิกเพื่อเลือก</p>
                  <p className="text-[12px] text-zinc-500 mt-1">MP4, MOV, MKV รองรับทั้งหมด</p>
                </div>
                <div className="bg-white text-black px-5 py-2 rounded-full text-sm font-bold mt-2">เลือกไฟล์วิดีโอ</div>
              </div>
            )}
          </div>

          {/* Timeline */}
          <div className="h-[220px] bg-[#1c1c1c] border-t border-[#2a2a2a] p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button onClick={extractAudio} disabled={isProcessing} className="bg-[#3a5bff] hover:bg-[#2f4ae0] disabled:bg-zinc-700 px-5 py-2 rounded-full text-[13px] font-bold flex items-center gap-2">
                  {isProcessing ? "⏳ กำลังทำ..." : "🎧 แยกเอาไฟล์เสียง MP3"}
                </button>
                <button onClick={() => fileInputRef.current?.click()} className="bg-[#2a2a2a] hover:bg-[#333] px-4 py-2 rounded-full text-[13px]">เปลี่ยนคลิป</button>
                {audioUrl && (
                  <a href={audioUrl} download={`${videoFile?.name || "audio"}.mp3`} className="bg-[#00d389] text-black px-5 py-2 rounded-full text-[13px] font-bold">⬇️ โหลด MP3</a>
                )}
              </div>
              <div className={`text-[12px] px-3 py-1 rounded-full ${status.includes("✅") ? "bg-green-500/20 text-green-400" : status.includes("❌") ? "bg-red-500/20 text-red-400" : "bg-zinc-800 text-zinc-400"}`}>{status}</div>
            </div>

            {/* Fake Timeline UI */}
            <div className="flex-1 bg-[#101010] rounded-lg border border-[#2a2a2a] p-3 relative overflow-hidden">
              <div className="flex gap-1 h-full items-center">
                <div className="w-[80px] text-[11px] text-zinc-500">V1</div>
                <div className="flex-1 h-[52px] bg-gradient-to-r from-violet-600 to-indigo-600 rounded flex items-center px-3 text-[12px] font-medium truncate">
                  {videoFile ? `📹 ${videoFile.name}` : "ยังไม่มีคลิป - เลือกไฟล์ด้านบน"}
                </div>
              </div>
              <div className="flex gap-1 h-full items-center mt-2">
                <div className="w-[80px] text-[11px] text-zinc-500">A1</div>
                <div className={`flex-1 h-[28px] rounded flex items-center px-3 text-[11px] ${audioUrl ? "bg-[#00d389] text-black" : "bg-zinc-800 text-zinc-500 border border-dashed border-zinc-700"}`}>
                  {audioUrl ? `🎵 เสียงแยกแล้ว - พร้อมโหลด` : "🎧 จะขึ้นตรงนี้หลังแยกเสียง"}
                </div>
              </div>
              {audioUrl && <audio controls src={audioUrl} className="w-full mt-3 h-8" />}
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-[300px] bg-[#1c1c1c] border-l border-[#2a2a2a] p-4 hidden lg:block">
          <h3 className="text-[13px] font-bold mb-4">คุณสมบัติ</h3>
          <div className="space-y-3 text-[12px]">
            <div className="bg-[#2a2a2a] p-3 rounded-lg">
              <p className="text-zinc-400">ขั้นตอน</p>
              <p className="mt-1 leading-6">1. เลือกไฟล์<br/>2. กด แยกเอาไฟล์เสียง<br/>3. โหลด MP3</p>
            </div>
            <div className="bg-[#2a2a2a] p-3 rounded-lg">
              <p className="text-zinc-400">ไฟล์ต้นฉบับ</p>
              <p className="mt-1">{videoFile ? `${(videoFile.size/1024/1024).toFixed(2)} MB` : "-"} </p>
            </div>
            {audioUrl && (
              <div className="bg-[#00d389]/10 border border-[#00d389]/30 p-3 rounded-lg">
                <p className="text-[#00d389] font-bold">✅ พร้อมใช้งาน</p>
                <p className="text-zinc-400 mt-1">ไฟล์เสียงแยกเรียบร้อย กดปุ่มเขียวเพื่อโหลด</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <input ref={fileInputRef} type="file" accept="video/*" onChange={handleFileChange} className="hidden" />
    </main>
  );
}
