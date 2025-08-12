return (
  <>
    <div className="container quran-dashboard">
      {/* تحية باسم المستخدم (إن وجدت) */}
      {/* إن كنت أضفت userName في الصفحة: 
          <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>
            السلام عليكم {userName ? userName : "ضيفنا العزيز"} 🌸
          </h2>
      */}

      {/* Hero */}
      <div className="hero-section">
        <div className="hero-content">
          <img src="/quran-logo.png" alt="القرآن الكريم" className="hero-logo" />
          <h1 className="hero-title">حفظ القرآن الكريم</h1>
          <p className="hero-subtitle">﴿ وَلَقَدْ يَسَّرْنَا الْقُرْآنَ لِلذِّكْرِ فَهَلْ مِن مُّدَّكِرٍ ﴾</p>
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
                <p>
                  تقدمك الحالي: <strong>{stats.currentSurah.progress.end_ayah}</strong> من{" "}
                  <strong>{stats.currentSurah.total_verses}</strong> آية
                </p>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${
                        (stats.currentSurah.progress.end_ayah / stats.currentSurah.total_verses) * 100
                      }%`,
                    }}
                  />
                </div>
                <div className="progress-percentage">
                  {Math.round(
                    (stats.currentSurah.progress.end_ayah / stats.currentSurah.total_verses) * 100
                  )}
                  %
                </div>
              </div>
            </div>
            <div className="surah-actions">
              <button onClick={() => openModal(stats.currentSurah, "add")} className="btn-primary">
                📝 أضف المزيد
              </button>
              <button
                onClick={() => openModal(stats.currentSurah, "history")}
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
              {surahProgressData.map((surah) => (
                <tr key={surah.number} className={surah.isDone ? "completed-row" : ""}>
                  <td>{surah.number}</td>
                  <td className="surah-name">{surah.name}</td>
                  <td>
                    <span className={`type-badge ${surah.type === "مدنية" ? "madni" : "makki"}`}>
                      {surah.type}
                    </span>
                  </td>
                  <td>{surah.total_verses}</td>
                  <td style={{ color: surah.statusColor, fontWeight: "bold" }}>{surah.statusText}</td>
                  <td>
                    {surah.isDone ? (
                      <button
                        onClick={() => openModal(surah, "review")}
                        className="btn-action btn-review"
                      >
                        🔄 مراجعة
                      </button>
                    ) : (
                      <button onClick={() => openModal(surah, "add")} className="btn-action btn-add">
                        ➕ أضف
                      </button>
                    )}
                  </td>
                  <td>
                    <button
                      onClick={() => openModal(surah, "history")}
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

    {/* Modal */}
    {isModalOpen && selectedSurah && (
      <Modal
        onClose={closeModal}
        title={
          modalMode === "add"
            ? `📝 إضافة حفظ - سورة ${selectedSurah.name}`
            : modalMode === "history"
            ? `📊 سجل - سورة ${selectedSurah.name}`
            : `🔄 مراجعة - سورة ${selectedSurah.name}`
        }
      >
        {modalMode === "add" && (
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
                onChange={(e) => setAddFormData({ ...addFormData, end_ayah: e.target.value })}
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

        {modalMode === "review" && (
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

        {modalMode === "history" && (
          <div>
            <h4>📊 تقدم الحفظ:</h4>
            {selectedSurah.progress ? (
              <div className="history-progress">
                <p>
                  🎯 لقد حفظت من الآية <strong>1</strong> إلى الآية{" "}
                  <strong>{selectedSurah.progress.end_ayah}</strong>
                </p>
                <div className="mini-progress-bar">
                  <div
                    className="mini-progress-fill"
                    style={{
                      width: `${
                        (selectedSurah.progress.end_ayah / selectedSurah.total_verses) * 100
                      }%`,
                    }}
                  />
                </div>
              </div>
            ) : (
              <p>🚀 لم يتم البدء في حفظ هذه السورة بعد</p>
            )}
            <hr />
            <h4>📅 سجل المراجعات:</h4>
            {selectedSurah.progress?.review_history &&
            selectedSurah.progress.review_history.length > 0 ? (
              <ul className="history-list">
                {selectedSurah.progress.review_history.map((rev, i) => (
                  <li key={i}>
                    🕐{" "}
                    {new Date(rev.date).toLocaleString("ar-EG", {
                      dateStyle: "long",
                      timeStyle: "short",
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

    {/* Styles */}
    <style jsx>{`/* نفس كتلة الستايل التي لديك بالكامل هنا بدون تغيير */`}</style>
  </>
);
