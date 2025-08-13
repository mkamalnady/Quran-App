import React from "react";
import { getIbnKathirShortUrl } from "../utils/tafseerLinks";

export default function SurahTafsirLink({ surahNumber, surahName }) {
  const href = getIbnKathirShortUrl(surahNumber);

  const openTafsir = () => {
    window.open(href, "_blank", "noopener,noreferrer");
  };

  return (
    <button
      type="button"
      onClick={openTafsir}
      title={`تفسير سورة ${surahName} (مختصر ابن كثير)`}
      style={{
        border: "none",
        background: "#6d4c41", // بني داكن مختلف بوضوح عن زر القراءة
        color: "white",
        borderRadius: "50%",
        width: "36px",
        height: "36px",
        cursor: "pointer",
        fontSize: "18px",
        boxShadow: "0 2px 6px rgba(0,0,0,0.15)"
      }}
      aria-label={`تفسير سورة ${surahName}`}
    >
      🧾
    </button>
  );
}
