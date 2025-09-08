// src/pages/DashboardPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';

import Modal from '../components/Modal';
import ProgressStats from '../components/ProgressStats';
import ReviewReminder from '../components/ReviewReminder';
import AchievementSystem from '../components/AchievementSystem';

import { getSurahReadingUrl } from '../utils/readingLinks';
import SurahAudioButton from '../components/SurahAudioButton';
import SurahVideoPlayer from '../components/SurahVideoPlayer';

import AdhkarView from '../components/AdhkarView';
import { formatDateTime, getRelativeTime } from '../utils/dateUtils';

function DashboardPage() {
  const [memorizations, setMemorizations] = useState([]);
  const [surahs, setSurahs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState(null);
  const [selectedSurah, setSelectedSurah] = useState(null);
  const [addFormData, setAddFormData] = useState({ start_ayah: '', end_ayah: '' });
  const [viewMode, setViewMode] = useState('memorization');
  const [adhkarType, setAdhkarType] = useState('morning');
  const [dailyGoal, setDailyGoal] = useState(5); // هدف يومي: 5 آيات
  const [showSettings, setShowSettings] = useState(false);
  const [selectedSurahs, setSelectedSurahs] = useState(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [bulkAction, setBulkAction] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('Token not found');

      const config = { headers: { Authorization: `Token ${token}` } };
      const [surahsResponse, memoResponse] = await Promise.all([
        axios.get('https://quran-app-8ay9.onrender.com/api/surahs/', config),
        axios.get('https://quran-app-8ay9.onrender.com/api/memorization/', config),
      ]);

      setSurahs(surahsResponse.data);
      setMemorizations(memoResponse.data);
    } catch (e) {
      console.error(e);
      setError('حدث خطأ أثناء جلب البيانات. حاول تحديث الصفحة.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const surahProgressData = useMemo(() => {
    const progressMap = new Map(memorizations.map((memo) => [memo.surah, memo]));
    return surahs.map((surah) => {
      const progress = progressMap.get(surah.number);
      let statusText = 'لم يبدأ';
      let statusColor = '#6c757d';
      let isDone = false;

      if (progress) {
        if (progress.end_ayah >= surah.total_verses) {
          statusText = 'مُكتمل بحمد الله ✨';
          statusColor = '#28a745';
          isDone = true;
        } else {
          statusText = `الآية ${progress.end_ayah} من ${surah.total_verses}`;
          statusColor = '#007bff';
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

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedSurah(null);
    setModalMode(null);
  };

  const handleApiCall = async (method, url, data) => {
    const token = localStorage.getItem('authToken');
    const config = { headers: { Authorization: `Token ${token}` } };
    try {
      await axios[method](url, data, config);
      closeModal();
      fetchData();
    } catch (e) {
      console.error(e);
      alert('حدث خطأ أثناء حفظ البيانات.');
    }
  };

  const handleResetSurah = async (surah) => {
    if (
      !confirm(
        `هل أنت متأكد من إعادة تعيين حفظ سورة ${surah.name}؟\nسيتم حذف جميع البيانات المحفوظة لهذه السورة.`
      )
    ) {
      return;
    }

    const token = localStorage.getItem('authToken');
    const config = { headers: { Authorization: `Token ${token}` } };

    try {
      await axios.delete(
        `https://quran-app-8ay9.onrender.com/api/memorization/${surah.progress.id}/`,
        config
      );
      alert(`تم إعادة تعيين سورة ${surah.name} بنجاح! 🔄`);
      fetchData();
    } catch (error) {
      console.error(error);
      alert('حدث خطأ أثناء إعادة التعيين.');
    }
  };

  const handleBulkAction = async () => {
    if (selectedSurahs.size === 0) {
      alert('الرجاء اختيار سورة واحدة على الأقل');
      return;
    }

    if (!bulkAction) {
      alert('الرجاء اختيار إجراء');
      return;
    }

    const selectedSurahsList = Array.from(selectedSurahs)
      .map((num) => surahs.find((s) => s.number === num))
      .filter(Boolean);

    const surahNames = selectedSurahsList.map((s) => s.name).join('، ');

    if (!confirm(`هل أنت متأكد من تطبيق "${bulkAction}" على السور التالية:\n${surahNames}`)) {
      return;
    }

    const token = localStorage.getItem('authToken');
    const config = { headers: { Authorization: `Token ${token}` } };

    try {
      for (const surah of selectedSurahsList) {
        if (bulkAction === 'حفظ كامل') {
          const data = {
            surah: surah.number,
            start_ayah: 1,
            end_ayah: surah.total_verses,
          };
          const existingMemo = memorizations.find((m) => m.surah === surah.number);

          if (existingMemo) {
            await axios.patch(
              `https://quran-app-8ay9.onrender.com/api/memorization/${existingMemo.id}/`,
              data,
              config
            );
          } else {
            await axios.post('https://quran-app-8ay9.onrender.com/api/memorization/', data, config);
          }
        }
        else if (bulkAction === 'تسجيل مراجعة') {
          const existingMemo = memorizations.find((m) => m.surah === surah.number);
          if (existingMemo) {
            await axios.post(
              `https://quran-app-8ay9.onrender.com/api/memorization/${existingMemo.id}/add_review/`,
              {},
              config
            );
          }
        }
        else if (bulkAction === 'إعادة حفظ') {
          const existingMemo = memorizations.find((m) => m.surah === surah.number);
          if (existingMemo) {
            await axios.delete(
              `https://quran-app-8ay9.onrender.com/api/memorization/${existingMemo.id}/`,
              config
            );
          }
        }
      }

      alert(`تم تطبيق "${bulkAction}" على ${selectedSurahsList.length} سورة بنجاح! ✅`);
      setSelectedSurahs(new Set());
      setBulkAction('');
      setShowBulkActions(false);
      fetchData();
    } catch (error) {
      console.error(error);
      alert('حدث خطأ أثناء تطبيق الإجراء الجماعي.');
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
      setSelectedSurahs(new Set(surahs.map((s) => s.number)));
    }
  };

  const handleSaveMemorization = (isComplete = false) => {
    const end = isComplete
      ? selectedSurah.total_verses
      : parseInt(addFormData.end_ayah, 10);

    const startVerse = selectedSurah.progress?.end_ayah || 0;
    if (!isComplete && (isNaN(end) || end <= startVerse || end > selectedSurah.total_verses)) {
      alert('الرجاء إدخال رقم آية صحيح.');
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

    const token = localStorage.getItem('authToken');
    const config = { headers: { Authorization: `Token ${token}` } };

    axios
      .post(
        `https://quran-app-8ay9.onrender.com/api/memorization/${progress.id}/add_review/`,
        {},
        config
      )
      .then((response) => {
        closeModal();
        fetchData();

        // خلال الـ API المتوقع يرجّع review_entry
        const reviewData = response?.data?.review_entry;
        if (reviewData) {
          const message =
            `تم تسجيل المراجعة بنجاح! 🎉\n\n` +
            `📖 السورة: ${reviewData.surah_name}\n` +
            `📊 التقدم: ${reviewData.completion_percentage}%\n` +
            `🔢 الآيات: ${reviewData.verses_reviewed} من ${reviewData.total_verses}`;
          alert(message);
        } else {
          alert('تم تسجيل المراجعة بنجاح! 🎉');
        }
      })
      .catch((e) => {
        console.error(e);
        alert('حدث خطأ أثناء تسجيل المراجعة.');
      });
  };

  // ========== دالة تصدير تقرير الحفظ المُحسَّنة ==========
  const handleExportMemorizationReport = () => {
    try {
      // إنشاء البيانات مع حل أفضل للنصوص العربية
      const reportData = surahProgressData.map((surah, index) => {
        const memo = memorizations.find((m) => m.surah === surah.number);
        const progressPercentage = memo ? ((memo.end_ayah / surah.total_verses) * 100).toFixed(1) : '0';
        const reviewCount = memo && memo.reviews ? memo.reviews.length : (memo && memo.review_count) ? memo.review_count : 0;
        
        return [
          index + 1, // رقم تسلسلي
          surah.number, // رقم السورة
          surah.name, // اسم السورة بالعربية
          surah.type, // نوع السورة
          surah.total_verses, // عدد الآيات
          memo ? memo.end_ayah : 0, // الآيات المحفوظة
          `${progressPercentage}%`, // نسبة الإنجاز
          reviewCount, // عدد المراجعات
          surah.statusText // الحالة
        ];
      });

      // إنشاء محتوى CSV مع UTF-8 BOM
      const headers = [
        'التسلسل',
        'رقم السورة', 
        'اسم السورة',
        'النوع',
        'عدد الآيات',
        'الآيات المحفوظة',
        'نسبة الإنجاز',
        'عدد المراجعات',
        'الحالة'
      ];
      
      const csvContent = [
        headers.join(','),
        ...reportData.map(row => 
          row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
        )
      ].join('\n');

      // تحميل الملف مع BOM لدعم UTF-8
      const BOM = '\uFEFF';
      const blob = new Blob([BOM + csvContent], { 
        type: 'text/csv;charset=utf-8' 
      });
      
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      
      // إنشاء اسم ملف بالتاريخ الحالي
      const now = new Date();
      const dateStr = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
      const timeStr = `${now.getHours().toString().padStart(2, '0')}-${now.getMinutes().toString().padStart(2, '0')}`;
      const filename = `quran_memorization_report_${dateStr}_${timeStr}.csv`;
      
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      alert(`تم تصدير تقرير الحفظ بنجاح! 📊\nالملف: ${filename}`);
    } catch (error) {
      console.error('خطأ في التصدير:', error);
      alert('حدث خطأ أثناء تصدير التقرير. يرجى المحاولة مرة أخرى.');
    }
  };

  const onEditProfile = () => {
    try {
      const editUrl = `${window.location.origin}/edit-profile`;
      window.open(editUrl, '_self');
    } catch (error) {
      window.location.href = '/edit-profile';
    }
  };

  const onChangePassword = () => {
    try {
      const changePassUrl = `${window.location.origin}/change-password`;
      window.open(changePassUrl, '_self');
    } catch (error) {
      window.location.href = '/change-password';
    }
  };
  // ========== نهاية الإضافات الجديدة ==========

  if (loading) return <p>جاري التحميل...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="container">
      {viewMode === 'memorization' && (
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
        <button className="main-btn" onClick={() => setViewMode('memorization')}>
          📚 قائمة حفظ القرآن
        </button>
        <button className="main-btn" onClick={() => setViewMode('adhkarMenu')}>
          🕌 أذكار المسلم
        </button>
        <button
          className="main-btn bulk-actions"
          onClick={() => setShowBulkActions(!showBulkActions)}
        >
          📚 اجراء جماعي ({selectedSurahs.size})
        </button>
        <button className="main-btn settings" onClick={() => setShowSettings(!showSettings)}>
          ⚙️ الإعدادات
        </button>
      </div>

      {/* إجراءات جماعية */}
      {showBulkActions && viewMode === 'memorization' && (
        <div className="bulk-actions-panel">
          <div className="bulk-header">
            <h3>📚 اجراء جماعي</h3>
            <div className="bulk-controls">
              <button className="select-all-btn" onClick={selectAllSurahs}>
                {selectedSurahs.size === surahs.length ? 'إلغاء تحديد الكل' : 'تحديد الكل'}
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
              <option value="تسجيل مراجعة">🔄 تسجيل مراجعة للسور المحددة</option>
              <option value="إعادة حفظ">🗑️ إزالة الحفظ للسور المحددة</option>
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
                setBulkAction('');
              }}
            >
              إلغاء
            </button>
          </div>
        </div>
      )}

      {/* إعدادات سريعة مع إزالة تصدير البيانات JSON */}
      {showSettings && (
        <div className="settings-panel">
          <h3>⚙️ الإعدادات</h3>
          <div className="setting-item">
            <label>الهدف اليومي (عدد الآيات):</label>
            <input
              type="number"
              value={dailyGoal}
              onChange={(e) => setDailyGoal(parseInt(e.target.value, 10) || 5)}
              min="1"
              max="50"
            />
          </div>
          <div className="setting-item">
            <button onClick={handleExportMemorizationReport} style={{ backgroundColor: '#28a745' }}>
              📊 تصدير تقرير الحفظ
            </button>
          </div>
          <div className="setting-item">
            <button onClick={onEditProfile} style={{ backgroundColor: '#007bff' }}>
              👤 تعديل البيانات الشخصية
            </button>
          </div>
          <div className="setting-item">
            <button onClick={onChangePassword} style={{ backgroundColor: '#6f42c1' }}>
              🔐 تغيير كلمة المرور
            </button>
          </div>
        </div>
      )}

      {viewMode === 'adhkarMenu' && (
        <div className="adhkar-menu-page">
          <h2>اختر قسم الأذكار</h2>
          <div className="adhkar-btn-list">
            <button
              onClick={() => {
                setAdhkarType('morning');
                setViewMode('adhkar');
              }}
            >
              🌅 أذكار الصباح
            </button>
            <button
              onClick={() => {
                setAdhkarType('evening');
                setViewMode('adhkar');
              }}
            >
              🌇 أذكار المساء
            </button>
            <button
              onClick={() => {
                setAdhkarType('sleep');
                setViewMode('adhkar');
              }}
            >
              🌙 أذكار النوم
            </button>
            <button
              onClick={() => {
                setAdhkarType('other');
                setViewMode('adhkar');
              }}
            >
              🕌 أذكار أخرى
            </button>
          </div>
          <button className="back-btn" onClick={() => setViewMode('memorization')}>
            ← رجوع
          </button>
        </div>
      )}

      {viewMode === 'adhkar' && (
        <AdhkarView type={adhkarType} onBack={() => setViewMode('adhkarMenu')} />
      )}

      {viewMode === 'memorization' && (
        <div className="table-container">
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
                <th>فيديو</th>
                <th>تفسير</th>
                <th>إجراء</th>
                <th>إعادة</th>
                <th>السجل</th>
              </tr>
            </thead>
            <tbody>
              {surahProgressData.map((surah) => (
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
                      onClick={() =>
                        window.open(getSurahReadingUrl(surah.number), '_blank', 'noopener,noreferrer')
                      }
                      title={`قراءة سورة ${surah.name}`}
                    >
                      📖
                    </button>
                  </td>
                  <td>
                    <SurahAudioButton surahNumber={surah.number} surahName={surah.name} />
                  </td>
                  <td>
                    <SurahVideoPlayer surahNumber={surah.number} surahName={surah.name} />
                  </td>
                  <td>
                    <button
                      className="action-btn tafsir-btn"
                      onClick={() =>
                        window.open(
                          `https://quran.com/ar/${surah.number}:1/tafsirs/ar-tafsir-muyassar`,
                          '_blank',
                          'noopener,noreferrer'
                        )
                      }
                      title={`تفسير سورة ${surah.name}`}
                    >
                      📚
                    </button>
                  </td>
                  <td>
                    {surah.isDone ? (
                      <button className="btn-modern review" onClick={() => openModal(surah, 'review')}>
                        🔄 مراجعة
                      </button>
                    ) : (
                      <button className="btn-modern add" onClick={() => openModal(surah, 'add')}>
                        ➕ أضف
                      </button>
                    )}
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
        </div>
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
                    <span className="value highlight-verses">
                      {selectedSurah.total_verses} آية
                    </span>
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
                      onChange={(e) =>
                        setAddFormData({ ...addFormData, end_ayah: e.target.value })
                      }
                      placeholder={`أدخل رقم من ${addFormData.start_ayah} إلى ${selectedSurah.total_verses}`}
                      min={addFormData.start_ayah}
                      max={selectedSurah.total_verses}
                    />
                  </div>
                </div>

                <div className="progress-preview">
                  {addFormData.end_ayah && (
                    <div className="preview-info">
                      <span>
                        ستحفظ:{' '}
                        {parseInt(addFormData.end_ayah, 10) -
                          parseInt(addFormData.start_ayah, 10) +
                          1}{' '}
                        آية
                      </span>
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{
                            width: `${
                              (parseInt(addFormData.end_ayah, 10) /
                                (selectedSurah.total_verses || 1)) *
                              100
                            }%`,
                          }}
                        ></div>
                      </div>
                      <span className="progress-text">
                        {Math.round(
                          (parseInt(addFormData.end_ayah, 10) /
                            (selectedSurah.total_verses || 1)) *
                            100
                        )}
                        % من السورة
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
                <button className="btn-save-complete" onClick={() => handleSaveMemorization(true)}>
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
                    <span className="detail-value highlight-verses">
                      {selectedSurah.total_verses} آية
                    </span>
                  </div>
                  <div className="review-detail-item">
                    <span className="detail-label">✅ محفوظ حتى:</span>
                    <span className="detail-value">الآية {selectedSurah.progress?.end_ayah}</span>
                  </div>
                  <div className="review-detail-item">
                    <span className="detail-label">📊 نسبة الإكمال:</span>
                    <span className="detail-value">
                      {Math.round(
                        ((selectedSurah.progress?.end_ayah || 0) /
                          (selectedSurah.total_verses || 1)) *
                          100
                      )}
                      %
                    </span>
                  </div>
                  {selectedSurah.progress?.last_review_date && (
                    <div className="review-detail-item">
                      <span className="detail-label">🕐 آخر مراجعة:</span>
                      <span className="detail-value">
                        {formatDateTime(selectedSurah.progress.last_review_date).full}
                        <br />
                        <small style={{ color: '#6c757d', fontSize: '0.8rem' }}>
                          ({getRelativeTime(selectedSurah.progress.last_review_date)})
                        </small>
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="review-actions">
                <button className="btn-confirm-review" onClick={handleReview}>
                  ✅ تأكيد المراجعة
                </button>
                <p className="review-note">سيتم تسجيل هذه المراجعة في سجل المراجعات الخاص بك</p>
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
                        <span className="status-value">
                          الآية {selectedSurah.progress.end_ayah} من {selectedSurah.total_verses}
                        </span>
                      </div>
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{
                            width: `${
                              (selectedSurah.progress.end_ayah /
                                (selectedSurah.total_verses || 1)) *
                              100
                            }%`,
                          }}
                        ></div>
                      </div>
                      <div className="status-item">
                        <span className="status-label">نسبة الإكمال:</span>
                        <span className="status-value">
                          {Math.round(
                            (selectedSurah.progress.end_ayah /
                              (selectedSurah.total_verses || 1)) *
                              100
                          )}
                          %
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="review-history">
                    <h4>سجل المراجعات</h4>
                    {selectedSurah.progress.review_history &&
                    selectedSurah.progress.review_history.length > 0 ? (
                      <div className="history-list">
                        {selectedSurah.progress.review_history
                          .sort((a, b) => new Date(b.date) - new Date(a.date))
                          .map((entry, idx) => (
                            <div key={idx} className="history-item">
                              <div className="history-info">
                                <div className="history-date">
                                  📅 {formatDateTime(entry.date).gregorian}
                                </div>
                                <div className="history-time">
                                  🕐 {formatDateTime(entry.date).time}
                                </div>
                                <div className="history-relative">{getRelativeTime(entry.date)}</div>
                              </div>
                              <div className="history-type">🔄 {entry.type || 'مراجعة'}</div>
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
        .container {
          max-width: 100%;
          margin: 0 auto;
          padding: 20px;
        }

        .table-container {
          overflow-x: auto;
          margin: 20px 0;
          border-radius: 12px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }

        .quran-table {
          width: 100%;
          border-collapse: collapse;
          background: white;
          font-size: 0.9rem;
          min-width: 1200px;
        }

        .quran-table thead {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
        }

        .quran-table th,
        .quran-table td {
          padding: 12px 8px;
          text-align: center;
          border-bottom: 1px solid #e9ecef;
          vertical-align: middle;
        }

        .quran-table th {
          font-weight: bold;
          font-size: 0.85rem;
          white-space: nowrap;
        }

        .completed-row {
          background: linear-gradient(135deg, #d4ffe4, #a8f5bc);
        }

        .verse-count {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          padding: 6px 12px;
          border-radius: 15px;
          font-size: 0.8rem;
          font-weight: bold;
          white-space: nowrap;
          display: inline-block;
          min-width: 80px;
        }

        .action-btn {
          padding: 8px 12px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 1.1rem;
          transition: all 0.3s ease;
          background: linear-gradient(135deg, #3498db, #2980b9);
          color: white;
          border: 1px solid transparent;
        }

        .read-btn {
          background: linear-gradient(135deg, #17a2b8, #138496);
        }

        .tafsir-btn {
          background: linear-gradient(135deg, #6f42c1, #5a32a3);
        }

        .action-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }

        .video-btn {
          padding: 8px 12px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 0.85rem;
          font-weight: 600;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 5px;
          min-width: 120px;
          justify-content: center;
          white-space: nowrap;
          position: relative;
        }

        .video-btn.new {
          background: linear-gradient(135deg, #e74c3c, #c0392b);
          color: white;
          box-shadow: 0 2px 4px rgba(231, 76, 60, 0.3);
        }

        .video-btn.viewed {
          background: linear-gradient(135deg, #27ae60, #2ecc71);
          color: white;
          box-shadow: 0 2px 4px rgba(39, 174, 96, 0.3);
        }

        .video-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }

        .video-btn:disabled {
          background: #95a5a6;
          cursor: not-allowed;
          transform: none;
          color: #7f8c8d;
        }

        .video-btn .icon {
          font-size: 1rem;
          flex-shrink: 0;
        }

        .video-btn .text {
          font-size: 0.8rem;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .video-btn .cache-indicator {
          position: absolute;
          top: -5px;
          right: -5px;
          font-size: 0.7rem;
          background: rgba(255, 255, 255, 0.9);
          border-radius: 50%;
          width: 16px;
          height: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .btn-modern {
          padding: 8px 12px;
          border: none;
          border-radius: 8px;
          color: #fff;
          cursor: pointer;
          font-weight: 600;
          font-size: 0.8rem;
          transition: all 0.3s ease;
          white-space: nowrap;
        }

        .btn-modern.add {
          background: linear-gradient(135deg, #00b894, #00a085);
        }

        .btn-modern.review {
          background: linear-gradient(135deg, #1e88e5, #1565c0);
        }

        .btn-modern.reset {
          background: linear-gradient(135deg, #e74c3c, #c0392b);
        }

        .btn-modern.history {
          background: linear-gradient(135deg, #ff9800, #f57c00);
        }

        .btn-modern:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        .btn-modern:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }

        .surah-checkbox {
          transform: scale(1.2);
          margin: 0;
        }

        .top-bar {
          display: flex;
          gap: 10px;
          margin-bottom: 1rem;
          flex-wrap: wrap;
        }

        .main-btn {
          flex: 1;
          padding: 14px;
          font-size: 0.95rem;
          font-weight: bold;
          background: linear-gradient(135deg, #1e88e5, #3949ab);
          color: #fff;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          min-width: 150px;
        }

        .main-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(30, 136, 229, 0.4);
        }

        .main-btn.settings {
          background: linear-gradient(135deg, #6c757d, #495057);
          flex: 0.5;
        }

        .bulk-actions-panel {
          background: white;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 20px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
          border: 2px solid #e9ecef;
        }

        .bulk-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
          flex-wrap: wrap;
          gap: 10px;
        }

        .bulk-header h3 {
          margin: 0;
          color: #495057;
        }

        .bulk-controls {
          display: flex;
          align-items: center;
          gap: 15px;
          flex-wrap: wrap;
        }

        .select-all-btn {
          background: linear-gradient(135deg, #6f42c1, #5a32a3);
          color: white;
          border: none;
          padding: 8px 12px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: bold;
          font-size: 0.9rem;
        }

        .selected-count {
          color: #495057;
          font-weight: bold;
        }

        .bulk-actions-row {
          display: flex;
          gap: 10px;
          align-items: center;
          flex-wrap: wrap;
        }

        .bulk-action-select {
          flex: 1;
          padding: 10px;
          border: 2px solid #e1e8ed;
          border-radius: 8px;
          font-size: 1rem;
          background: white;
          min-width: 200px;
        }

        .apply-bulk-btn {
          background: linear-gradient(135deg, #28a745, #20c997);
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: bold;
        }

        .apply-bulk-btn:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        .cancel-bulk-btn {
          background: linear-gradient(135deg, #dc3545, #c82333);
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: bold;
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
          flex-wrap: wrap;
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
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: bold;
          transition: all 0.3s ease;
        }

        .setting-item button:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }

        .adhkar-btn-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .adhkar-btn-list button {
          padding: 14px;
          background: linear-gradient(135deg, #00b894, #00a085);
          color: #fff;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: bold;
        }

        .back-btn {
          margin-top: 20px;
          padding: 12px;
          background: #636e72;
          color: #fff;
          border: none;
          border-radius: 8px;
          cursor: pointer;
        }

        /* Modal Styles */
        .add-memorization-form,
        .review-form,
        .history-view {
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

        .highlight-verses {
          color: #28a745 !important;
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

        .btn-save-part,
        .btn-save-complete {
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

        .btn-save-part:hover,
        .btn-save-complete:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }

        .btn-save-part:disabled {
          background: #6c757d;
          cursor: not-allowed;
          transform: none;
        }

        .review-form {
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

        .review-detail-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
        }

        .detail-label {
          font-weight: bold;
          color: #666;
        }

        .detail-value {
          color: #2c3e50;
          font-weight: 600;
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
          transition: all 0.2s ease;
        }

        .history-item:hover {
          background: #f8f9fa;
          transform: translateX(-2px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .history-info {
          flex: 1;
          text-align: right;
        }

        .history-date {
          color: #2c3e50;
          font-weight: bold;
          font-size: 0.9rem;
          margin-bottom: 4px;
        }

        .history-time {
          color: #495057;
          font-size: 0.85rem;
          margin-bottom: 2px;
        }

        .history-relative {
          color: #6c757d;
          font-size: 0.8rem;
          font-style: italic;
        }

        .history-type {
          color: #28a745;
          font-weight: bold;
          background: #e8f5e8;
          padding: 6px 12px;
          border-radius: 15px;
          font-size: 0.85rem;
        }

        .no-reviews,
        .no-progress {
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

        .detail-card {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .detail-item {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .detail-icon {
          font-size: 1.2em;
        }

        .detail-text {
          display: flex;
          align-items: center;
          gap: 5px;
        }

        /* تحسينات للجوال */
        @media (max-width: 768px) {
          .container {
            padding: 10px;
          }

          .quran-table {
            font-size: 0.8rem;
          }

          .quran-table th,
          .quran-table td {
            padding: 8px 4px;
          }

          .verse-count {
            font-size: 0.7rem;
            padding: 4px 6px;
          }

          .btn-modern {
            font-size: 0.7rem;
            padding: 6px 8px;
          }

          .action-btn {
            font-size: 1rem;
            padding: 6px 8px;
          }

          .video-btn {
            min-width: 100px;
            font-size: 0.75rem;
          }

          .top-bar {
            flex-direction: column;
          }

          .main-btn {
            min-width: auto;
            width: 100%;
          }

          .bulk-actions-row {
            flex-direction: column;
            align-items: stretch;
          }

          .bulk-action-select {
            min-width: auto;
            width: 100%;
          }
        }

        @media (max-width: 480px) {
          .quran-table {
            font-size: 0.7rem;
            min-width: 900px;
          }

          .info-grid {
            grid-template-columns: 1fr;
          }

          .form-row {
            flex-direction: column;
          }

          .action-buttons {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}

export default DashboardPage;
