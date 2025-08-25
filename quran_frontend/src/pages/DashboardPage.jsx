import React, { useState, useEffect, useMemo } from "react";
import {
  getSurahs,
  getMemorization,
  resetMemorization,
  bulkSave,
} from "../services/api";
import SurahTable from "../components/SurahTable";
import BulkActionsPanel from "../components/BulkActionsPanel";
import SettingsPanel from "../components/SettingsPanel";
import ProgressStats from "../components/ProgressStats";
import AchievementSystem from "../components/AchievementSystem";
import ReviewReminder from "../components/ReviewReminder";
import AdhkarView from "../components/AdhkarView";
import DateDisplay from "../components/DateDisplay";
import Modal from "../components/Modal";

function DashboardPage() {
  const [memorizations, setMemorizations] = useState([]);
  const [surahs, setSurahs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [viewMode, setViewMode] = useState("memorization");
  const [modalData, setModalData] = useState(null);

  const [selectedSurahs, setSelectedSurahs] = useState(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [dailyGoal, setDailyGoal] = useState(5);

  // Fetch Data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [surahData, memoData] = await Promise.all([
        getSurahs(),
        getMemorization(),
      ]);
      setSurahs(surahData);
      setMemorizations(memoData);
    } catch (err) {
      setError("حدث خطأ أثناء جلب البيانات. حاول تحديث الصفحة.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Progress Calculation
  const surahProgressData = useMemo(() => {
    const progressMap = new Map(memorizations.map((m) => [m.surah, m]));
    return surahs.map((surah) => {
      const progress = progressMap.get(surah.number);
      let status = { text: "لم يبدأ", color: "gray", done: false };

      if (progress) {
        if (progress.end_ayah >= surah.total_verses) {
          status = { text: "مُكتمل ✨", color: "green", done: true };
        } else {
          status = {
            text: `الآية ${progress.end_ayah} من ${surah.total_verses}`,
            color: "blue",
          };
        }
      }
      return { ...surah, progress, ...status };
    });
  }, [surahs, memorizations]);

  if (loading) return <p>⏳ جاري التحميل...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div className="p-4 space-y-4">
      {/* التاريخ */}
      <DateDisplay />

      {/* إحصائيات */}
      {viewMode === "memorization" && (
        <>
          <ProgressStats memorizations={memorizations} surahs={surahs} />
          <AchievementSystem memorizations={memorizations} surahs={surahs} />
          <ReviewReminder memorizations={memorizations} surahs={surahs} />
        </>
      )}

      {/* أزرار */}
      <div className="flex gap-2">
        <button onClick={() => setViewMode("memorization")}>📚 قائمة الحفظ</button>
        <button onClick={() => setViewMode("adhkar")}>🕌 الأذكار</button>
        <button onClick={() => setShowBulkActions((p) => !p)}>📦 إجراءات جماعية</button>
        <button onClick={() => setShowSettings((p) => !p)}>⚙️ الإعدادات</button>
      </div>

      {/* Panels */}
      {showBulkActions && (
        <BulkActionsPanel
          surahs={surahs}
          selectedSurahs={selectedSurahs}
          setSelectedSurahs={setSelectedSurahs}
          onApply={() => bulkSave(selectedSurahs, memorizations).then(fetchData)}
          onCancel={() => setShowBulkActions(false)}
        />
      )}

      {showSettings && (
        <SettingsPanel dailyGoal={dailyGoal} setDailyGoal={setDailyGoal} />
      )}

      {/* عرض الأذكار أو الجدول */}
      {viewMode === "adhkar" && <AdhkarView />}
      {viewMode === "memorization" && (
        <SurahTable
          surahs={surahProgressData}
          onAdd={(s) => setModalData({ mode: "add", surah: s })}
          onReview={(s) => setModalData({ mode: "review", surah: s })}
          onReset={(s) => resetMemorization(s).then(fetchData)}
        />
      )}

      {/* المودال */}
      {modalData && (
        <Modal onClose={() => setModalData(null)} title="إدارة السورة">
          <p>{modalData.mode === "add" ? "إضافة حفظ" : "مراجعة سورة"}</p>
        </Modal>
      )}
    </div>
  );
}

export default DashboardPage;
