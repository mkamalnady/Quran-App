from django.http import HttpResponse

def home(request):
    html = """
    <html lang="ar" dir="rtl">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>تطبيق حفظ القرآن الكريم</title>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Cairo&display=swap');

            body {
                margin: 0; padding: 0;
                font-family: 'Cairo', sans-serif;
                background: #fefefe;
                color: #2c3e50;
                min-height: 100vh;
                display: flex; justify-content: center; align-items: center;
                text-align: center;
                direction: rtl;
            }

            .container {
                background-color: #fff;
                padding: 45px 40px 70px 40px;
                border-radius: 25px;
                max-width: 650px;
                box-shadow: 0 12px 25px rgba(0, 0, 0, 0.1);
                position: relative;
            }

            img {
                width: 110px;
                margin-bottom: 20px;
                filter: drop-shadow(0 0 8px #27ae60);
            }

            h1 {
                font-size: 2.8rem;
                margin-bottom: 15px;
                font-weight: 700;
                color: #27ae60;
                letter-spacing: 2px;
            }

            p.desc {
                font-size: 1.15rem;
                margin-bottom: 40px;
                color: #34495e;
                line-height: 1.6;
                font-weight: 500;
            }

            a {
                display: inline-block;
                text-decoration: none;
                background: #27ae60;
                color: #fff;
                padding: 14px 40px;
                margin: 10px 12px;
                border-radius: 40px;
                font-weight: 700;
                font-size: 1.1rem;
                box-shadow: 0 6px 12px rgba(39, 174, 96, 0.5);
                transition: background-color 0.3s ease, color 0.3s ease;
            }

            a:hover {
                background: #1e8449;
                color: #d0f0e4;
                box-shadow: 0 8px 18px rgba(30, 132, 73, 0.7);
            }

            .footer-links {
                margin-top: 40px;
                font-size: 1rem;
                color: #7f8c8d;
            }

            .footer-links a {
                color: #7f8c8d;
                margin: 0 10px;
                font-weight: 600;
                text-decoration: underline;
            }

            .footer-links a:hover {
                color: #27ae60;
            }

            /* التقويم والساعة */
            .datetime-container {
                position: absolute;
                bottom: 15px;
                left: 50%;
                transform: translateX(-50%);
                display: flex;
                gap: 25px;
                font-weight: 600;
                color: #2c3e50;
                font-size: 0.9rem;
                font-family: 'Cairo', sans-serif;
            }

            .datetime-item {
                background: #ecf0f1;
                padding: 8px 15px;
                border-radius: 20px;
                box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            }

            /* الآيات المتغيرة */
            #ayat {
                font-size: 1.2rem;
                font-weight: 600;
                color: #16a085;
                margin-top: 35px;
                min-height: 60px;
                font-style: italic;
                transition: opacity 1s ease-in-out;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <img src="https://gleeful-haupia-3d4fa4.netlify.app/quran-logo.png" alt="شعار القرآن الكريم" />
            <h1>بسم الله الرحمن الرحيم</h1>
            <p class="desc">مرحبًا بك في تطبيق حفظ القرآن الكريم، رفيقك الأمين في رحلتك المباركة لحفظ كتاب الله.</p>
            
            <a href="https://gleeful-haupia-3d4fa4.netlify.app/" target="_blank" rel="noopener noreferrer">الدخول للمستخدم</a>
            <a href="/admin/">الدخول لصفحة الإدارة</a>
            
            <div id="ayat">﴿ وَقُل رَّبِّ زِدْنِي عِلْمًا ﴾</div>

            <div class="footer-links">
                <a href="https://quran.com/" target="_blank" rel="noopener noreferrer">المصحف الإلكتروني</a> | 
                <a href="https://quranexplorer.com/" target="_blank" rel="noopener noreferrer">تفسير القرآن</a> | 
                <a href="https://quran.ksu.edu.sa/" target="_blank" rel="noopener noreferrer">المكتبة القرآنية</a> |
                <a href="https://www.qurancentral.com/" target="_blank" rel="noopener noreferrer">مواقع الاستماع</a> |
                <a href="https://www.quranwow.com/" target="_blank" rel="noopener noreferrer">مواقع القراءة</a>
            </div>

            <div class="datetime-container">
                <div class="datetime-item" id="gregorian-date">...</div>
                <div class="datetime-item" id="hijri-date">...</div>
                <div class="datetime-item" id="clock">...</div>
            </div>
        </div>

        <script>
            // نصوص آيات متغيرة
            const ayatList = [
                "﴿ وَقُل رَّبِّ زِدْنِي عِلْمًا ﴾",
                "﴿ إِنَّ مَعَ الْعُسْرِ يُسْرًا ﴾",
                "﴿ فَاذْكُرُونِي أَذْكُرْكُمْ ﴾",
                "﴿ يَا أَيُّهَا الَّذِينَ آمَنُوا اتَّقُوا اللَّهَ ﴾",
                "﴿ وَالصُّبْحِ إِذَا تَنَفَّسَ ﴾"
            ];

            let ayatIndex = 0;
            const ayatEl = document.getElementById("ayat");

            function changeAyat() {
                ayatEl.style.opacity = 0;
                setTimeout(() => {
                    ayatEl.textContent = ayatList[ayatIndex];
                    ayatEl.style.opacity = 1;
                    ayatIndex = (ayatIndex + 1) % ayatList.length;
                }, 1000);
            }
            setInterval(changeAyat, 8000);
            changeAyat();

            // الوقت والتاريخ الميلادي
            function updateClock() {
                const now = new Date();
                const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
                const gregDate = now.toLocaleDateString('ar-EG', options);
                document.getElementById('gregorian-date').textContent = gregDate;

                // الوقت
                let hours = now.getHours();
                let minutes = now.getMinutes();
                let seconds = now.getSeconds();
                if (hours < 10) hours = '0' + hours;
                if (minutes < 10) minutes = '0' + minutes;
                if (seconds < 10) seconds = '0' + seconds;
                document.getElementById('clock').textContent = hours + ':' + minutes + ':' + seconds;
            }

            setInterval(updateClock, 1000);
            updateClock();

            // التقويم الهجري (بسيط جداً)
            function gregorianToHijri(gDate) {
                // هذه دالة تقريبية وليست دقيقة جداً
                let jd = (gDate / 86400000) + 2440587.5; // حساب اليوم اليولياني
                let islamicEpoch = 1948439.5;
                let daysSinceEpoch = jd - islamicEpoch;
                let hijriYear = Math.floor((30 * daysSinceEpoch + 10646) / 10631);
                let hijriMonth = Math.min(11, Math.floor((daysSinceEpoch - 29 - hijriYear * 354 - Math.floor((3 + 11 * hijriYear) / 30)) / 29.5));
                let hijriDay = Math.floor(daysSinceEpoch - hijriYear * 354 - Math.floor((3 + 11 * hijriYear) / 30) - hijriMonth * 29.5 + 1);
                return { year: hijriYear, month: hijriMonth + 1, day: hijriDay };
            }

            function updateHijriDate() {
                const now = new Date();
                const hDate = gregorianToHijri(now.getTime());
                document.getElementById('hijri-date').textContent = `التقويم الهجري: ${hDate.day} / ${
::contentReference[oaicite:1]{index=1}
 
