// src/pages/DashboardPage.jsx (النسخة الجديدة - واجهة ملهمة)

import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import Modal from '../components/Modal';

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
                axios.get('http://127.0.0.1:8000/api/surahs/', config),
                axios.get('http://127.0.0.1:8000/api/memorization/', config)
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

    // حساب الإحصائيات الرئيسية
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
        const url = selectedSurah.progress ? `http://127.0.0.1:8000/api/memorization/${selectedSurah.progress.id}/` : 'http://127.0.0.1:8000/api/memorization/';
        const method = selectedSurah.progress ? 'patch' : 'post';
        handleApiCall(method, url, data);
    };

    const handleReview = () => {
        const { progress } = selectedSurah; 
        if (!progress) return;
        const now = new Date();
        const newHistory = [...(progress.review_history || []), { date: now.toISOString() }];
        const data = { review_history: newHistory, last_review_date: now.toISOString() };
        handleApiCall('patch', `http://127.0.0.1:8000/api/memorization/${progress.id}/`, data);
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
                {/* Header الجديد */}
                <div className="hero-section">
                    <div className="hero-content">
                        <img src="/quran-logo.png" alt="القرآن الكريم" className="hero-logo" />
                        <h1 className="hero-title">حفظ القرآن الكريم</h1>
                        <p className="hero-subtitle">
                            ﴿ وَلَقَدْ يَسَّرْنَا الْقُرْآنَ لِلذِّكْرِ فَهَلْ مِن مُّدَّكِرٍ ﴾
                        </p>
                        <div className="hero-verse-ref">سورة القمر - الآية 17</div>
                    </div>
                </div>

                {/* إحصائيات الرحلة */}
                <div className="journey-stats">
                    <h2 className="section-title">🌟 رحلتك مع القرآن الكريم</h2>
                    <div className="stats-grid">
                        <div className="stat-card completed">
                            <div className="stat-icon">✨</div>
                            <div className="stat-number">{stats.completed}</div>
                            <div className="stat-label">سورة مُكتملة</div>
                        </div>
                        <div className="stat-card progress">
                            <div className="stat-icon">📖</div>
                            <div className="stat-number">{stats.inProgress}</div>
                            <div className="stat-label">سورة قيد الحفظ</div>
                        </div>
                        <div className="stat-card verses">
                            <div className="stat-icon">🔢</div>
                            <div className="stat-number">{stats.totalVerses}</div>
                            <div className="stat-label">آية محفوظة</div>
                        </div>
                    </div>
                </div>

                {/* السورة الحالية */}
                {stats.currentSurah && (
                    <div className="current-surah-section">
                        <h2 className="section-title">📚 السورة الجارية</h2>
                        <div className="current-surah-card">
                            <div className="surah-info">
                                <h3 className="surah-name">سورة {stats.currentSurah.name}</h3>
                                <div className="surah-details">
                                    <span className="surah-type">{stats.currentSurah.type}</span>
                                    <span className="surah-number">رقم {stats.currentSurah.number}</span>
                                </div>
                                <div className="progress-info">
                                    <p>تقدمك الحالي: <strong>{stats.currentSurah.progress.end_ayah}</strong> من <strong>{stats.currentSurah.total_verses}</strong> آية</p>
                                    <div className="progress-bar">
                                        <div className="progress-fill" style={{ 
                                            width: `${(stats.currentSurah.progress.end_ayah / stats.currentSurah.total_verses) * 100}%` 
                                        }}></div>
                                    </div>
                                    <div className="progress-percentage">
                                        {Math.round((stats.currentSurah.progress.end_ayah / stats.currentSurah.total_verses) * 100)}%
                                    </div>
                                </div>
                            </div>
                            <div className="surah-actions">
                                <button 
                                    onClick={() => openModal(stats.currentSurah, 'add')} 
                                    className="btn-primary"
                                >
                                    📝 أضف المزيد
                                </button>
                                <button 
                                    onClick={() => openModal(stats.currentSurah, 'history')} 
                                    className="btn-secondary"
                                >
                                    📊 السجل
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* جدول السور */}
                <div className="surahs-section">
                    <h2 className="section-title">📋 جميع السور الكريمة</h2>
                    <div className="table-responsive">
                        <table className="quran-table">
                            <thead>
                                <tr>
                                    <th>رقم</th>
                                    <th>اسم السورة</th>
                                    <th>النوع</th>
                                    <th>الآيات</th>
                                    <th>الحالة</th>
                                    <th>إجراء</th>
                                    <th>السجل</th>
                                </tr>
                            </thead>
                            <tbody>
                                {surahProgressData.map(surah => (
                                    <tr key={surah.number} className={surah.isDone ? 'completed-row' : ''}>
                                        <td>{surah.number}</td>
                                        <td className="surah-name">{surah.name}</td>
                                        <td>
                                            <span className={`type-badge ${surah.type === 'مدنية' ? 'madni' : 'makki'}`}>
                                                {surah.type}
                                            </span>
                                        </td>
                                        <td>{surah.total_verses}</td>
                                        <td style={{ color: surah.statusColor, fontWeight: 'bold' }}>
                                            {surah.statusText}
                                        </td>
                                        <td>
                                            {surah.isDone ? (
                                                <button 
                                                    onClick={() => openModal(surah, 'review')} 
                                                    className="btn-action btn-review"
                                                >
                                                    🔄 مراجعة
                                                </button>
                                            ) : (
                                                <button 
                                                    onClick={() => openModal(surah, 'add')} 
                                                    className="btn-action btn-add"
                                                >
                                                    ➕ أضف
                                                </button>
                                            )}
                                        </td>
                                        <td>
                                            <button 
                                                onClick={() => openModal(surah, 'history')} 
                                                className="btn-action btn-history" 
                                                disabled={!surah.progress}
                                            >
                                                📈 السجل
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal للإضافة والتعديل */}
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
                                <input 
                                    type="number" 
                                    value={addFormData.start_ayah} 
                                    disabled 
                                />
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
                                <button 
                                    onClick={() => handleSaveMemorization()} 
                                    className="btn-primary"
                                >
                                    💾 حفظ الجزء
                                </button>
                                <button 
                                    onClick={() => handleSaveMemorization(true)} 
                                    className="btn-success"
                                >
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
                                <button 
                                    onClick={handleReview} 
                                    className="btn-primary"
                                >
                                    ✅ نعم، سجل المراجعة
                                </button>
                                <button 
                                    onClick={closeModal} 
                                    className="btn-secondary"
                                >
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
                                        🎯 لقد حفظت من الآية <strong>1</strong> إلى الآية <strong>{selectedSurah.progress.end_ayah}</strong>
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
                            {selectedSurah.progress?.review_history && selectedSurah.progress.review_history.length > 0 ? (
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
            
            {/* التنسيقات الجديدة */}
            <style jsx>{`
                .quran-dashboard {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 20px;
                }

                .loading-container {
                    text-align: center;
                    padding: 50px 20px;
                }

                .loading-logo {
                    width: 80px;
                    height: 80px;
                    animation: pulse 2s infinite;
                }

                @keyframes pulse {
                    0%, 100% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.1); opacity: 0.7; }
                }

                .hero-section {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 60px 30px;
                    border-radius: 20px;
                    text-align: center;
                    margin-bottom: 40px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
                }

                .hero-content {
                    max-width: 600px;
                    margin: 0 auto;
                }

                .hero-logo {
                    width: 100px;
                    height: 100px;
                    margin-bottom: 20px;
                    filter: drop-shadow(0 5px 15px rgba(0,0,0,0.3));
                }

                .hero-title {
                    font-size: 2.8rem;
                    font-weight: bold;
                    margin: 20px 0;
                    text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
                }

                .hero-subtitle {
                    font-size: 1.4rem;
                    margin: 20px 0;
                    font-style: italic;
                    opacity: 0.95;
                    line-height: 1.6;
                }

                .hero-verse-ref {
                    font-size: 0.9rem;
                    opacity: 0.8;
                    margin-top: 10px;
                }

                .section-title {
                    font-size: 1.8rem;
                    color: #2c3e50;
                    margin: 40px 0 25px 0;
                    text-align: center;
                    position: relative;
                }

                .section-title::after {
                    content: '';
                    display: block;
                    width: 60px;
                    height: 3px;
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    margin: 10px auto;
                    border-radius: 2px;
                }

                .journey-stats {
                    margin-bottom: 40px;
                }

                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 25px;
                    margin-bottom: 30px;
                }

                .stat-card {
                    background: white;
                    padding: 30px 20px;
                    border-radius: 15px;
                    text-align: center;
                    box-shadow: 0 8px 25px rgba(0,0,0,0.1);
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                    border: 1px solid #f0f0f0;
                }

                .stat-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 15px 35px rgba(0,0,0,0.15);
                }

                .stat-card.completed {
                    background: linear-gradient(135deg, #00b894, #00a085);
                    color: white;
                }

                .stat-card.progress {
                    background: linear-gradient(135deg, #74b9ff, #0984e3);
                    color: white;
                }

                .stat-card.verses {
                    background: linear-gradient(135deg, #fd79a8, #e84393);
                    color: white;
                }

                .stat-icon {
                    font-size: 2.5rem;
                    margin-bottom: 15px;
                }

                .stat-number {
                    font-size: 3rem;
                    font-weight: bold;
                    margin-bottom: 10px;
                    text-shadow: 0 2px 4px rgba(0,0,0,0.2);
                }

                .stat-label {
                    font-size: 1.1rem;
                    opacity: 0.95;
                }

                .current-surah-section {
                    margin-bottom: 40px;
                }

                .current-surah-card {
                    background: linear-gradient(135deg, #ffeaa7, #fdcb6e);
                    padding: 30px;
                    border-radius: 20px;
                    box-shadow: 0 8px 25px rgba(0,0,0,0.1);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 20px;
                }

                .surah-info {
                    flex: 1;
                    min-width: 300px;
                }

                .surah-name {
                    font-size: 1.8rem;
                    color: #2c3e50;
                    margin-bottom: 15px;
                    font-weight: bold;
                }

                .surah-details {
                    display: flex;
                    gap: 15px;
                    margin-bottom: 20px;
                }

                .surah-type, .surah-number {
                    background: rgba(255,255,255,0.3);
                    padding: 5px 12px;
                    border-radius: 15px;
                    font-size: 0.9rem;
                    color: #2c3e50;
                    font-weight: bold;
                }

                .progress-info {
                    margin-top: 20px;
                }

                .progress-info p {
                    margin-bottom: 10px;
                    color: #2c3e50;
                }

                .progress-bar {
                    width: 100%;
                    height: 12px;
                    background: rgba(255,255,255,0.3);
                    border-radius: 6px;
                    overflow: hidden;
                    margin-bottom: 10px;
                }

                .progress-fill {
                    height: 100%;
                    background: linear-gradient(135deg, #00b894, #00a085);
                    transition: width 0.3s ease;
                }

                .progress-percentage {
                    font-size: 1.2rem;
                    font-weight: bold;
                    color: #2c3e50;
                }

                .surah-actions {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }

                .surahs-section {
                    margin-bottom: 40px;
                }

                .quran-table {
                    background: white;
                    border-radius: 15px;
                    overflow: hidden;
                    box-shadow: 0 8px 25px rgba(0,0,0,0.1);
                }

                .completed-row {
                    background: linear-gradient(135deg, #d4ffe4, #a8f5bc);
                }

                .type-badge {
                    padding: 4px 10px;
                    border-radius: 12px;
                    font-size: 0.8rem;
                    font-weight: bold;
                }

                .type-badge.makki {
                    background: #ffeaa7;
                    color: #2d3436;
                }

                .type-badge.madni {
                    background: #81ecec;
                    color: #2d3436;
                }

                .btn-action {
                    padding: 8px 15px;
                    border: none;
                    border-radius: 8px;
                    font-weight: bold;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    font-size: 0.9rem;
                }

                .btn-add {
                    background: linear-gradient(135deg, #00b894, #00a085);
                    color: white;
                }

                .btn-review {
                    background: linear-gradient(135deg, #fd79a8, #e84393);
                    color: white;
                }

                .btn-history {
                    background: linear-gradient(135deg, #74b9ff, #0984e3);
                    color: white;
                }

                .btn-action:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 5px 15px rgba(0,0,0,0.2);
                }

                .btn-primary {
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    color: white;
                    padding: 12px 24px;
                    border: none;
                    border-radius: 8px;
                    font-weight: bold;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .btn-success {
                    background: linear-gradient(135deg, #00b894, #00a085);
                    color: white;
                    padding: 12px 24px;
                    border: none;
                    border-radius: 8px;
                    font-weight: bold;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .btn-secondary {
                    background: linear-gradient(135deg, #636e72, #2d3436);
                    color: white;
                    padding: 12px 24px;
                    border: none;
                    border-radius: 8px;
                    font-weight: bold;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .review-modal {
                    text-align: center;
                    padding: 20px;
                }

                .review-icon {
                    font-size: 4rem;
                    margin-bottom: 20px;
                }

                .history-progress {
                    background: #f8f9fa;
                    padding: 20px;
                    border-radius: 10px;
                    margin: 15px 0;
                }

                .mini-progress-bar {
                    width: 100%;
                    height: 8px;
                    background: #dee2e6;
                    border-radius: 4px;
                    overflow: hidden;
                    margin-top: 10px;
                }

                .mini-progress-fill {
                    height: 100%;
                    background: linear-gradient(135deg, #00b894, #00a085);
                    transition: width 0.3s ease;
                }

                .history-list {
                    background: #f8f9fa;
                    padding: 15px;
                    border-radius: 10px;
                    max-height: 200px;
                    overflow-y: auto;
                }

                .history-list li {
                    padding: 8px 0;
                    border-bottom: 1px solid #dee2e6;
                }

                .history-list li:last-child {
                    border-bottom: none;
                }

                @media (max-width: 768px) {
                    .hero-title {
                        font-size: 2rem;
                    }
                    
                    .current-surah-card {
                        flex-direction: column;
                        text-align: center;
                    }
                    
                    .surah-actions {
                        flex-direction: row;
                        justify-content: center;
                    }
                }
            `}</style>
        </>
    );
}

export default DashboardPage;
