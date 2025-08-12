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
            @import url('https://fonts.googleapis.com/css2?family=Amiri+Quran&display=swap');

            body {
                margin: 0; padding: 0;
                font-family: 'Cairo', sans-serif;
                background: linear-gradient(135deg, #e8f5e9ee, #fef9e7ee),
                            url('https://www.toptal.com/designers/subtlepatterns/uploads/islamic-pattern.png');
                background-size: cover;
                background-attachment: fixed;
                min-height: 100vh;
                display: flex; justify-content: center; align-items: center;
                text-align: center;
            }

            .container {
                background-color: rgba(255, 255, 255, 0.94);
                padding: 45px;
                border-radius: 25px;
                max-width: 700px;
                box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
                position: relative;
                border: 6px double #d4af37; /* ذهبي */
                backdrop-filter: blur(6px);
                background-image: url('https://i.ibb.co/cxkWFy6/islamic-border.png');
                background-repeat: no-repeat;
                background-position: center;
                background-size: cover;
            }

            img {
                width: 110px;
                margin-bottom: 20px;
                filter: drop-shadow(0 0 10px #27ae60);
            }

            h1 {
                font-size: 2.8rem;
                margin-bottom: 15px;
                font-weight: 700;
                color: #2e7d32;
                letter-spacing: 2px;
                text-shadow: 1px 1px 3px #c8e6c9;
            }

            p.desc {
                font-size: 1.15rem;
                margin-bottom: 35px;
                color: #444;
                line-height: 1.8;
                font-weight: 500;
            }

            a {
                display: inline-block;
                text-decoration: none;
                background: linear-gradient(90deg, #2e7d32, #1b5e20);
                color: #fff;
                padding: 14px 35px;
                margin: 8px;
                border-radius: 40px;
                font-weight: 700;
                font-size: 1.1rem;
                box-shadow: 0 6px 12px rgba(46, 125, 50, 0.4);
                border: 2px solid gold;
                transition: all 0.3s ease;
            }

            a:hover {
                background: linear-gradient(90deg, #388e3c, #1b5e20);
                transform: translateY(-3px) scale(1.03);
                box-shadow: 0 10px 20px rgba(27, 94, 32, 0.6);
            }

            /* الآيات */
            #ayat {
                font-size: 1.4rem;
                font-family: 'Amiri Quran', serif;
                font-weight: 600;
                color: #00695c;
                margin-top: 35px;
                min-height: 60px;
                transition: opacity 1s ease-in-out, transform 1s ease-in-out;
            }
            #ayat.fadeOut { opacity: 0; transform: translateY(20px); }
            #ayat.fadeIn { opacity: 1; transform: translateY(0); }

            /* روابط الفوتر */
            .footer-links {
                margin-top: 40px;
                font-size: 1rem;
                color: #7f8c8d;
            }
            .footer-links a {
                color: #7f8c8d;
                margin: 0 10px;
                font-weight: 600;
            }
            .footer-links a:hover { color: #2e7d32; }

            /* الوقت والتاريخ */
            .datetime-container {
                margin-top: 20px;
                display: flex;
                justify-content: center;
                gap: 15px;
                font-weight: 600;
                color: #2c3e50;
                font-size: 0.95rem;
            }
            .datetime-item {
                background: #f1f8e9;
                padding: 8px 15px;
                border-radius: 15px;
                border: 1px solid #cddc39;
                box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            }
        </style>
    </head>
    <body>
        <div class="container">
            <img src="https://gleeful-haupia-3d4fa4.netlify.app/quran-logo.png" alt="شعار القرآن الكريم" />
            <h1>بسم الله الرحمن الرحيم</h1>
            <p class="desc">مرحبًا بك في تطبيق حفظ القرآن الكريم، رفيقك الأمين في رحلتك المباركة لحفظ كتاب الله.</p>
            
            <a href="https://gleeful-haupia-3d4fa4.netlify.app/" target="_blank">الدخول للمستخدم</a>
            <a href="/admin/">الدخول لصفحة الإدارة</a>
            
            <div id="ayat">﴿ وَقُل رَّبِّ زِدْنِي عِلْمًا ﴾</div>

            <div class="footer-links">
                <a href="https://quran.com/" target="_blank">المصحف الإلكتروني</a> | 
                <a href="https://quranexplorer.com/" target="_blank">تفسير القرآن</a> | 
                <a href="https://quran.ksu.edu.sa/" target="_blank">المكتبة القرآنية</a> |
                <a href="https://www.qurancentral.com/" target="_blank">الاستماع</a> |
                <a href="https://www.quranwow.com/" target="_blank">القراءة</a>
            </div>

            <div class="datetime-container">
                <div class="datetime-item" id="gregorian-date">---</div>
                <div class="datetime-item" id="hijri-date">---</div>
                <div class="datetime-item" id="clock">---</div>
            </div>
        </div>

        <script>
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
                ayatEl.classList.remove("fadeIn");
                ayatEl.classList.add("fadeOut");
                setTimeout(() => {
                    ayatEl.textContent = ayatList[ayatIndex];
                    ayatEl.classList.remove("fadeOut");
                    ayatEl.classList.add("fadeIn");
                    ayatIndex = (ayatIndex + 1) % ayatList.length;
                }, 1000);
            }
            setInterval(changeAyat, 8000);
            changeAyat();

            function updateClock() {
                const now = new Date();
                const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
                document.getElementById('gregorian-date').textContent = now.toLocaleDateString('ar-EG', options);
                document.getElementById('clock').textContent = now.toLocaleTimeString('ar-EG');
            }
            setInterval(updateClock, 1000);
            updateClock();

            function gregorianToHijri(gDate) {
                let jd = (gDate / 86400000) + 2440587.5;
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
                document.getElementById('hijri-date').textContent = `هجري: ${hDate.day} / ${hDate.month} / ${hDate.year}`;
            }
            updateHijriDate();
        </script>
    </body>
    </html>
    """
    return HttpResponse(html)
