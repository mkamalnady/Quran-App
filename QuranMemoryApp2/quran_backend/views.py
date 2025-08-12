from django.http import HttpResponse

def home(request):
    html = """
    <html>
    <head>
        <title>تطبيق حفظ القرآن</title>
        <style>
            body { font-family: Arial, sans-serif; direction: rtl; text-align: center; padding: 50px; background-color: #f0f4f8; }
            a { text-decoration: none; color: #1e88e5; font-weight: bold; }
            a:hover { color: #1565c0; }
            img { width: 100px; margin-bottom: 20px; }
            .container { max-width: 600px; margin: auto; background: white; padding: 20px; border-radius: 12px; box-shadow: 0 0 10px rgba(0,0,0,0.1);}
        </style>
    </head>
    <body>
        <div class="container">
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Quran-Icon.png/120px-Quran-Icon.png" alt="شعار القرآن">
            <h1>مرحبًا بك في تطبيق حفظ القرآن الكريم</h1>
            <p>تابع رحلتك في حفظ القرآن عبر تطبيقنا المتميز.</p>
            <p><a href="https://gleeful-haupia-3d4fa4.netlify.app/login">الدخول للمستخدم</a></p>
            <p><a href="/admin/">صفحة الإدارة</a></p>
        </div>
    </body>
    </html>
    """
    return HttpResponse(html)
