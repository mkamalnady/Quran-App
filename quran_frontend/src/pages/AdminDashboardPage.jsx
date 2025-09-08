import React, { useState, useEffect } from 'react';
import axios from 'axios';

function AdminDashboardPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);

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

  const filteredUsers = users.filter(u =>
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  const showProgress = (user) => {
    setSelectedUser(user);
  };

  const closeModal = () => setSelectedUser(null);

  if (loading) return <div className="container"><p>جاري تحميل قائمة المستخدمين...</p></div>;
  if (error) return <div className="container"><p className="error-message">{error}</p></div>;

  const totalStudents = users.filter(u => !u.is_staff).length;
  const totalAdmins = users.filter(u => u.is_staff).length;
  const activeStudents = users.filter(u => u.last_revision).length;
  const needFollowUp = totalStudents - activeStudents;

  return (
    <>
      <div className="container dashboard-table-view">
        <div className="dashboard-header">
          <img src="/quran-logo.png" alt="القرآن الكريم" className="dashboard-logo" />
          <h1>لوحة تحكم المشرف</h1>
        </div>

        <div className="admin-stats">
          <div className="stat-card">
            <h3>إجمالي الطلاب</h3>
            <p className="stat-number">{totalStudents}</p>
          </div>
          <div className="stat-card">
            <h3>المشرفون</h3>
            <p className="stat-number">{totalAdmins}</p>
          </div>
          <div className="stat-card">
            <h3>الطلاب النشطون</h3>
            <p className="stat-number">{activeStudents}</p>
          </div>
          <div className="stat-card">
            <h3>طلاب يحتاجون متابعة</h3>
            <p className="stat-number">{needFollowUp}</p>
          </div>
        </div>

        <div className="search-box">
          <input
            type="text"
            placeholder="ابحث باسم الطالب..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="table-responsive">
          <table className="quran-table">
            <thead>
              <tr>
                <th>الكود</th>
                <th>اسم الطالب</th>
                <th>العمر</th>
                <th>البريد الإلكتروني</th>
                <th>تاريخ التسجيل</th>
                <th>الحفظ</th>
                <th>آخر مراجعة</th>
                <th>الحالة</th>
                <th>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id}>
                  <td>{user.student_code || '-'}</td>
                  <td>{user.username}</td>
                  <td>{user.age || '-'}</td>
                  <td>{user.email || '-'}</td>
                  <td>{user.registration_date || '-'}</td>
                  <td>
                    <div className="progress-bar" style={{
                      width: `${user.hifz_progress || 0}%`,
                      backgroundColor: user.hifz_progress >= 80 ? '#00b894' :
                        user.hifz_progress >= 50 ? '#fdcb6e' : '#d63031'
                    }}>
                      {user.hifz_progress || 0}%
                    </div>
                  </td>
                  <td>{user.last_revision || '-'}</td>
                  <td>
                    <span className={user.is_staff ? 'admin-badge' : 'user-badge'}>
                      {user.is_staff ? 'مشرف' : 'طالب'}
                    </span>
                  </td>
                  <td>
                    <button className="btn-action" onClick={() => showProgress(user)}>
                      عرض التقدم
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedUser && (
        <div className="modal">
          <div className="modal-content">
            <h2>تقدم {selectedUser.username}</h2>
            <p>نسبة الحفظ: {selectedUser.hifz_progress || 0}%</p>
            <p>آخر مراجعة: {selectedUser.last_revision || '-'}</p>
            <button onClick={closeModal} className="btn-close">إغلاق</button>
          </div>
        </div>
      )}

      <style jsx>{`
        .dashboard-header {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 15px;
          margin-bottom: 30px;
          padding: 20px 0;
          background: linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%);
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .dashboard-logo {
          width: 60px;
          height: 60px;
          object-fit: contain;
        }
        .dashboard-header h1 {
          margin: 0;
          color: #fff;
          font-size: 28px;
        }
        .admin-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 20px;
        }
        .stat-card {
          background: linear-gradient(135deg, #8e44ad 0%, #9b59b6 100%);
          color: white;
          border-radius: 8px;
          padding: 15px;
          text-align: center;
          box-shadow: 0 4px 8px rgba(0,0,0,0.15);
        }
        .stat-number {
          font-size: 28px;
          font-weight: bold;
        }
        .search-box {
          margin-bottom: 15px;
          text-align: right;
        }
        .search-box input {
          padding: 8px 12px;
          width: 250px;
          border-radius: 6px;
          border: 1px solid #ccc;
        }
        .quran-table {
          width: 100%;
          border-collapse: collapse;
        }
        .quran-table th, .quran-table td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: center;
        }
        .progress-bar {
          height: 20px;
          color: #fff;
          font-weight: bold;
          border-radius: 4px;
        }
        .admin-badge {
          background: #00b894;
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
        }
        .user-badge {
          background: #0984e3;
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
        }
        .btn-action {
          padding: 6px 10px;
          background: #6c5ce7;
          color: #fff;
          border: none;
          border-radius: 6px;
          cursor: pointer;
        }
        .btn-action:hover {
          background: #341f97;
        }
        /* مودال */
        .modal {
          position: fixed;
          top: 0; left: 0;
          width: 100%; height: 100%;
          background: rgba(0,0,0,0.5);
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .modal-content {
          background: #fff;
          padding: 25px;
          border-radius: 10px;
          width: 300px;
          text-align: center;
        }
        .btn-close {
          margin-top: 15px;
          padding: 6px 12px;
          background: #e17055;
          color: #fff;
          border: none;
          border-radius: 6px;
          cursor: pointer;
        }
      `}</style>
    </>
  );
}

export default AdminDashboardPage;
