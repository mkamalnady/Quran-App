// src/components/ProgressStats.jsx - مكون إحصائيات التقدم
import React from 'react';

function ProgressStats({ memorizations, surahs }) {
  const totalSurahs = surahs.length;
  const completedSurahs = memorizations.filter(memo => {
    const surah = surahs.find(s => s.number === memo.surah);
    return surah && memo.end_ayah >= surah.total_verses;
  }).length;

  const totalVerses = surahs.reduce((sum, surah) => sum + surah.total_verses, 0);
  const memorizedVerses = memorizations.reduce((sum, memo) => sum + memo.end_ayah, 0);

  const completionPercentage = totalSurahs > 0 ? Math.round((completedSurahs / totalSurahs) * 100) : 0;
  const versesPercentage = totalVerses > 0 ? Math.round((memorizedVerses / totalVerses) * 100) : 0;

  const recentReviews = memorizations.filter(memo => {
    if (!memo.last_review_date) return false;
    const reviewDate = new Date(memo.last_review_date);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return reviewDate >= weekAgo;
  }).length;

  // حساب إحصائيات إضافية
  const averageProgress = memorizations.length > 0 
    ? Math.round(memorizations.reduce((sum, memo) => {
        const surah = surahs.find(s => s.number === memo.surah);
        return sum + (surah ? (memo.end_ayah / surah.total_verses) * 100 : 0);
      }, 0) / memorizations.length)
    : 0;
  return (
    <div className="progress-stats">
      <div className="stats-header">
        <h3>📊 إحصائيات التقدم</h3>
        <div className="overall-progress">
          <span>التقدم العام: {averageProgress}%</span>
        </div>
      </div>
      
      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-icon">📚</div>
          <div className="stat-content">
            <h3>{completedSurahs}</h3>
            <p>سورة مكتملة</p>
            <small>من أصل {totalSurahs} سورة</small>
          </div>
          <div className="stat-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
            <span className="progress-text">{completionPercentage}%</span>
          </div>
        </div>

        <div className="stat-card success">
          <div className="stat-icon">🎯</div>
          <div className="stat-content">
            <h3>{memorizedVerses}</h3>
            <p>آية محفوظة</p>
            <small>من أصل {totalVerses} آية</small>
          </div>
          <div className="stat-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${versesPercentage}%` }}
              ></div>
            </div>
            <span className="progress-text">{versesPercentage}%</span>
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-icon">🔄</div>
          <div className="stat-content">
            <h3>{recentReviews}</h3>
            <p>مراجعة هذا الأسبوع</p>
            <small>استمر في المراجعة</small>
          </div>
          <div className="stat-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${Math.min((recentReviews / 7) * 100, 100)}%` }}
              ></div>
            </div>
            <span className="progress-text">{Math.min(recentReviews, 7)}/7</span>
          </div>
        </div>

        <div className="stat-card info">
          <div className="stat-icon">⭐</div>
          <div className="stat-content">
            <h3>{memorizations.length * 10}</h3>
            <p>نقطة إنجاز</p>
            <small>10 نقاط لكل سورة</small>
          </div>
        </div>
      </div>

      <style jsx>{`
        .progress-stats {
          margin-bottom: 30px;
          padding: 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 15px;
          color: white;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
        }

        .stat-card {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 12px;
          padding: 20px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        }

        .stat-card.primary { border-left: 4px solid #3498db; }
        .stat-card.success { border-left: 4px solid #2ecc71; }
        .stat-card.warning { border-left: 4px solid #f39c12; }
        .stat-card.info { border-left: 4px solid #9b59b6; }

        .stat-icon {
          font-size: 2.5rem;
          margin-bottom: 10px;
          text-align: center;
        }

        .stat-content h3 {
          font-size: 2.2rem;
          font-weight: bold;
          margin: 0 0 5px 0;
          text-align: center;
        }

        .stat-content p {
          font-size: 1.1rem;
          margin: 0 0 5px 0;
          text-align: center;
          opacity: 0.9;
        }

        .stat-content small {
          font-size: 0.85rem;
          opacity: 0.7;
          text-align: center;
          display: block;
        }

        .stat-progress {
          margin-top: 15px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .progress-bar {
          flex: 1;
          height: 8px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #2ecc71, #27ae60);
          border-radius: 4px;
          transition: width 0.5s ease;
        }

        .progress-text {
          font-size: 0.9rem;
          font-weight: bold;
          min-width: 35px;
        }

        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }
          
          .stat-card {
            padding: 15px;
          }
          
          .stat-content h3 {
            font-size: 1.8rem;
          }
        }
      `}</style>
    </div>
  );
}

export default ProgressStats;