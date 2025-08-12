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
                margin: 0;
                padding: 0;
                font-family: 'Cairo', sans-serif;
                background: linear-gradient(135deg, #2c3e50, #4ca1af);
                color: #f0f8ff;
                min-height: 100vh;
                display: flex;
                justify-content: center;
                align-items: center;
                text-align: center;
                direction: rtl;
            }

            .container {
                background-color: rgba(0, 0, 0, 0.45);
                padding: 45px 35px;
                border-radius: 30px;
                max-width: 650px;
                box-shadow: 0 12px 30px rgba(0, 0, 0, 0.7);
            }

            img {
                width: 120px;
                margin-bottom: 30px;
                filter: drop-shadow(0 0 10px #00fff7);
            }

            h1 {
                font-size: 3rem;
                margin-bottom: 18px;
                letter-spacing: 2px;
                text-shadow: 2px 2px 8px #001f26;
            }

            p.desc {
                font-size: 1.3rem;
                margin-bottom: 45px;
                color: #cce7e8cc;
                line-height: 1.6;
                font-weight: 600;
            }

            a {
                display: inline-block;
                text-decoration: none;
                background: #008080;
                color: #e0f7f7;
                padding: 16px 42px;
                margin: 12px 18px;
                border-radius: 45px;
                font-weight: 700;
                font-size: 1.2rem;
                box-shadow: 0 7px 16px rgba(0, 128, 128, 0.6);
                transition: background-color 0.3s ease, color 0.3s ease, box-shadow 0.3s ease;
            }

            a:hover {
                background: #00b3b3;
                color: #001f26;
                box-shadow: 0 10px 25px rgba(0, 179, 179, 0.9);
            }

            .footer-links {
                margin-top: 55px;
                font-size: 1.1rem;
                color: #a0d8d8cc;
                line-height: 1.8;
                font-weight: 600;
            }

            .footer-links a {
                color: #a0d8d8cc;
                margin: 0 12px;
                text-decoration: underline;
                transition: color 0.25s ease;
            }

            .footer-links a:hover {
                color: #f0ffff;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <img src="https://upload.wikimedia.org/wikipedia/commons/9/94/Quran_cover%2C_Mashhad%2C_Iran.jpg" alt="شعار القرآن الكريم" />
            <h1>بسم الله الرحمن الرحيم</h1>
            <p class="desc">مرحبًا بك في تطبيق حفظ القرآن الكريم، رفيقك الأمين في رحلتك المباركة لحفظ كتاب الله العظيم.</p>
            
            <a href="https://gleeful-haupia-3d4fa4.netlify.app/" target="_blank" rel="noopener noreferrer">الدخول للمستخدم</a>
            <a href="/admin/">الدخول لصفحة الإدارة</a>
            
            <div class="footer-links">
                <a href="https://quran.com/" target="_blank" rel="noopener noreferrer">المصحف الإلكتروني</a> | 
                <a href="https://quranexplorer.com/" target="_blank" rel="noopener noreferrer">تفسير القرآن</a> | 
                <a href="https://quran.ksu.edu.sa/" target="_blank" rel="noopener noreferrer">المكتبة القرآنية</a> | 
                <a href="https://www.qurango.com/" target="_blank" rel="noopener noreferrer">قراءة القرآن</a> | 
                <a href="https://quranicaudio.com/" target="_blank" rel="noopener noreferrer">استماع للقرآن</a> | 
                <a href="https://tafsir.com/" target="_blank" rel="noopener noreferrer">تفسير القرآن</a>
            </div>
        </div>
    </body>
    </html>
    """
    return HttpResponse(html)
