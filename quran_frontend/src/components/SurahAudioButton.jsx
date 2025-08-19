import React, { useRef, useState, useEffect } from "react";
import {
  getPrimarySurahUrl,
  getBackupSurahUrl
} from "../utils/audioPaths";

// متغير عام لتتبع الصوت المشغل حالياً
let currentlyPlayingAudio = null;
let currentlyPlayingButton = null;

export default function SurahAudioButton({ surahNumber, surahName }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [paused, setPaused] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      setPlaying(false);
      setPaused(false);
      if (currentlyPlayingAudio === audio) {
        currentlyPlayingAudio = null;
        currentlyPlayingButton = null;
      }
    };

    const handleError = () => {
      setPlaying(false);
      setPaused(false);
      setLoading(false);
      if (currentlyPlayingAudio === audio) {
        currentlyPlayingAudio = null;
        currentlyPlayingButton = null;
      }
    };

    const handleLoadStart = () => {
      setLoading(true);
    };

    const handleCanPlay = () => {
      setLoading(false);
    };

    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);

    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
    };
  }, []);

  const stopOtherAudios = () => {
    if (currentlyPlayingAudio && currentlyPlayingAudio !== audioRef.current) {
      currentlyPlayingAudio.pause();
      if (currentlyPlayingButton) {
        currentlyPlayingButton.setPlaying(false);
        currentlyPlayingButton.setPaused(false);
      }
    }
  };

  const handlePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      if (playing && !paused) {
        // إيقاف مؤقت
        audio.pause();
        setPlaying(false);
        setPaused(true);
        return;
      }

      if (paused) {
        // استكمال التشغيل
        stopOtherAudios();
        await audio.play();
        setPlaying(true);
        setPaused(false);
        currentlyPlayingAudio = audio;
        currentlyPlayingButton = { setPlaying, setPaused };
        return;
      }

      // تشغيل جديد
      stopOtherAudios();
      setLoading(true);
      
      try {
        audio.src = getPrimarySurahUrl(surahNumber);
        await audio.play();
        setPlaying(true);
        setPaused(false);
        currentlyPlayingAudio = audio;
        currentlyPlayingButton = { setPlaying, setPaused };
      } catch (primaryError) {
        console.warn("فشل المصدر الأساسي، التحويل للاحتياطي...");
        audio.src = getBackupSurahUrl(surahNumber);
        await audio.play();
        setPlaying(true);
        setPaused(false);
        currentlyPlayingAudio = audio;
        currentlyPlayingButton = { setPlaying, setPaused };
      }
    } catch (error) {
      console.error("خطأ في تشغيل الصوت:", error);
      setPlaying(false);
      setPaused(false);
      setLoading(false);
    }
  };

  const getButtonIcon = () => {
    if (loading) return "⏳";
    if (playing && !paused) return "⏸️";
    if (paused) return "▶️";
    return "🔊";
  };

  const getButtonTitle = () => {
    if (loading) return `جاري تحميل سورة ${surahName}...`;
    if (playing && !paused) return `إيقاف مؤقت لسورة ${surahName}`;
    if (paused) return `استكمال تشغيل سورة ${surahName}`;
    return `تشغيل سورة ${surahName}`;
  };

  return (
    <div style={{ display: "inline-flex", alignItems: "center" }}>
      <audio
        ref={audioRef}
        preload="none"
      />
      <button
        onClick={handlePlay}
        disabled={loading}
        style={{
          border: "none",
          background: loading 
            ? "#95a5a6" 
            : playing 
              ? "#e74c3c" 
              : "#2e7d32",
          color: "white",
          borderRadius: "50%",
          width: "36px",
          height: "36px",
          cursor: loading ? "not-allowed" : "pointer",
          fontSize: "16px",
          boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
          transition: "all 0.3s ease",
          opacity: loading ? 0.7 : 1
        }}
        title={getButtonTitle()}
      >
        {getButtonIcon()}
      </button>
    </div>
  );
}