// src/components/ReviewReminder.jsx - مكون تذكيرات المراجعة
import React, { useState, useEffect } from 'react';

function ReviewReminder({ memorizations, surahs, onReviewSurah }) {
  const [reminders, setReminders] = useState([]);
  const [showReminders, setShowReminders] = useState(false);

  useEffect(() => {
    const calculateReminders = () => {
      const now = new Date();
      const urgentReminders = [];

      memorizations.forEach(memo => {
        const surah = surahs.find(s => s.number === memo.surah);
        if (!surah) return;

        let daysSinceReview = 0;
        if (memo.last_review_date) {
          const lastReview = new Date(memo.last_review_date);
          daysSinceReview = Math.floor((now - lastReview) / (1000 * 60 * 60 * 24));
        } else {
          daysSinceReview = 30; // إذا لم تتم مراجعة من قبل
        }

        let priority = 'low';
        let message = '';

        if (daysSinceReview >= 7) {
          priority = 'high';
          message = `لم تتم مراجعتها منذ ${daysSinceReview} يوم - مراجعة عاجلة!`;
        } else if (daysSinceReview >= 3) {
          priority = 'medium';
          message = `لم تتم مراجعتها منذ ${daysSinceReview} أيام`;
        } else if (daysSinceReview >= 1) {
          priority = 'low';
          message = `آخر مراجعة منذ ${daysSinceReview} يوم`;
        }

        if (daysSinceReview >= 1) {
          urgentReminders.push({
            surah,
            memo,
            daysSinceReview,
            priority,
            message
          });
        }
      });

      // ترتيب حسب الأولوية والوقت
      urgentReminders.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        }
        return b.daysSinceReview - a.daysSinceReview;
      });

      setReminders(urgentReminders.slice(0, 5)); // أهم 5 تذكيرات
    };

    calculateReminders();
  }, [memorizations, surahs]);

  if (reminders.length === 0) {
    return (
      <div className="review-reminder success">
        <div className="reminder-content">
          <div className="reminder-icon">✅</div>
          <div>
            <h3>ممتاز! جميع السور محدثة</h3>
            <p>لا توجد سور تحتاج لمراجعة عاجلة</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="review-reminder">
      <div className="reminder-header" onClick={() => setShowReminders(!showReminders)}>
        <div className="reminder-title">
          <span className="reminder-icon">⚠️</span>
          <h3>تذكيرات المراجعة ({reminders.length})</h3>
        </div>
        <button className="toggle-btn">
          {showReminders ? '🔼' : '🔽'}
        </button>
      </div>

      {showReminders && (
        <div className="reminders-list">
          {reminders.map((reminder, index) => (
            <div key={reminder.surah.number} className={`reminder-item ${reminder.priority}`}>
              <div className="reminder-info">
                <h4>سورة {reminder.surah.name}</h4>
                <p>{reminder.message}</p>
                <small>
                  محفوظة حتى الآية {reminder.memo.end_ayah} من {reminder.surah.total_verses}
                </small>
              </div>
              <div className="reminder-actions">
                <button 
                  className="review-btn"
                  onClick={() => onReviewSurah(reminder.surah)}
                >
                  مراجعة الآن
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .review-reminder {
          margin-bottom: 25px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .review-reminder.success {
          background: linear-gradient(135deg, #d4edda, #c3e6cb);
          border: 1px solid #b8dacc;
        }

        .reminder-header {
          padding: 15px 20px;
          background: linear-gradient(135deg, #ff7675, #fd79a8);
          color: white;
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: background 0.3s ease;
        }

        .reminder-header:hover {
          background: linear-gradient(135deg, #e84393, #fd79a8);
        }

        .reminder-title {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .reminder-title h3 {
          margin: 0;
          font-size: 1.1rem;
        }

        .reminder-icon {
          font-size: 1.5rem;
        }

        .toggle-btn {
          background: none;
          border: none;
          color: white;
          font-size: 1.2rem;
          cursor: pointer;
          padding: 5px;
          border-radius: 50%;
          transition: background 0.2s ease;
        }

        .toggle-btn:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .reminder-content {
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .reminder-content .reminder-icon {
          font-size: 2rem;
        }

        .reminder-content h3 {
          margin: 0 0 5px 0;
          color: #155724;
        }

        .reminder-content p {
          margin: 0;
          color: #155724;
          opacity: 0.8;
        }

        .reminders-list {
          max-height: 400px;
          overflow-y: auto;
        }

        .reminder-item {
          padding: 15px 20px;
          border-bottom: 1px solid #eee;
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: background 0.2s ease;
        }

        .reminder-item:hover {
          background: #f8f9fa;
        }

        .reminder-item:last-child {
          border-bottom: none;
        }

        .reminder-item.high {
          border-left: 4px solid #dc3545;
          background: #fff5f5;
        }

        .reminder-item.medium {
          border-left: 4px solid #ffc107;
          background: #fffbf0;
        }

        .reminder-item.low {
          border-left: 4px solid #28a745;
          background: #f8fff9;
        }

        .reminder-info h4 {
          margin: 0 0 5px 0;
          color: #333;
          font-size: 1rem;
        }

        .reminder-info p {
          margin: 0 0 5px 0;
          color: #666;
          font-size: 0.9rem;
        }

        .reminder-info small {
          color: #888;
          font-size: 0.8rem;
        }

        .review-btn {
          background: linear-gradient(135deg, #28a745, #20c997);
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 20px;
          cursor: pointer;
          font-weight: bold;
          transition: all 0.3s ease;
          font-size: 0.9rem;
        }

        .review-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(40, 167, 69, 0.4);
        }

        @media (max-width: 768px) {
          .reminder-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
          }

          .reminder-actions {
            width: 100%;
          }

          .review-btn {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}

export default ReviewReminder;