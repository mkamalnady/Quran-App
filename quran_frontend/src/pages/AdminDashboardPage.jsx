// src/pages/AdminDashboardPage.jsx (النسخة المُصححة)

import React, { useState, useEffect } from 'react';
import axios from 'axios';

function AdminDashboardPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const config = { headers: { Authorization: `Token ${token}` } };
        const response = await axios.get('http://127.0.0.1:8000/api/admin/users/', config);
        setUsers(response.data);
      } catch (error) {
        console.error("Failed to fetch users", error);
        setError("لا يمكنك الوصول لهذه الصفحة. تأكد من أنك مشرف.");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  if (loading) return <div className="container"><p>جاري تحميل قائمة المستخدمين...</p></div>;
  if (error) return <div className="container"><p className="error-message">{error}</p></div>;

  return (
    <>
      <div className="container dashboard-table-view">
        <div className="dashboard-header">
          <img src="/quran-logo.png" alt="القرآن الكريم" className="dashboard-logo" />
          <h1>لوحة تحكم المشرف</h1>
        </div>
        
        <div className="admin-stats">
          <div className="stat-card">
            <h3>إجمالي المستخدمين</h3>
            <p className="stat-number">{users.length}</p>
          </div>
          <div className="stat-card">
            <h3>المشرفون</h3>
            <p className="stat-number">{users.filter(u => u.is_staff).length}</p>
          </div>
          <div className="stat-card">
            <h3>المستخدمون العاديون</h3>
            <p className="stat-number">{users.filter(u => !u.is_staff).length}</p>
          </div>
        </div>
        
        <div className="table-responsive">
          <table className="quran-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>اسم المستخدم</th>
                <th>البريد الإلكتروني</th>
                <th>الحالة</th>
                <th>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.username}</td>
                  <td>{user.email || 'لا يوجد'}</td>
                  <td>
                    <span className={user.is_staff ? 'admin-badge' : 'user-badge'}>
                      {user.is_staff ? 'مشرف' : 'مستخدم'}
                    </span>
                  </td>
                  <td>
                    <button className="btn-action btn-history" disabled>
                      عرض التقدم
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <style jsx>{`
        .dashboard-header {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 15px;
          margin-bottom: 30px;
          padding: 20px 0;
          background: linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%);
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .dashboard-logo {
          width: 60px;
          height: 60px;
          object-fit: contain;
          filter: drop-shadow(0 3px 6px rgba(0,0,0,0.2));
        }
        .dashboard-header h1 {
          margin: 0;
          color: #2c3e50;
          font-size: 28px;
          text-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .admin-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }
        .stat-card {
          background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%);
          color: white;
          border-radius: 8px;
          padding: 20px;
          text-align: center;
          box-shadow: 0 4px 8px rgba(0,0,0,0.15);
          transition: transform 0.2s ease;
        }
        .stat-card:hover {
          transform: translateY(-2px);
        }
        .stat-card h3 {
          margin: 0 0 10px 0;
          font-size: 16px;
          opacity: 0.9;
        }
        .stat-number {
          font-size: 32px;
          font-weight: bold;
          margin: 0;
          text-shadow: 0 1px 3px rgba(0,0,0,0.3);
        }
        .admin-badge {
          background: #00b894;
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: bold;
        }
        .user-badge {
          background: #74b9ff;
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: bold;
        }
      `}</style>
    </>
  );
}

export default AdminDashboardPage;
