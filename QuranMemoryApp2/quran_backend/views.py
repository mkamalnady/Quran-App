from django.http import HttpResponse

def home(request):
    html = """
    <html lang="ar" dir="rtl">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>تطبيق حفظ القرآن الكريم</title>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap'); /* نص عام */
            @import url('https://fonts.googleapis.com/css2?family=Amiri+Quran&display=swap'); /* آيات القرآن */

            :root{
                --green-700:#1b5e20;
                --green-600:#2e7d32;
                --green-500:#388e3c;
                --teal-700:#00695c;
                --gold:#d4af37;
                --paper:#fffdfa;
                --ink:#2c3e50;
                --muted:#7f8c8d;
            }

            *{box-sizing:border-box}
            html,body{height:100%}

            body {
                margin: 0; padding: 0;
                font-family: 'Cairo', sans-serif;
                color: var(--ink);
                /* خلفية نقوش + تدرج شفاف */
                background:
                    linear-gradient(135deg, rgba(232,245,233,0.9), rgba(254,249,231,0.9)),
                    url('https://freesvg.org/img/islamic-geometric-tile.png');
                background-size: cover, 280px 280px;
                background-attachment: fixed, fixed;
                display: flex; flex-direction: column;
                align-items: center;
            }

            /* شريط الآيات (المسطرة) يمتد عرض الصفحة بالكامل */
            .marquee-wrap {
                position: sticky; /* يظل مرئيًا عند التمرير */
                top: 0;
                width: 100%;
                background: radial-gradient(ellipse at center, #fefcf6 0%, #fbf6ea 100%);
                border-bottom: 2px solid rgba(212,175,55,0.35);
                border-top: 2px solid rgba(212,175,55,0.35);
                box-shadow: 0 6px 12px rgba(0,0,0,0.06);
                z-index: 10;
            }
            .marquee {
                overflow: hidden;
                position: relative;
                width: 100%;
                white-space: nowrap;
                user-select: none;
            }
            .marquee__inner {
                display: inline-flex;
                gap: 60px;
                padding: 10px 0;
                will-change: transform;
                animation: scroll-x 35s linear infinite; /* حركة مستمرة */
            }
            .marquee:hover .marquee__inner { animation-play-state: paused; } /* وقف الحركة عند الهوفر */

            .ayah {
                font-family: 'Amiri Quran', serif; /* خط القرآن */
                font-size: 1.35rem;
                color: var(--teal-700);
                text-shadow: 0 1px 0 #ffffff;
                letter-spacing: 0.2px;
            }

            @keyframes scroll-x {
                from { transform: translateX(100%); }
                to   { transform: translateX(-100%); }
            }

            /* منطقة المحتوى الرئيسية */
            .page {
                flex: 1 0 auto;
                width: 100%;
                display: flex;
                justify-content: center;
                align-items: center;
                padding: 40px 16px 70px; /* مسافة أسفل كبيرة لإظهار كل العناصر */
            }

            .container {
                background: linear-gradient(180deg, rgba(255,255,255,0.97), rgba(255,255,255,0.94));
                padding: 50px 44px 70px;
                border-radius: 26px;
                max-width: 780px;
                width: 100%;
                position: relative;
                border: 5px double var(--gold);
                box-shadow:
                    0 18px 35px rgba(0,0,0,0.12),
                    inset 0 0 0 1px rgba(212,175,55,0.25);
                backdrop-filter: blur(6px);
                background-image:
                    radial-gradient(circle at 10% 10%, rgba(212,175,55,0.08), transparent 40%),
                    radial-gradient(circle at 90% 90%, rgba(46,125,50,0.06), transparent 42%);
                background-blend-mode: screen;
            }

            /* نقوش زاوية ذهبية ناعمة */
            .container::before, .container::after{
                content:"";
                position:absolute;
                width: 110px; height: 110px;
                background: conic-gradient(from 0deg, rgba(212,175,55,0.35), rgba(212,175,55,0.05));
                filter: blur(0.2px);
                border-radius: 8px;
                mask: radial-gradient(circle at 0 0, black 30%, transparent 32%);
                pointer-events: none;
            }
            .container::before{ top:-12px; right:-12px; }
            .container::after { bottom:-12px; left:-12px; }

            /* رأس الصفحة ومساحة اللوجو */
            .header {
                display:flex;
                flex-direction:column;
                align-items:center;
                margin-bottom: 24px;
            }
            .logo {
                width: 132px; /* أكبر لإظهار الشعار كاملًا */
                height: auto;
                margin: 8px auto 14px;
                filter: drop-shadow(0 0 10px rgba(46,125,50,0.35));
            }
            h1 {
                font-size: 2.6rem;
                margin: 0 0 10px;
                font-weight: 700;
                color: var(--green-600);
                letter-spacing: 1px;
                text-shadow: 0 1px 2px rgba(200,230,201,0.9);
            }
            p.desc {
                font-size: 1.12rem;
                margin: 0 0 26px;
                color: #4a4a4a;
                line-height: 1.9;
                font-weight: 500;
            }

            /* الأزرار */
            .actions {
                margin: 6px 0 14px;
            }
            a.btn {
                display: inline-block;
                text-decoration: none;
                background: linear-gradient(90deg, var(--green-600), var(--green-700));
                color: #fff;
                padding: 13px 34px;
                margin: 8px 10px;
                border-radius: 40px;
                font-weight: 700;
                font-size: 1.06rem;
                box-shadow: 0 6px 12px rgba(46,125,50,0.35);
                border: 2px solid rgba(212,175,55,0.7);
                transition: transform 0.25s ease, box-shadow 0.25s ease, background 0.25s ease;
            }
            a.btn:hover {
                background: linear-gradient(90deg, var(--green-500), var(--green-700));
                transform: translateY(-3px);
                box-shadow: 0 14px 26px rgba(27,94,32,0.45);
            }

            /* آية ثابتة داخل الصندوق (غير المسطرة) */
            #ayat {
                font-size: 1.4rem;
                font-family: 'Amiri Quran', serif;
                font-weight: 600;
                color: var(--teal-700);
                margin-top: 28px;
                min-height: 60px;
                transition: opacity 0.9s ease, transform 0.9s ease;
                opacity: 1;
            }
            #ayat.fadeOut { opacity: 0; transform: translateY(12px); }
            #ayat.fadeIn  { opacity: 1; transform: translateY(0); }

            /* روابط الفوتر داخل الصندوق */
            .footer-links {
                margin-top: 30px;
                font-size: 1rem;
                color: var(--muted);
            }
            .footer-links a {
                color: var(--muted);
                margin: 0 8px;
                font-weight: 600;
                text-decoration: underline;
                text-underline-offset: 3px;
            }
            .footer-links a:hover { color: var(--green-600); }

            /* التاريخ والساعة */
            .datetime-container {
                margin-top: 22px;
                display: flex;
                justify-content: center;
                gap: 14px;
                font-weight: 700;
                color: var(--ink);
                font-size: 0.95rem;
                flex-wrap: wrap;
            }
            .datetime-item {
                background: #f4f9ee;
                padding: 8px 14px;
                border-radius: 14px;
                border: 1px solid rgba(205,220,57,0.8);
                box-shadow: 0 2px 6px rgba(0,0,0,0.08);
            }

            /* أسفل الصفحة */
            .site-footer{
                flex-shrink: 0;
                width: 100%;
                text-align: center;
                padding: 14px 10px 18px;
                color: #5f6a6a;
                font-size: 0.95rem;
            }

            /* تجاوبية */
            @media (max-width: 600px){
                h1{ font-size: 2.1rem; }
                .logo{ width: 112px; }
                .ayah{ font-size: 1.15rem; }
                #ayat{ font-size: 1.2rem; }
                .container{ padding: 34px 20px 56px; }
            }
        </style>
    </head>
    <body>

        <!-- مسطرة الآيات أعلى الصفحة بكامل العرض -->
        <div class="marquee-wrap" aria-label="آيات متحركة">
            <div class="marquee">
                <div class="marquee__inner" id="marqueeInner">
                    <!-- سيتم ملؤها ديناميكياً بنسختين لضمان التمرير السلس -->
                </div>
            </div>
        </div>

        <main class="page">
            <div class="container">
                <header class="header">
                    <img class="logo" src="https://gleeful-haupia-3d4fa4.netlify.app/quran-logo.png" alt="شعار القرآن الكريم" />
                    <h1>بسم الله الرحمن الرحيم</h1>
                    <p class="desc">مرحبًا بك في تطبيق حفظ القرآن الكريم، رفيقك الأمين في رحلتك المباركة لحفظ كتاب الله.</p>
                </header>

                <div class="actions">
                    <a class="btn" href="https://gleeful-haupia-3d4fa4.netlify.app/" target="_blank" rel="noopener noreferrer">الدخول للمستخدم</a>
                    <a class="btn" href="/admin/">الدخول لصفحة الإدارة</a>
                </div>

                <div id="ayat" aria-live="polite">﴿ وَقُل رَّبِّ زِدْنِي عِلْمًا ﴾</div>

                <div class="footer-links">
                    <a href="https://quran.com/" target="_blank" rel="noopener noreferrer">المصحف الإلكتروني</a> | 
                    <a href="https://quranexplorer.com/" target="_blank" rel="noopener noreferrer">تفسير القرآن</a> | 
                    <a href="https://quran.ksu.edu.sa/" target="_blank" rel="noopener noreferrer">المكتبة القرآنية</a> |
                    <a href="https://www.qurancentral.com/" target="_blank" rel="noopener noreferrer">مواقع الاستماع</a> |
                    <a href="https://www.quranwow.com/" target="_blank" rel="noopener noreferrer">مواقع القراءة</a>
                </div>

                <div class="datetime-container">
                    <div class="datetime-item" id="gregorian-date">---</div>
                    <div class="datetime-item" id="hijri-date">---</div>
                    <div class="datetime-item" id="clock">---</div>
                </div>
            </div>
        </main>

        <footer class="site-footer">
            © {new Date().getFullYear()} تطبيق حفظ القرآن الكريم
        </footer>

        <script>
            // قائمة الآيات (يمكن الزيادة)
            const ayatList = [
                "﴿ وَقُل رَّبِّ زِدْنِي عِلْمًا ﴾",
                "﴿ إِنَّ مَعَ الْعُسْرِ يُسْرًا ﴾",
                "﴿ فَاذْكُرُونِي أَذْكُرْكُمْ ﴾",
                "﴿ يَا أَيُّهَا الَّذِينَ آمَنُوا اتَّقُوا اللَّهَ ﴾",
                "﴿ وَالصُّبْحِ إِذَا تَنَفَّسَ ﴾",
                "﴿ أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ ﴾"
            ];

            /* مسطرة آيات أفقية كاملة العرض بتقنية نسخ المحتوى لتدفق سلس */
            const marqueeInner = document.getElementById("marqueeInner");
            function buildMarquee(){
                const track = document.createElement("div");
                track.style.display = "inline-flex";
                track.style.gap = "60px";
                ayatList.forEach(a=>{
                    const span = document.createElement("span");
                    span.className = "ayah";
                    span.textContent = a;
                    track.appendChild(span);
                });
                return track;
            }
            // ضع نسختين لضمان الاستمرارية
            marqueeInner.appendChild(buildMarquee());
            marqueeInner.appendChild(buildMarquee());

            // آية داخل الصندوق تتغير بتأثير لطيف
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
                }, 900);
            }
            setInterval(changeAyat, 7000);
            changeAyat();

            // التاريخ والساعة الميلادي
            function updateClock() {
                const now = new Date();
                const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
                document.getElementById('gregorian-date').textContent = now.toLocaleDateString('ar-EG', options);
                document.getElementById('clock').textContent = now.toLocaleTimeString('ar-EG');
            }
            setInterval(updateClock, 1000);
            updateClock();

            // تحويل تقريبي للهجري
            function gregorianToHijri(gTime) {
                let jd = (gTime / 86400000) + 2440587.5;
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

            // سنة الفوتر
            document.querySelector(".site-footer").innerHTML = "© " + new Date().getFullYear() + " تطبيق حفظ القرآن الكريم";
        </script>
    </body>
    </html>
    """
    return HttpResponse(html)
