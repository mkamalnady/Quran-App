// src/components/AchievementSystem.jsx - نظام الإنجازات والنقاط
import React, { useState, useEffect } from 'react';

function AchievementSystem({ memorizations, surahs }) {
  const [achievements, setAchievements] = useState([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [showAchievements, setShowAchievements] = useState(false);

  useEffect(() => {
    calculateAchievements();
  }, [memorizations, surahs]);

  const calculateAchievements = () => {
    const completedSurahs = memorizations.filter(memo => {
      const surah = surahs.find(s => s.number === memo.surah);
      return surah && memo.end_ayah >= surah.total_verses;
    }).length;

    const totalVerses = memorizations.reduce((sum, memo) => sum + memo.end_ayah, 0);
    const recentReviews = memorizations.filter(memo => {
      if (!memo.last_review_date) return false;
      const reviewDate = new Date(memo.last_review_date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return reviewDate >= weekAgo;
    }).length;

    const achievementsList = [
      {
        id: 'first_surah',
        title: 'السورة الأولى',
        description: 'أكمل حفظ أول سورة',
        icon: '🎯',
        points: 50,
        unlocked: completedSurahs >= 1,
        progress: Math.min(completedSurahs, 1),
        target: 1
      },
      {
        id: 'five_surahs',
        title: 'خمس سور',
        description: 'أكمل حفظ 5 سور',
        icon: '⭐',
        points: 100,
        unlocked: completedSurahs >= 5,
        progress: Math.min(completedSurahs, 5),
        target: 5
      },
      {
        id: 'ten_surahs',
        title: 'عشر سور',
        description: 'أكمل حفظ 10 سور',
        icon: '🏆',
        points: 200,
        unlocked: completedSurahs >= 10,
        progress: Math.min(completedSurahs, 10),
        target: 10
      },
      {
        id: 'hundred_verses',
        title: 'مئة آية',
        description: 'احفظ 100 آية',
        icon: '📚',
        points: 75,
        unlocked: totalVerses >= 100,
        progress: Math.min(totalVerses, 100),
        target: 100
      },
      {
        id: 'five_hundred_verses',
        title: 'خمسمئة آية',
        description: 'احفظ 500 آية',
        icon: '🎖️',
        points: 150,
        unlocked: totalVerses >= 500,
        progress: Math.min(totalVerses, 500),
        target: 500
      },
      {
        id: 'consistent_reviewer',
        title: 'المراجع المثابر',
        description: 'راجع 5 سور هذا الأسبوع',
        icon: '🔄',
        points: 80,
        unlocked: recentReviews >= 5,
        progress: Math.min(recentReviews, 5),
        target: 5
      },
      {
        id: 'juz_amma',
        title: 'جزء عم',
        description: 'أكمل حفظ جزء عم (السور 78-114)',
        icon: '🌟',
        points: 300,
        unlocked: checkJuzAmmaCompletion(),
        progress: getJuzAmmaProgress(),
        target: 37
      }
    ];

    setAchievements(achievementsList);
    
    // حساب النقاط الإجمالية
    const points = achievementsList
      .filter(achievement => achievement.unlocked)
      .reduce((sum, achievement) => sum + achievement.points, 0);
    
    setTotalPoints(points);
  };

  const checkJuzAmmaCompletion = () => {
    const juzAmmaSurahs = Array.from({length: 37}, (_, i) => i + 78); // السور 78-114
    return juzAmmaSurahs.every(surahNum => {
      const memo = memorizations.find(m => m.surah === surahNum);
      const surah = surahs.find(s => s.number === surahNum);
      return memo && surah && memo.end_ayah >= surah.total_verses;
    });
  };

  const getJuzAmmaProgress = () => {
    const juzAmmaSurahs = Array.from({length: 37}, (_, i) => i + 78);
    return juzAmmaSurahs.filter(surahNum => {
      const memo = memorizations.find(m => m.surah === surahNum);
      const surah = surahs.find(s => s.number === surahNum);
      return memo && surah && memo.end_ayah >= surah.total_verses;
    }).length;
  };

  const getLevel = (points) => {
    if (points >= 1000) return { level: 'خبير القرآن', color: '#8e44ad', icon: '👑' };
    if (points >= 500) return { level: 'حافظ متقدم', color: '#e74c3c', icon: '🏆' };
    if (points >= 200) return { level: 'حافظ متوسط', color: '#f39c12', icon: '⭐' };
    if (points >= 50) return { level: 'حافظ مبتدئ', color: '#27ae60', icon: '🌱' };
    return { level: 'بداية الرحلة', color: '#95a5a6', icon: '🚀' };
  };

  const currentLevel = getLevel(totalPoints);

  return (
    <div className="achievement-system">
      <div className="level-display">
        <div className="level-info">
          <div className="level-icon">{currentLevel.icon}</div>
          <div className="level-details">
            <h3>{currentLevel.level}</h3>
            <p>{totalPoints} نقطة إنجاز</p>
          </div>
        </div>
        <button 
          className="achievements-btn"
          onClick={() => setShowAchievements(!showAchievements)}
        >
          🏅 الإنجازات ({achievements.filter(a => a.unlocked).length}/{achievements.length})
        </button>
      </div>

      {showAchievements && (
        <div className="achievements-modal">
          <div className="achievements-header">
            <h3>🏆 إنجازاتك</h3>
            <button 
              className="close-btn"
              onClick={() => setShowAchievements(false)}
            >
              ✕
            </button>
          </div>
          
          <div className="achievements-grid">
            {achievements.map(achievement => (
              <div 
                key={achievement.id} 
                className={`achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}`}
              >
                <div className="achievement-icon">
                  {achievement.unlocked ? achievement.icon : '🔒'}
                </div>
                <div className="achievement-info">
                  <h4>{achievement.title}</h4>
                  <p>{achievement.description}</p>
                  <div className="achievement-progress">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ 
                          width: `${(achievement.progress / achievement.target) * 100}%` 
                        }}
                      ></div>
                    </div>
                    <span className="progress-text">
                      {achievement.progress}/{achievement.target}
                    </span>
                  </div>
                  <div className="achievement-points">
                    {achievement.unlocked ? '✅' : '⏳'} {achievement.points} نقطة
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        .achievement-system {
          margin-bottom: 25px;
        }

        .level-display {
          background: linear-gradient(135deg, ${currentLevel.color}, ${currentLevel.color}dd);
          color: white;
          padding: 20px;
          border-radius: 15px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        }

        .level-info {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .level-icon {
          font-size: 3rem;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
        }

        .level-details h3 {
          margin: 0 0 5px 0;
          font-size: 1.4rem;
          font-weight: bold;
        }

        .level-details p {
          margin: 0;
          opacity: 0.9;
          font-size: 1rem;
        }

        .achievements-btn {
          background: rgba(255, 255, 255, 0.2);
          border: 2px solid rgba(255, 255, 255, 0.3);
          color: white;
          padding: 12px 20px;
          border-radius: 25px;
          cursor: pointer;
          font-weight: bold;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
        }

        .achievements-btn:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: translateY(-2px);
        }

        .achievements-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          flex-direction: column;
          z-index: 1000;
          overflow-y: auto;
        }

        .achievements-header {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          padding: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: sticky;
          top: 0;
          z-index: 1001;
        }

        .achievements-header h3 {
          margin: 0;
          font-size: 1.5rem;
        }

        .close-btn {
          background: none;
          border: none;
          color: white;
          font-size: 1.5rem;
          cursor: pointer;
          padding: 5px 10px;
          border-radius: 50%;
          transition: background 0.2s ease;
        }

        .close-btn:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .achievements-grid {
          padding: 20px;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .achievement-card {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
          transition: transform 0.3s ease;
          border: 2px solid transparent;
        }

        .achievement-card.unlocked {
          border-color: #27ae60;
          transform: scale(1.02);
        }

        .achievement-card.locked {
          opacity: 0.6;
          border-color: #bdc3c7;
        }

        .achievement-card:hover {
          transform: translateY(-5px);
        }

        .achievement-icon {
          font-size: 3rem;
          text-align: center;
          margin-bottom: 15px;
        }

        .achievement-info h4 {
          margin: 0 0 10px 0;
          color: #2c3e50;
          text-align: center;
          font-size: 1.2rem;
        }

        .achievement-info p {
          margin: 0 0 15px 0;
          color: #7f8c8d;
          text-align: center;
          font-size: 0.9rem;
        }

        .achievement-progress {
          margin-bottom: 15px;
        }

        .progress-bar {
          height: 8px;
          background: #ecf0f1;
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 5px;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #27ae60, #2ecc71);
          border-radius: 4px;
          transition: width 0.5s ease;
        }

        .progress-text {
          font-size: 0.8rem;
          color: #7f8c8d;
          text-align: center;
          display: block;
        }

        .achievement-points {
          text-align: center;
          font-weight: bold;
          color: #8e44ad;
          font-size: 0.9rem;
        }

        @media (max-width: 768px) {
          .level-display {
            flex-direction: column;
            gap: 15px;
            text-align: center;
          }

          .achievements-grid {
            grid-template-columns: 1fr;
            padding: 15px;
          }

          .achievement-card {
            padding: 15px;
          }
        }
      `}</style>
    </div>
  );
}

export default AchievementSystem;