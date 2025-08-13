import React, { useState, useEffect } from "react";
import { ADHKAR } from "../utils/adhkarData";

export default function AdhkarView({ type = "morning", onBack }) {
  const [index, setIndex] = useState(0);
  const [counts, setCounts] = useState([]);

  useEffect(() => {
    setIndex(0);
    setCounts((ADHKAR[type] || []).map(item => item.repeat || 1));
  }, [type]);

  const list = ADHKAR[type] || [];
  const titleMap = {
    morning: "🌅 أذكار الصباح",
    evening: "🌇 أذكار المساء",
    sleep: "🌙 أذكار النوم",
    other: "🕌 أذكار أخرى"
  };

  const handleDone = i =>
    setCounts(prev => {
      const nxt = [...prev];
      if (nxt[i] > 0) nxt[i] -= 1;
      return nxt;
    });

  return (
    <div className="adhkar-view">
      <div className="adhkar-header">
        <h2>{titleMap[type]}</h2>
        {onBack && <button onClick={onBack}>← رجوع</button>}
      </div>

      {list.length > 0 && (
        <div className="adhkar-card">
          {list[index]?.tag && <h4>🏷 {list[index].tag}</h4>}
          <p>{list[index].text}</p>
          <p>🔁 متبقي: {counts[index]}</p>
          <button className="done-btn" onClick={() => handleDone(index)}>
            تم ✔
          </button>
          <button className="next-btn" onClick={() => setIndex((index+1)%list.length)}>
            التالي ➡
          </button>
        </div>
      )}

      <style jsx>{`
        .adhkar-view {padding: 20px;}
        .adhkar-card {
          background: #fff; padding: 20px; border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.05);
        }
        .done-btn, .next-btn {
          width: 100%; padding: 14px; font-size: 1.1rem;
          margin-top: 10px; border: none; border-radius: 8px; cursor: pointer;
        }
        .done-btn {background: linear-gradient(135deg, #00b894, #00a085); color: #fff;}
        .next-btn {background: linear-gradient(135deg, #1e88e5, #3949ab); color: #fff;}
      `}</style>
    </div>
  );
}
