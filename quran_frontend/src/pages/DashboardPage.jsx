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
  const [selectedSurahs, setSelectedSurahs] = useState(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [bulkAction, setBulkAction] = useState("");

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

  const handleResetSurah = async (surah) => {
    if (!confirm(`هل أنت متأكد من إعادة تعيين حفظ سورة ${surah.name}؟\nسيتم حذف جميع البيانات المحفوظة لهذه السورة.`)) {
      return;
    }
    
    const token = localStorage.getItem('authToken');
    const config = { headers: { Authorization: `Token ${token}` } };
    
    try {
      await axios.delete(`https://quran-app-8ay9.onrender.com/api/memorization/${surah.progress.id}/`, config);
      alert(`تم إعادة تعيين سورة ${surah.name} بنجاح! 🔄`);
      fetchData();
    } catch (error) {
      alert("حدث خطأ أثناء إعادة التعيين.");
    }
  };

  const handleBulkAction = async () => {
    if (selectedSurahs.size === 0) {
      alert("الرجاء اختيار سورة واحدة على الأقل");
      return;
    }
    
    if (!bulkAction) {
      alert("الرجاء اختيار إجراء");
      return;
    }
    
    const selectedSurahsList = Array.from(selectedSurahs).map(num => 
      surahs.find(s => s.number === num)
    ).filter(Boolean);
    
    const surahNames = selectedSurahsList.map(s => s.name).join('، ');
    
    if (!confirm(`هل أنت متأكد من تطبيق "${bulkAction}" على السور التالية:\n${surahNames}`)) {
      return;
    }
    
    const token = localStorage.getItem('authToken');
    const config = { headers: { Authorization: `Token ${token}` } };
    
    try {
      for (const surah of selectedSurahsList) {
        if (bulkAction === "حفظ كامل") {
          const data = { surah: surah.number, start_ayah: 1, end_ayah: surah.total_verses };
          const existingMemo = memorizations.find(m => m.surah === surah.number);
          
          if (existingMemo) {
            await axios.patch(`https://quran-app-8ay9.onrender.com/api/memorization/${existingMemo.id}/`, data, config);
          } else {
            await axios.post('https://quran-app-8ay9.onrender.com/api/memorization/', data, config);
          }
        }
      }
      
      alert(`تم تطبيق "${bulkAction}" على ${selectedSurahsList.length} سورة بنجاح! ✅`);
      setSelectedSurahs(new Set());
      setBulkAction("");
      setShowBulkActions(false);
      fetchData();
    } catch (error) {
      alert("حدث خطأ أثناء تطبيق الإجراء الجماعي.");
    }
  };

  const toggleSurahSelection = (surahNumber) => {
    const newSelected = new Set(selectedSurahs);
    if (newSelected.has(surahNumber)) {
      newSelected.delete(surahNumber);
    } else {
      newSelected.add(surahNumber);
    }
    setSelectedSurahs(newSelected);
  };

  const selectAllSurahs = () => {
    if (selectedSurahs.size === surahs.length) {
      setSelectedSurahs(new Set());
    } else {
      setSelectedSurahs(new Set(surahs.map(s => s.number)));
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
    
    // استخدام endpoint المخصص للمراجعة
    const token = localStorage.getItem('authToken');
    const config = { headers: { Authorization: `Token ${token}` } };
    
    axios.post(
      `https://quran-app-8ay9.onrender.com/api/memorization/${progress.id}/add_review/`,
      {},
      config
    ).then(() => {
      closeModal();
      fetchData();
      // إظهار رسالة نجاح
      const reviewData = response.data.review_entry;
      const message = `تم تسجيل المراجعة بنجاح! 🎉\n\n` +
                     `📖 السورة: ${reviewData.surah_name}\n` +
                     `📊 التقدم: ${reviewData.completion_percentage}%\n` +
                     `🔢 الآيات: ${reviewData.verses_reviewed} من ${reviewData.total_verses}`;
      alert(message);
    }).catch(() => {
      alert("حدث خطأ أثناء تسجيل المراجعة.");
    });
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
        <button 
          className="main-btn bulk-actions" 
          onClick={() => setShowBulkActions(!showBulkActions)}
        >
          📚 حفظ أكتر من سورة ({selectedSurahs.size})
        </button>
        <button className="main-btn settings" onClick={() => setShowSettings(!showSettings)}>⚙️ الإعدادات</button>
      </div>

      {/* إجراءات جماعية */}
      {showBulkActions && viewMode === "memorization" && (
        <div className="bulk-actions-panel">
          <div className="bulk-header">
            <h3>📚 حفظ أكتر من سورة</h3>
            <div className="bulk-controls">
              <button 
                className="select-all-btn"
                onClick={selectAllSurahs}
              >
                {selectedSurahs.size === surahs.length ? "إلغاء تحديد الكل" : "تحديد الكل"}
              </button>
              <span className="selected-count">
                محدد: {selectedSurahs.size} من {surahs.length}
              </span>
            </div>
          </div>
          
          <div className="bulk-actions-row">
            <select 
              value={bulkAction} 
              onChange={(e) => setBulkAction(e.target.value)}
              className="bulk-action-select"
            >
              <option value="">اختر إجراء...</option>
              <option value="حفظ كامل">✨ حفظ كامل للسور المحددة</option>
            </select>
            
            <button 
              className="apply-bulk-btn"
              onClick={handleBulkAction}
              disabled={selectedSurahs.size === 0 || !bulkAction}
            >
              تطبيق الإجراء
            </button>
            
            <button 
              className="cancel-bulk-btn"
              onClick={() => {
                setShowBulkActions(false);
                setSelectedSurahs(new Set());
                setBulkAction("");
              }}
            >
              إلغاء
            </button>
          </div>
        </div>
      )}
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
              {showBulkActions && <th>تحديد</th>}
              <th>رقم</th>
              <th>اسم السورة</th>
              <th>النوع</th>
              <th>الآيات</th>
              <th>الحالة</th>
              <th>قراءة</th>
              <th>استماع</th>
              <th>تفسير</th>
              <th>إجراء</th>
              <th>إعادة</th>
              <th>السجل</th>
            </tr>
          </thead>
          <tbody>
            {surahProgressData.map(surah => (
              <tr key={surah.number} className={surah.isDone ? 'completed-row' : ''}>
                {showBulkActions && (
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedSurahs.has(surah.number)}
                      onChange={() => toggleSurahSelection(surah.number)}
                      className="surah-checkbox"
                    />
                  </td>
                )}
                <td>{surah.number}</td>
                <td>{surah.name}</td>
                <td>{surah.type}</td>
                <td>
                  <span className="verse-count">{surah.total_verses} آية</span>
                </td>
                <td style={{ color: surah.statusColor }}>{surah.statusText}</td>
                <td>
                  <button
                    className="action-btn read-btn"
                    onClick={() => window.open(`https://quran.com/${surah.number}`, '_blank', 'noopener,noreferrer')}
                    title={`قراءة سورة ${surah.name}`}
                  >
                    📖
                  </button>
                </td>
                <td><SurahAudioButton surahNumber={surah.number} surahName={surah.name} /></td>
                <td>
                  <button
                    className="action-btn tafsir-btn"
                    onClick={() => window.open(`https://quran.com/ar/${surah.number}:1/tafsirs/ar-tafsir-muyassar`, '_blank', 'noopener,noreferrer')}
                    title={`تفسير سورة ${surah.name}`}
                  >
                    📚
                  </button>
                </td>
                <td>
                  {surah.isDone
                    ? <button className="btn-modern review" onClick={() => openModal(surah, 'review')}>🔄 مراجعة</button>
                    : <button className="btn-modern add" onClick={() => openModal(surah, 'add')}>➕ أضف</button>}
                </td>
                <td>
                  <button
                    className="btn-modern reset"
                    onClick={() => handleResetSurah(surah)}
                    disabled={!surah.progress}
                    title={`إعادة تعيين حفظ سورة ${surah.name}`}
                  >
                    🔄 إعادة
                  </button>
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
          size={modalMode === 'history' ? 'large' : 'medium'}
          title={
            modalMode === 'add'
              ? `📝 إضافة حفظ - سورة ${selectedSurah.name} (${selectedSurah.total_verses} آية)`
              : modalMode === 'review'
              ? `🔄 مراجعة - سورة ${selectedSurah.name} (${selectedSurah.total_verses} آية)`
              : `📊 السجل - سورة ${selectedSurah.name} (${selectedSurah.total_verses} آية)`
          }
        >
          {modalMode === 'add' && (
            <div className="add-memorization-form">
              <div className="surah-info">
                <h4>معلومات السورة</h4>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="label">اسم السورة:</span>
                    <span className="value">{selectedSurah.name}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">عدد الآيات:</span>
                    <span className="value highlight-verses">{selectedSurah.total_verses} آية</span>
                  </div>
                  <div className="info-item">
                    <span className="label">النوع:</span>
                    <span className="value">{selectedSurah.type}</span>
                  </div>
                  {selectedSurah.progress && (
                    <div className="info-item">
                      <span className="label">محفوظ حتى:</span>
                      <span className="value">الآية {selectedSurah.progress.end_ayah}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="form-section">
                <h4>إضافة حفظ جديد</h4>
                <div className="form-row">
                  <div className="form-group">
                    <label>من الآية:</label>
                    <input 
                      type="number" 
                      value={addFormData.start_ayah} 
                      disabled 
                      className="disabled-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>إلى الآية:</label>
                    <input
                      type="number"
                      value={addFormData.end_ayah}
                      onChange={e => setAddFormData({ ...addFormData, end_ayah: e.target.value })}
                      placeholder={`أدخل رقم من ${addFormData.start_ayah} إلى ${selectedSurah.total_verses}`}
                      min={addFormData.start_ayah}
                      max={selectedSurah.total_verses}
                    />
                  </div>
                </div>
                
                <div className="progress-preview">
                  {addFormData.end_ayah && (
                    <div className="preview-info">
                      <span>ستحفظ: {parseInt(addFormData.end_ayah) - parseInt(addFormData.start_ayah) + 1} آية</span>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ width: `${(parseInt(addFormData.end_ayah) / selectedSurah.total_verses) * 100}%` }}
                        ></div>
                      </div>
                      <span className="progress-text">
                        {Math.round((parseInt(addFormData.end_ayah) / selectedSurah.total_verses) * 100)}% من السورة
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="action-buttons">
                <button 
                  className="btn-save-part" 
                  onClick={() => handleSaveMemorization()}
                  disabled={!addFormData.end_ayah}
                >
                  💾 حفظ الجزء المحدد
                </button>
                <button 
                  className="btn-save-complete" 
                  onClick={() => handleSaveMemorization(true)}
                >
                  ✨ حفظ السورة كاملة 
                  <div className="complete-info">
                    ({selectedSurah.total_verses} آية - {selectedSurah.name})
                  </div>
                </button>
              </div>
            </div>
          )}
          
          {modalMode === 'review' && (
            <div className="review-form">
              <div className="review-info">
                <h4>مراجعة سورة {selectedSurah.name}</h4>
                <div className="review-details">
                  <div className="review-detail-item">
                    <span className="detail-label">📖 عدد الآيات:</span>
                    <span className="detail-value highlight-verses">{selectedSurah.total_verses} آية</span>
                  </div>
                  <div className="review-detail-item">
                    <span className="detail-label">✅ محفوظ حتى:</span>
                    <span className="detail-value">الآية {selectedSurah.progress?.end_ayah}</span>
                  </div>
                  <div className="review-detail-item">
                    <span className="detail-label">📊 نسبة الإكمال:</span>
                    <span className="detail-value">{Math.round((selectedSurah.progress?.end_ayah / selectedSurah.total_verses) * 100)}%</span>
                  </div>
                  {selectedSurah.progress?.last_review_date && (
                    <div className="review-detail-item">
                      <span className="detail-label">🕐 آخر مراجعة:</span>
                      <span className="detail-value">{new Date(selectedSurah.progress.last_review_date).toLocaleDateString('ar-SA')}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="review-actions">
                <button className="btn-confirm-review" onClick={handleReview}>
                  ✅ تأكيد المراجعة
                </button>
                <p className="review-note">
                  سيتم تسجيل هذه المراجعة في سجل المراجعات الخاص بك
                </p>
              </div>
            </div>
          )}
          
          {modalMode === 'history' && (
            <div className="history-view">
              {selectedSurah.progress ? (
                <div className="history-content">
                  <div className="memorization-status">
                    <h4>حالة الحفظ</h4>
                    <div className="status-card">
                      <div className="status-item">
                        <span className="status-label">محفوظ حتى:</span>
                        <span className="status-value">الآية {selectedSurah.progress.end_ayah} من {selectedSurah.total_verses}</span>
                      </div>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ width: `${(selectedSurah.progress.end_ayah / selectedSurah.total_verses) * 100}%` }}
                        ></div>
                      </div>
                      <div className="status-item">
                        <span className="status-label">نسبة الإكمال:</span>
                        <span className="status-value">
                          {Math.round((selectedSurah.progress.end_ayah / selectedSurah.total_verses) * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="review-history">
                    <h4>سجل المراجعات</h4>
                    {selectedSurah.progress.review_history && selectedSurah.progress.review_history.length > 0 ? (
                      <div className="history-list">
                        {selectedSurah.progress.review_history
                          .sort((a, b) => new Date(b.date) - new Date(a.date))
                          .map((entry, idx) => (
                          <div key={idx} className="history-item">
                            <div className="history-date">
                              {new Date(entry.date).toLocaleDateString('ar-SA', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                            <div className="history-type">
                              🔄 {entry.type || 'مراجعة'}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="no-reviews">
                        <p>📝 لا يوجد مراجعات مسجلة بعد</p>
                        <p>ابدأ بمراجعة هذه السورة لتسجيل أول مراجعة</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="no-progress">
                  <h4>🚀 لم يتم البدء في هذه السورة بعد</h4>
                  <p>ابدأ بحفظ هذه السورة لرؤية السجل والإحصائيات</p>
                  <div className="surah-details">
                    <div className="detail-card">
                      <div className="detail-item">
                        <span className="detail-icon">📖</span>
                        <span className="detail-text">
                          <strong>عدد الآيات:</strong> 
                          <span className="highlight-verses">{selectedSurah.total_verses} آية</span>
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-icon">🏷️</span>
                        <span className="detail-text">
                          <strong>النوع:</strong> {selectedSurah.type}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </Modal>
      )}

      <style jsx>{`
        .add-memorization-form {
          padding: 20px;
        }
        
        .surah-info {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 10px;
          margin-bottom: 20px;
        }
        
        .surah-info h4 {
          margin: 0 0 15px 0;
          color: #2c3e50;
          text-align: center;
        }
        
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
        
        .info-item {
          display: flex;
          justify-content: space-between;
          padding: 8px;
          background: white;
          border-radius: 5px;
        }
        
        .label {
          font-weight: bold;
          color: #666;
        }
        
        .value {
          color: #2c3e50;
          font-weight: 600;
        }
        
        .form-section h4 {
          margin: 0 0 15px 0;
          color: #2c3e50;
        }
        
        .form-row {
          display: flex;
          gap: 15px;
          margin-bottom: 15px;
        }
        
        .form-group {
          flex: 1;
        }
        
        .form-group label {
          display: block;
          margin-bottom: 5px;
          font-weight: bold;
          color: #555;
        }
        
        .form-group input {
          width: 100%;
          padding: 10px;
          border: 2px solid #e1e8ed;
          border-radius: 8px;
          font-size: 1rem;
          transition: border-color 0.3s ease;
        }
        
        .form-group input:focus {
          outline: none;
          border-color: #667eea;
        }
        
        .disabled-input {
          background: #f8f9fa !important;
          color: #6c757d !important;
        }
        
        .progress-preview {
          margin: 15px 0;
          padding: 15px;
          background: #e8f5e8;
          border-radius: 8px;
          border: 1px solid #c3e6cb;
        }
        
        .preview-info {
          text-align: center;
        }
        
        .progress-bar {
          height: 8px;
          background: #dee2e6;
          border-radius: 4px;
          margin: 10px 0;
          overflow: hidden;
        }
        
        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #28a745, #20c997);
          transition: width 0.3s ease;
        }
        
        .progress-text {
          font-size: 0.9rem;
          color: #155724;
          font-weight: bold;
        }
        
        .action-buttons {
          display: flex;
          gap: 10px;
          margin-top: 20px;
        }
        
        .btn-save-part, .btn-save-complete {
          flex: 1;
          padding: 12px;
          border: none;
          border-radius: 8px;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .btn-save-part {
          background: linear-gradient(135deg, #17a2b8, #138496);
          color: white;
        }
        
        .btn-save-complete {
          background: linear-gradient(135deg, #28a745, #20c997);
          color: white;
        }
        
        .btn-save-part:hover, .btn-save-complete:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }
        
        .btn-save-part:disabled {
          background: #6c757d;
          cursor: not-allowed;
          transform: none;
        }
        
        .review-form {
          padding: 20px;
          text-align: center;
        }
        
        .review-info h4 {
          margin: 0 0 20px 0;
          color: #2c3e50;
        }
        
        .review-details {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 20px;
          text-align: right;
        }
        
        .review-details p {
          margin: 8px 0;
          color: #495057;
        }
        
        .btn-confirm-review {
          background: linear-gradient(135deg, #28a745, #20c997);
          color: white;
          border: none;
          padding: 15px 30px;
          border-radius: 25px;
          font-size: 1.1rem;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-bottom: 15px;
        }
        
        .btn-confirm-review:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 15px rgba(40, 167, 69, 0.4);
        }
        
        .review-note {
          color: #6c757d;
          font-size: 0.9rem;
          margin: 0;
        }
        
        .history-view {
          padding: 20px;
        }
        
        .history-content h4 {
          margin: 0 0 15px 0;
          color: #2c3e50;
          border-bottom: 2px solid #e9ecef;
          padding-bottom: 10px;
        }
        
        .status-card {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 10px;
          margin-bottom: 20px;
        }
        
        .status-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
        }
        
        .status-label {
          font-weight: bold;
          color: #666;
        }
        
        .status-value {
          color: #2c3e50;
          font-weight: 600;
        }
        
        .history-list {
          max-height: 300px;
          overflow-y: auto;
        }
        
        .history-item {
          background: white;
          border: 1px solid #e9ecef;
          border-radius: 8px;
          padding: 12px;
          margin-bottom: 10px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .history-date {
          color: #6c757d;
          font-size: 0.9rem;
        }
        
        .history-type {
          color: #28a745;
          font-weight: bold;
        }
        
        .no-reviews, .no-progress {
          text-align: center;
          padding: 30px;
          color: #6c757d;
        }
        
        .no-progress h4 {
          color: #2c3e50;
          margin-bottom: 15px;
        }
        
        .surah-details {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 8px;
          margin-top: 20px;
        }
        
        .surah-details p {
          margin: 8px 0;
          color: #495057;
        }
        
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
        
        .verse-count {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 0.85rem;
          font-weight: bold;
        }
        
        .quran-table td {
          vertical-align: middle;
        }
      `}</style>
    </div>
  );
}

export default DashboardPage;
