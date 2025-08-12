import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import Modal from '../components/Modal';

function DashboardPage() {
    const [userName, setUserName] = useState(""); 
    const [memorizations, setMemorizations] = useState([]);
    const [surahs, setSurahs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState(null);
    const [selectedSurah, setSelectedSurah] = useState(null);
    const [addFormData, setAddFormData] = useState({ start_ayah: '', end_ayah: '' });

    const fetchUser = async () => {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) return;
            const config = { headers: { Authorization: `Token ${token}` } };
            const res = await axios.get('https://quran-app-8ay9.onrender.com/api/auth/user/', config);
            setUserName(res.data.full_name || res.data.username || res.data.email);
        } catch (err) {
            console.error("Error fetching user:", err);
        }
    };

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
        } catch (err) { 
            setError("حدث خطأ أثناء جلب البيانات. حاول تحديث الصفحة.");
        } finally { 
            setLoading(false); 
        }
    };

    useEffect(() => { 
        fetchUser();
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
            ? `https://quran-app-8ay9.onrender.com/api/memorization/${selectedSurah.progress.id}/` 
            : 'https://quran-app-8ay9.onrender.com/api/memorization/';
        const method = selectedSurah.progress ? 'patch' : 'post';
        handleApiCall(method, url, data);
    };

    const handleReview = () => {
        const { progress } = selectedSurah; 
        if (!progress) return;
        const now = new Date();
        const newHistory = [...(progress.review_history || []), { date: now.toISOString() }];
        const data = { review_history: newHistory, last_review_date: now.toISOString() };
        handleApiCall('patch', `https://quran-app-8ay9.onrender.com/api/memorization/${progress.id}/`, data);
    };

    if (loading) return (
        <div className="container">
            <div className="loading-container">
                <img src="/quran-logo.png" alt="القرآن الكريم" className="loading-logo" />
                <p>جاري تحميل رحلة حفظك للقرآن الكريم...</p>
            </div>
        </div>
    );

    if (error) return <div className="container"><p className="error-message">{error}</p></div>;

    return (
        <>
            <div className="container quran-dashboard">
                <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>
                    السلام عليكم {userName ? userName : "ضيفنا العزيز"} 🌸
                </h2>

                {/* ... ضع هنا باقي الصفحة: الإحصائيات، السورة الجارية، جدول السور، المودال ... */}

            </div>

            {isModalOpen && selectedSurah && (
                <Modal 
                    onClose={closeModal} 
                    title={
                        modalMode === 'add' ? `📝 إضافة حفظ - سورة ${selectedSurah.name}` : 
                        modalMode === 'history' ? `📊 سجل - سورة ${selectedSurah.name}` : 
                        `🔄 مراجعة - سورة ${selectedSurah.name}`
                    }
                >
                    {modalMode === 'add' && (
                        <div className="form-vertical">
                            <div className="form-group">
                                <label>من الآية:</label>
                                <input type="number" value={addFormData.start_ayah} disabled />
                            </div>
                            <div className="form-group">
                                <label>إلى الآية:</label>
                                <input 
                                    type="number" 
                                    value={addFormData.end_ayah} 
                                    onChange={e => setAddFormData({ ...addFormData, end_ayah: e.target.value })} 
                                    placeholder={`أدخل رقم حتى ${selectedSurah.total_verses}`} 
                                />
                            </div>
                            <div className="modal-actions">
                                <button onClick={() => handleSaveMemorization()} className="btn-primary">
                                    💾 حفظ الجزء
                                </button>
                                <button onClick={() => handleSaveMemorization(true)} className="btn-success">
                                    ✨ حفظ السورة كاملة
                                </button>
                            </div>
                        </div>
                    )}
                    {modalMode === 'review' && (
                        <div className="review-modal">
                            <div className="review-icon">🤲</div>
                            <p>هل أنت متأكد من تسجيل مراجعة جديدة لهذه السورة الكريمة؟</p>
                            <div className="modal-actions">
                                <button onClick={handleReview} className="btn-primary">
                                    ✅ نعم، سجل المراجعة
                                </button>
                                <button onClick={closeModal} className="btn-secondary">
                                    ❌ إلغاء
                                </button>
                            </div>
                        </div>
                    )}
                    {modalMode === 'history' && (
                        <div>
                            <h4>📊 تقدم الحفظ:</h4>
                            {selectedSurah.progress ? (
                                <div className="history-progress">
                                    <p>
                                        🎯 لقد حفظت من الآية <strong>1</strong> 
                                        إلى الآية <strong>{selectedSurah.progress.end_ayah}</strong>
                                    </p>
                                    <div className="mini-progress-bar">
                                        <div 
                                            className="mini-progress-fill" 
                                            style={{ 
                                                width: `${(selectedSurah.progress.end_ayah / selectedSurah.total_verses) * 100}%` 
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            ) : (
                                <p>🚀 لم يتم البدء في حفظ هذه السورة بعد</p>
                            )}
                            <hr />
                            <h4>📅 سجل المراجعات:</h4>
                            {selectedSurah.progress?.review_history?.length > 0 ? (
                                <ul className="history-list">
                                    {selectedSurah.progress.review_history.map((rev, i) => (
                                        <li key={i}>
                                            🕐 {new Date(rev.date).toLocaleString('ar-EG', { 
                                                dateStyle: 'long', 
                                                timeStyle: 'short' 
                                            })}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p>📝 لا توجد مراجعات مسجلة بعد</p>
                            )}
                        </div>
                    )}
                </Modal>
            )}
        </>
    );
}

export default DashboardPage;
