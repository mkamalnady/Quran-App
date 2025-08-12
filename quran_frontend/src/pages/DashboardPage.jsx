// src/pages/DashboardPage.jsx

import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import Modal from '../components/Modal';

function DashboardPage() {
    const [userName, setUserName] = useState(""); // 👈 اسم المستخدم
    const [memorizations, setMemorizations] = useState([]);
    const [surahs, setSurahs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState(null);
    const [selectedSurah, setSelectedSurah] = useState(null);
    const [addFormData, setAddFormData] = useState({ start_ayah: '', end_ayah: '' });

    // 🟢 جلب بيانات المستخدم الحالي
    const fetchUser = async () => {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) return;
            const config = { headers: { Authorization: `Token ${token}` } };
            
            const res = await axios.get('https://quran-app-8ay9.onrender.com/api/auth/user/', config);
            
            // ⚠️ غيّر المفتاح حسب الباك إند: ممكن يكون full_name أو username
            setUserName(res.data.full_name || res.data.username || res.data.email);
        } catch (err) {
            console.error("Error fetching user:", err);
        }
    };

    // جلب البيانات الرئيسية
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
        fetchUser(); // 🟢 جلب اسم المستخدم أول ما الصفحة تفتح
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

    // باقي الأكواد زي ما هي...

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
                {/* 🟢 التحية بالاسم */}
                <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>
                    السلام عليكم {userName ? userName : "ضيفنا العزيز"} 🌸
                </h2>

                {/* باقي الصفحة كما هي... */}
