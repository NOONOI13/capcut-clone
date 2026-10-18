"use client";
import { useState } from "react";

export default function Home() {
  const [video, setVideo] = useState<File | null>(null);
  const [status, setStatus] = useState("พร้อม");
  const [audioUrl, setAudioUrl] = useState("");

  const extractAudio = async () => {
    if (!video) {
      setStatus("กรุณาเลือกไฟล์ก่อน");
      return;
    }
    setStatus("กำลังโหลด FFmpeg...");
    const { FFmpeg } = await import("@ffmpeg/ffmpeg");
    const { fetchFile } = await import("@ffmpeg/util");
    const ffmpeg = new FFmpeg();
    await ffmpeg.load();
    setStatus("กำลังแยกเสียง...");
    await ffmpeg.writeFile("input.mp4", await fetchFile(video));
    await ffmpeg.exec(["-i", "input.mp4", "-vn", "-c:a", "libmp3lame", "output.mp3"]);
    const data = await ffmpeg.readFile("output.mp3");
    const url = URL.createObjectURL(new Blob([data as any], { type: "audio/mp3" }));
    setAudioUrl(url);
    setStatus("เสร็จแล้ว! ได้ไฟล์เสียงแล้ว");
  };

  return (
    <main className="min-h-screen bg-black text-white p-10 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-2">MyCut Clone - Web Version</h1>
      <p className="text-gray-400 mb-8">ดึงคลิป -{">"} แยกเสียง -{">"} ตัดฉาก (เหมือนในคลิป)</p>
      
      <input type="file" accept="video/*" onChange={e=>setVideo(e.target.files?.[0]||null)} className="mb-4" />
      
      <div className="flex gap-4">
        <button onClick={extractAudio} className="bg-blue-600 px-6 py-2 rounded-lg">แยกเอาไฟล์เสียง MP3</button>
      </div>

      <p className="mt-6 text-green-400">{status}</p>
      {audioUrl && <audio controls src={audioUrl} className="mt-4" />}
      {audioUrl && <a href={audioUrl} download="output.mp3" className="mt-2 text-blue-400 underline">โหลดไฟล์เสียง</a>}
    </main>
  );
}
