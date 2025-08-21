// src/components/DateDisplay.jsx - مكون عرض التاريخين الهجري والميلادي
import React, { useState, useEffect } from 'react';
import { getCurrentDate } from '../utils/dateUtils';

function DateDisplay() {
  const [currentDateTime, setCurrentDateTime] = useState(getCurrentDate());

  useEffect(() => {
    // تحديث التاريخ والوقت كل ثانية
    const interval = setInterval(() => {
      setCurrentDateTime(getCurrentDate());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="date-display">
      <div className="date-card gregorian">
        <div className="date-icon">📅</div>
        <div className="date-content">
          <div className="date-label">التاريخ الميلادي</div>
          <div className="date-value">{currentDateTime.gregorian}</div>
        </div>
      </div>
      
      <div className="date-card hijri">
        <div className="date-icon">🌙</div>
        <div className="date-content">
          <div className="date-label">التاريخ الهجري</div>
          <div className="date-value">{currentDateTime.hijri}</div>
        </div>
      </div>
      
      <div className="date-card time">
        <div className="date-icon">🕐</div>
        <div className="date-content">
          <div className="date-label">الوقت الحالي</div>
          <div className="date-value">{currentDateTime.time}</div>
        </div>
      </div>

      <style jsx>{`
        .date-display {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
          margin-bottom: 25px;
          padding: 20px;
          background: linear-gradient(135deg, #f8f9fa, #e9ecef);
          border-radius: 15px;
          border: 1px solid #dee2e6;
        }

        .date-card {
          background: white;
          border-radius: 12px;
          padding: 15px;
          display: flex;
          align-items: center;
          gap: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .date-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
        }

        .date-card.gregorian {
          border-left: 4px solid #3498db;
        }

        .date-card.hijri {
          border-left: 4px solid #e74c3c;
        }

        .date-card.time {
          border-left: 4px solid #27ae60;
        }

        .date-icon {
          font-size: 2rem;
          opacity: 0.8;
        }

        .date-content {
          flex: 1;
        }

        .date-label {
          font-size: 0.85rem;
          color: #6c757d;
          font-weight: 600;
          margin-bottom: 4px;
        }

        .date-value {
          font-size: 1rem;
          color: #2c3e50;
          font-weight: bold;
          line-height: 1.2;
        }

        @media (max-width: 768px) {
          .date-display {
            grid-template-columns: 1fr;
            padding: 15px;
          }
          
          .date-card {
            padding: 12px;
          }
          
          .date-icon {
            font-size: 1.5rem;
          }
          
          .date-value {
            font-size: 0.9rem;
          }
        }
      `}</style>
    </div>
  );
}

export default DateDisplay;