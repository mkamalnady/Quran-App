// src/components/SurahReadLink.jsx
import React from "react";
import { getSurahReadingUrl } from "../utils/readingLinks";

export default function SurahReadLink({ surahNumber, surahName }) {
  const href = getSurahReadingUrl(surahNumber);

  const openRead = () => {
    window.open(href, "_blank", "noopener,noreferrer");
  };

  return (
    <button
      type="button"
      onClick={openRead}
      title={`قراءة سورة ${surahName}`}
      style={{
        border: "none",
        background: "#3949ab",
        color: "white",
        borderRadius: "50%",
        width: "36px",
        height: "36px",
        cursor: "pointer",
        fontSize: "18px",
        boxShadow: "0 2px 6px rgba(0,0,0,0.15)"
      }}
      aria-label={`قراءة سورة ${surahName}`}
    >
      📖
    </button>
  );
}
