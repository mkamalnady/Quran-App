from django.http import HttpResponse

def home(request):
    html = """
    <html lang="ar" dir="rtl">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>تطبيق حفظ القرآن الكريم</title>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Reem+Kufi&display=swap');

            body {
                margin: 0;
                padding: 0;
                font-family: 'Reem Kufi', sans-serif;
                background: linear-gradient(135deg, #3a8869, #88b04b);
                color: #fff;
                min-height: 100vh;
                display: flex;
                justify-content: center;
                align-items: center;
                text-align: center;
                direction: rtl;
            }

            .container {
                background-color: rgba(0, 0, 0, 0.35);
                padding: 40px 30px;
                border-radius: 25px;
                max-width: 600px;
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
            }

            img {
                width: 110px;
                margin-bottom: 25px;
                filter: drop-shadow(0 0 10px #ffd700);
            }

            h1 {
                font-size: 2.8rem;
                margin-bottom: 15px;
                letter-spacing: 2px;
                text-shadow: 2px 2px 6px #2a5d37;
            }

            p.desc {
                font-size: 1.2rem;
                margin-bottom: 40px;
                color: #e0f2f1cc;
                line-height: 1.5;
                font-weight: 500;
            }

            a {
                display: inline-block;
                text-decoration: none;
                background: #ffd700;
                color: #3a8869;
                padding: 15px 35px;
                margin: 10px 15px;
                border-radius: 40px;
                font-weight: 700;
                font-size: 1.15rem;
                box-shadow: 0 6px 10px rgba(255, 215, 0, 0.6);
                transition: background-color 0.3s ease, color 0.3s ease;
            }

            a:hover {
                background: #fff;
                color: #2a5d37;
                box-shadow: 0 8px 15px rgba(255, 255, 255, 0.8);
            }

            /* تصميم الروابط الصغيرة أسفل */
            .footer-links {
                margin-top: 50px;
                font-size: 1rem;
                color: #c5e1a5cc;
            }

            .footer-links a {
                color: #c5e1a5cc;
                margin: 0 10px;
                font-weight: 600;
                text-decoration: underline;
            }

            .footer-links a:hover {
                color: #fff;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <img src="https://cdn-icons-png.flaticon.com/512/1472/1472886.png" alt="شعار القرآن الكريم" />
            <h1>بسم الله الرحمن الرحيم</h1>
            <p class="desc">مرحبًا بك في تطبيق حفظ القرآن الكريم، رفيقك الأمين في رحلتك المباركة لحفظ كتاب الله.</p>
            
            <a href="https://gleeful-haupia-3d4fa4.netlify.app/login" target="_blank" rel="noopener noreferrer">الدخول للمستخدم</a>
            <a href="/admin/">الدخول لصفحة الإدارة</a>
            
            <div class="footer-links">
                <a href="https://quran.com/" target="_blank" rel="noopener noreferrer">المصحف الإلكتروني</a> | 
                <a href="https://quranexplorer.com/" target="_blank" rel="noopener noreferrer">تفسير القرآن</a> | 
                <a href="https://quran.ksu.edu.sa/" target="_blank" rel="noopener noreferrer">المكتبة القرآنية</a>
            </div>
        </div>
    </body>
    </html>
    """
    return HttpResponse(html)
