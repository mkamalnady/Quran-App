// src/pages/HomePage.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';

function HomePage() {
  const [surahs, setSurahs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSurahs = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/surahs/');
        setSurahs(response.data);
        setError(null);
      } catch (err) {
        setError('حدث خطأ أثناء تحميل البيانات. تأكد من أن خادم Django يعمل.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSurahs();
  }, []);

  return (
    <div className="container">
      {/* ... rest of the component */}
    </div>
  );
}

export default HomePage;
