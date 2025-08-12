import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import Modal from '../components/Modal';
import { ENDPOINTS } from '../config'; // ✅ استيراد المسارات من config.js

function DashboardPage() {
  const [memorizations, setMemorizations] = useState([]);
  const [surahs, setSurahs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState(null);
  const [selectedSurah, setSelectedSurah] = useState(null);
  const [addFormData, setAddFormData] = useState({ start_ayah: '', end_ayah: '' });

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error("Token not found");
      const config = { headers: { Authorization: `Token ${token}` } };

      const [surahsResponse, memoResponse] = await Promise.all([
        axios.get(ENDPOINTS.surahs, config),
        axios.get(ENDPOINTS.memorization, config)
      ]);

      setSurahs(surahsResponse.data);
      setMemorizations(memoResponse.data);

    } catch (err) {
      console.error(err);
      setError("حدث خطأ أثناء جلب البيانات. حاول تحديث الصفحة.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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

  const stats = useMemo(() => {
    const completed = surahProgressData.filter(s => s.isDone).length;
    const inProgress = surahProgressData.filter(s => s.progress && !s.isDone).length;
    const totalVerses = memorizations.reduce((sum, m) => sum + m.end_ayah, 0);
    const currentSurah = surahProgressData.find(s => s.progress && !s.isDone);
    return { completed, inProgress, totalVerses, currentSurah };
  }, [surahProgressData, memorizations]);

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
    } catch (err) {
      console.error(err);
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
      ? `${ENDPOINTS.memorization}${selectedSurah.progress.id}/`
      : ENDPOINTS.memorization;

    const method = selectedSurah.progress ? 'patch' : 'post';
    handleApiCall(method, url, data);
  };

  const handleReview = () => {
    const { progress } = selectedSurah;
    if (!progress) return;

    const now = new Date();
    const newHistory = [...(progress.review_history || []), { date: now.toISOString() }];
    const data = { review_history: newHistory, last_review_date: now.toISOString() };

    handleApiCall('patch', `${ENDPOINTS.memorization}${progress.id}/`, data);
  };

  if (loading) return <p>جاري تحميل رحلة حفظك للقرآن الكريم...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="dashboard-table-view">
      <h1>لوحة متابعة الحفظ</h1>

      <div className="stats">
        <p>✅ مكتمل: {stats.completed}</p>
        <p>📖 جاري الحفظ: {stats.inProgress}</p>
        <p>📜 مجموع الآيات المحفوظة: {stats.totalVerses}</p>
      </div>

      <div className="table-responsive">
        <table className="quran-table">
          <thead>
            <tr>
              <th>رقم</th>
              <th>اسم السورة</th>
              <th>النوع</th>
              <th>عدد الآيات</th>
              <th>الحالة</th>
              <th>إجراء</th>
            </tr>
          </thead>
          <tbody>
            {surahProgressData.map(surah => (
              <tr key={surah.number}>
                <td>{surah.number}</td>
                <td className="surah-name">{surah.name}</td>
                <td>{surah.type}</td>
                <td>{surah.total_verses}</td>
                <td style={{ color: surah.statusColor }}>{surah.statusText}</td>
                <td>
                  {surah.isDone ? (
                    <button
                      className="btn btn-history"
                      onClick={() => openModal(surah, 'history')}
                    >
                      مراجعات
                    </button>
                  ) : (
                    <button
                      className="btn btn-add"
                      onClick={() => openModal(surah, 'add')}
                    >
                      إضافة حفظ
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && selectedSurah && (
        <Modal onClose={closeModal} title={modalMode === 'add' ? 'إضافة حفظ' : 'سجل المراجعات'}>
          {modalMode === 'add' && (
            <div className="form-vertical">
              <div className="form-group">
                <label>إلى الآية:</label>
                <input
                  type="number"
                  value={addFormData.end_ayah}
                  onChange={(e) => setAddFormData({ ...addFormData, end_ayah: e.target.value })}
                  min={addFormData.start_ayah}
                  max={selectedSurah.total_verses}
                />
              </div>
              <div className="modal-actions">
                <button className="btn btn-primary" onClick={() => handleSaveMemorization(false)}>حفظ</button>
                <button className="btn btn-success" onClick={() => handleSaveMemorization(true)}>إكمال السورة</button>
              </div>
            </div>
          )}

          {modalMode === 'history' && (
            <div>
              <h3>سجل المراجعات:</h3>
              {selectedSurah.progress?.review_history?.length > 0 ? (
                <ul>
                  {selectedSurah.progress.review_history.map((rev, i) => (
                    <li key={i}>{new Date(rev.date).toLocaleString('ar-EG')}</li>
                  ))}
                </ul>
              ) : (
                <p>📝 لا توجد مراجعات مسجلة بعد</p>
              )}
              <div className="modal-actions">
                <button className="btn btn-warning" onClick={handleReview}>إضافة مراجعة</button>
              </div>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}

export default DashboardPage;
