from django.http import HttpResponse

def home(request):
    html = """
    <html lang="ar" dir="rtl">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>تطبيق حفظ القرآن الكريم</title>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Amiri&display=swap');

            body {
                margin: 0;
                padding: 0;
                font-family: 'Amiri', serif;
                background: #f7f9f9;
                color: #1a1a1a;
                min-height: 100vh;
                display: flex;
                justify-content: center;
                align-items: center;
                text-align: center;
                direction: rtl;
            }

            .container {
                background-color: #ffffff;
                padding: 50px 40px;
                border-radius: 25px;
                max-width: 600px;
                box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
            }

            img {
                width: 120px;
                margin-bottom: 25px;
                filter: drop-shadow(0 0 10px #005f27);
            }

            h1 {
                font-size: 3rem;
                margin-bottom: 15px;
                font-weight: 700;
                color: #005f27;
                letter-spacing: 2px;
            }

            p.desc {
                font-size: 1.2rem;
                margin-bottom: 40px;
                color: #4d4d4d;
                line-height: 1.6;
                font-weight: 500;
            }

            a {
                display: inline-block;
                text-decoration: none;
                background: #007a3d;
                color: #fff;
                padding: 15px 35px;
                margin: 10px 15px;
                border-radius: 40px;
                font-weight: 700;
                font-size: 1.15rem;
                box-shadow: 0 6px 10px rgba(0, 122, 61, 0.6);
                transition: background-color 0.3s ease, color 0.3s ease;
            }

            a:hover {
                background: #005f27;
                color: #e0f2f1;
                box-shadow: 0 8px 15px rgba(0, 95, 39, 0.8);
            }

            .footer-links {
                margin-top: 50px;
                font-size: 1rem;
                color: #737373;
            }

            .footer-links a {
                color: #737373;
                margin: 0 10px;
                font-weight: 600;
                text-decoration: underline;
            }

            .footer-links a:hover {
                color: #005f27;
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
            
            <div class="footer-links">
                <a href="https://quran.com/" target="_blank" rel="noopener noreferrer">المصحف الإلكتروني</a> | 
                <a href="https://quranexplorer.com/" target="_blank" rel="noopener noreferrer">تفسير القرآن</a> | 
                <a href="https://quran.ksu.edu.sa/" target="_blank" rel="noopener noreferrer">المكتبة القرآنية</a> |
                <a href="https://www.qurancentral.com/" target="_blank" rel="noopener noreferrer">مواقع الاستماع</a> |
                <a href="https://www.quranwow.com/" target="_blank" rel="noopener noreferrer">مواقع القراءة</a>
            </div>
        </div>
    </body>
    </html>
    """
    return HttpResponse(html)
