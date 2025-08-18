import React, { useRef, useState } from "react";
import {
  getPrimarySurahUrl,
  getBackupSurahUrl
} from "../utils/audioPaths";

export default function SurahAudioButton({ surahNumber, surahName }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);

  const handlePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      try {
        audio.src = getPrimarySurahUrl(surahNumber);
        await audio.play();
        setPlaying(true);
      } catch {
        console.warn("فشل المصدر الأساسي، التحويل للاحتياطي...");
        audio.src = getBackupSurahUrl(surahNumber);
        await audio.play();
        setPlaying(true);
      }
    }
  };

  return (
    <div style={{ display: "inline-flex", alignItems: "center" }}>
      <audio
        ref={audioRef}
        onEnded={() => setPlaying(false)}
        onError={() => setPlaying(false)}
        preload="none"
      />
      <button
        onClick={handlePlay}
        style={{
          border: "none",
          background: playing ? "#1b5e20" : "#2e7d32",
          color: "white",
          borderRadius: "50%",
          width: "36px",
          height: "36px",
          cursor: "pointer",
          fontSize: "18px",
          boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
          transition: "all 0.3s ease"
        }}
        title={`تشغيل سورة ${surahName}`}
      >
        {playing ? "⏸" : "🔊"}
      </button>
    </div>
  );
}
