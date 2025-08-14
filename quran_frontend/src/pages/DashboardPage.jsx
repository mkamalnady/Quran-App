import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import Modal from '../components/Modal';
import ProgressStats from '../components/ProgressStats';
import ReviewReminder from '../components/ReviewReminder';
import AchievementSystem from '../components/AchievementSystem';
import SurahReadLink from '../components/SurahReadLink';
import SurahAudioButton from '../components/SurahAudioButton';
import SurahTafsirLink from '../components/SurahTafsirLink';
import AdhkarView from '../components/AdhkarView';

function DashboardPage() {
  const [memorizations, setMemorizations] = useState([]);
  const [surahs, setSurahs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState(null);
  const [selectedSurah, setSelectedSurah] = useState(null);
  const [addFormData, setAddFormData] = useState({ start_ayah: '', end_ayah: '' });
  const [viewMode, setViewMode] = useState("memorization");
  const [adhkarType, setAdhkarType] = useState("morning");
  const [dailyGoal, setDailyGoal] = useState(5); // هدف يومي: 5 آيات
  const [showSettings, setShowSettings] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error("Token not found");
      const config = { headers: { Authorization: `Token ${token}` } };
      const [surahsResponse, memoResponse] = await Promise.all([
        axios.get('https://quran-app-8ay9.onrender.com/api/surahs/', config),
        axios.get('https://quran-app-8ay9.onrender.com/api/memorization/', config)
      ]);
      setSurahs(surahsResponse.data);
      setMemorizations(memoResponse.data);
    } catch {
      setError("حدث خطأ أثناء جلب البيانات. حاول تحديث الصفحة.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const surahProgressData = useMemo(() => {
    const progressMap = new Map(memorizations.map(memo => [memo.surah, memo]));
    return surahs.map(surah => {
      const progress = progressMap.get(surah.number);
      let statusText = "لم يبدأ";
      let statusColor = "#6c757d";
      let isDone = false;
      if (progress) {
        if (progress.end_ayah >= surah.total_verses) {
          statusText = "مُكتمل بحمد الله ✨";
          statusColor = "#28a745";
          isDone = true;
        } else {
          statusText = `الآية ${progress.end_ayah} من ${surah.total_verses}`;
          statusColor = "#007bff";
        }
      }
      return { ...surah, statusText, statusColor, isDone, progress };
    });
  }, [surahs, memorizations]);

  const openModal = (surah, mode) => {
    setSelectedSurah(surah);
    setModalMode(mode);
    if (mode === 'add') {
      const lastVerse = surah.progress ? surah.progress.end_ayah : 0;
      setAddFormData({ start_ayah: lastVerse + 1, end_ayah: '' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => { setIsModalOpen(false); setSelectedSurah(null); setModalMode(null); };

  const handleApiCall = async (method, url, data) => {
    const token = localStorage.getItem('authToken');
    const config = { headers: { Authorization: `Token ${token}` } };
    try {
      await axios[method](url, data, config);
      closeModal();
      fetchData();
    } catch {
      alert("حدث خطأ أثناء حفظ البيانات.");
    }
  };

  const handleSaveMemorization = (isComplete = false) => {
    const end = isComplete ? selectedSurah.total_verses : parseInt(addFormData.end_ayah);
    const startVerse = selectedSurah.progress?.end_ayah || 0;
    if (!isComplete && (isNaN(end) || end <= startVerse || end > selectedSurah.total_verses)) {
      alert("الرجاء إدخال رقم آية صحيح.");
      return;
    }
    const data = { surah: selectedSurah.number, start_ayah: 1, end_ayah: end };
    const url = selectedSurah.progress
      ? `https://quran-app-8ay9.onrender.com/api/memorization/${selectedSurah.progress.id}/`
      : 'https://quran-app-8ay9.onrender.com/api/memorization/';
    const method = selectedSurah.progress ? 'patch' : 'post';
    handleApiCall(method, url, data);
  };

  const handleReview = () => {
    const { progress } = selectedSurah;
    if (!progress) return;
    const now = new Date();
    const newHistory = [...(progress.review_history || []), { date: now.toISOString(), type: "مراجعة" }];
    const data = { review_history: newHistory, last_review_date: now.toISOString() };
    handleApiCall('patch', `https://quran-app-8ay9.onrender.com/api/memorization/${progress.id}/`, data);
  };

  if (loading) return <p>جاري التحميل...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="container">

      {viewMode === "memorization" && (
        <>
          {/* إحصائيات التقدم */}
          <ProgressStats memorizations={memorizations} surahs={surahs} />
          
          {/* نظام الإنجازات */}
          <AchievementSystem memorizations={memorizations} surahs={surahs} />
          
          {/* تذكيرات المراجعة */}
          <ReviewReminder 
            memorizations={memorizations} 
            surahs={surahs}
            onReviewSurah={(surah) => openModal(surah, 'review')}
          />
        </>
      )}

      {/* أزرار رئيسية */}
      <div className="top-bar">
        <button className="main-btn" onClick={() => setViewMode("memorization")}>📚 قائمة حفظ القرآن</button>
        <button className="main-btn" onClick={() => setViewMode("adhkarMenu")}>🕌 أذكار المسلم</button>
        <button className="main-btn settings" onClick={() => setShowSettings(!showSettings)}>⚙️ الإعدادات</button>
      </div>

      {/* إعدادات سريعة */}
      {showSettings && (
        <div className="settings-panel">
          <h3>⚙️ الإعدادات</h3>
          <div className="setting-item">
            <label>الهدف اليومي (عدد الآيات):</label>
            <input 
              type="number" 
              value={dailyGoal} 
              onChange={(e) => setDailyGoal(parseInt(e.target.value) || 5)}
              min="1" 
              max="50"
            />
          </div>
          <div className="setting-item">
            <button onClick={() => {
              if (confirm('هل تريد تصدير بياناتك؟')) {
                const data = { memorizations, settings: { dailyGoal } };
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'quran-progress.json';
                a.click();
              }
            }}>
              📤 تصدير البيانات
            </button>
          </div>
        </div>
      )}

      {viewMode === "adhkarMenu" && (
        <div className="adhkar-menu-page">
          <h2>اختر قسم الأذكار</h2>
          <div className="adhkar-btn-list">
            <button onClick={() => { setAdhkarType("morning"); setViewMode("adhkar"); }}>🌅 أذكار الصباح</button>
            <button onClick={() => { setAdhkarType("evening"); setViewMode("adhkar"); }}>🌇 أذكار المساء</button>
            <button onClick={() => { setAdhkarType("sleep"); setViewMode("adhkar"); }}>🌙 أذكار النوم</button>
            <button onClick={() => { setAdhkarType("other"); setViewMode("adhkar"); }}>🕌 أذكار أخرى</button>
          </div>
          <button className="back-btn" onClick={() => setViewMode("memorization")}>← رجوع</button>
        </div>
      )}

      {viewMode === "adhkar" && (
        <AdhkarView type={adhkarType} onBack={() => setViewMode("adhkarMenu")} />
      )}

      {viewMode === "memorization" && (
        <table className="quran-table">
          <thead>
            <tr>
              <th>رقم</th>
              <th>اسم السورة</th>
              <th>النوع</th>
              <th>الآيات</th>
              <th>الحالة</th>
              <th>قراءة</th>
              <th>استماع</th>
              <th>تفسير</th>
              <th>إجراء</th>
              <th>السجل</th>
            </tr>
          </thead>
          <tbody>
            {surahProgressData.map(surah => (
              <tr key={surah.number} className={surah.isDone ? 'completed-row' : ''}>
                <td>{surah.number}</td>
                <td>{surah.name}</td>
                <td>{surah.type}</td>
                <td>{surah.total_verses}</td>
                <td style={{ color: surah.statusColor }}>{surah.statusText}</td>
                <td><SurahReadLink surahNumber={surah.number} surahName={surah.name} /></td>
                <td><SurahAudioButton surahNumber={surah.number} surahName={surah.name} /></td>
                <td><SurahTafsirLink surahNumber={surah.number} surahName={surah.name} /></td>
                <td>
                  {surah.isDone
                    ? <button className="btn-modern review" onClick={() => openModal(surah, 'review')}>🔄 مراجعة</button>
                    : <button className="btn-modern add" onClick={() => openModal(surah, 'add')}>➕ أضف</button>}
                </td>
                <td>
                  <button
                    className="btn-modern history"
                    disabled={!surah.progress}
                    onClick={() => openModal(surah, 'history')}
                  >
                    📈 السجل
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {isModalOpen && selectedSurah && (
        <Modal
          onClose={closeModal}
          title={
            modalMode === 'add'
              ? `📝 إضافة حفظ - سورة ${selectedSurah.name}`
              : modalMode === 'review'
              ? `🔄 مراجعة - سورة ${selectedSurah.name}`
              : `📊 السجل - سورة ${selectedSurah.name}`
          }
        >
          {modalMode === 'add' && (
            <>
              <input value={addFormData.start_ayah} disabled />
              <input
                value={addFormData.end_ayah}
                onChange={e => setAddFormData({ ...addFormData, end_ayah: e.target.value })}
              />
              <button onClick={() => handleSaveMemorization()}>💾 حفظ الجزء</button>
              <button onClick={() => handleSaveMemorization(true)}>✨ حفظ السورة كاملة</button>
            </>
          )}
          {modalMode === 'review' && (
            <button onClick={handleReview}>تأكيد المراجعة</button>
          )}
          {modalMode === 'history' && (
            <div>
              {selectedSurah.progress ? (
                <>
                  <p>📖 الحفظ: حتى الآية {selectedSurah.progress.end_ayah}</p>
                  {selectedSurah.progress.review_history && selectedSurah.progress.review_history.length > 0 ? (
                    <ul>
                      {selectedSurah.progress.review_history.map((entry, idx) => (
                        <li key={idx}>{new Date(entry.date).toLocaleString()} - {entry.type || 'مراجعة'}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>لا يوجد مراجعات مسجلة</p>
                  )}
                </>
              ) : (
                <p>🚀 لم يتم البدء في هذه السورة بعد</p>
              )}
            </div>
          )}
        </Modal>
      )}

      <style jsx>{`
        .completed-row {background: linear-gradient(135deg, #d4ffe4, #a8f5bc);}
        .top-bar {display: flex; gap: 10px; margin-bottom: 1rem;}
        .main-btn {
          flex: 1; padding: 14px; font-size: 0.95rem; font-weight: bold;
          background: linear-gradient(135deg,#1e88e5,#3949ab);
          color: #fff; border: none; border-radius: 12px; cursor: pointer;
          transition: all 0.3s ease;
        }
        .main-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(30, 136, 229, 0.4);
        }
        .main-btn.settings {
          background: linear-gradient(135deg, #6c757d, #495057);
          flex: 0.5;
        }
        .settings-panel {
          background: white;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 20px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
          border: 2px solid #e9ecef;
        }
        .settings-panel h3 {
          margin: 0 0 15px 0;
          color: #495057;
        }
        .setting-item {
          margin-bottom: 15px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .setting-item label {
          font-weight: bold;
          color: #495057;
          min-width: 150px;
        }
        .setting-item input {
          padding: 8px 12px;
          border: 1px solid #ced4da;
          border-radius: 6px;
          width: 80px;
        }
        .setting-item button {
          background: linear-gradient(135deg, #28a745, #20c997);
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: bold;
        }
        .btn-modern {
          padding: 6px 10px;
          border: none;
          border-radius: 6px;
          color: #fff;
          cursor: pointer;
          font-weight: 600;
        }
        .btn-modern.add {background: linear-gradient(135deg, #00b894, #00a085);}
        .btn-modern.review {background: linear-gradient(135deg, #1e88e5, #1565c0);}
        .btn-modern.history {background: linear-gradient(135deg, #ff9800, #f57c00);}
        .btn-modern:disabled {background: #ccc; cursor: not-allowed;}
        .adhkar-btn-list {display:flex;flex-direction:column;gap:12px;}
        .adhkar-btn-list button {padding:14px;background:linear-gradient(135deg,#00b894,#00a085);color:#fff;}
        .back-btn {margin-top:20px;padding:12px;background:#636e72;color:#fff;border:none;border-radius:8px;}
      `}</style>
    </div>
  );
}

export default DashboardPage;
