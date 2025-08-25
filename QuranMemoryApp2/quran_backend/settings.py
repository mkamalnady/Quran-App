# quran_backend/settings.py

import os
from pathlib import Path
import dj_database_url
from decouple import config  # تأكد من استيراد config

BASE_DIR = Path(__file__).resolve().parent.parent

# Secret key و debug
SECRET_KEY = config('SECRET_KEY', default='django-insecure-your-secret-key-goes-here')
DEBUG = config('DEBUG', default='False').lower() in ('1', 'true', 'yes')

ALLOWED_HOSTS = [
    "localhost",
    "127.0.0.1",
    "gleeful-haupia-3d4fa4.netlify.app",
    "quran-app-8ay9.onrender.com",
]

# Applications
INSTALLED_APPS = [
    'api.apps.ApiConfig',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.sites',
    'rest_framework',
    'rest_framework.authtoken',
    'corsheaders',
    'allauth',
    'allauth.account',
    'allauth.socialaccount',
    'dj_rest_auth',
    'dj_rest_auth.registration',
]

SITE_ID = 1

# Middleware
MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    'django.middleware.security.SecurityMiddleware',
    "whitenoise.middleware.WhiteNoiseMiddleware",
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'allauth.account.middleware.AccountMiddleware',
]

ROOT_URLCONF = 'quran_backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / "quran_backend"],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'quran_backend.wsgi.application'
ASGI_APPLICATION = 'quran_backend.asgi.application'

# Database
DATABASE_URL = config("DATABASE_URL", default="")  # من env أو فارغ
if DATABASE_URL:
    # PostgreSQL على Render
    DATABASES = {
        "default": dj_database_url.parse(
            DATABASE_URL,
            conn_max_age=600,
            ssl_require=True
        )
    }
    SECURE_SSL_REDIRECT = not DEBUG
    SECURE_HSTS_SECONDS = 31536000 if not DEBUG else 0
    SECURE_HSTS_INCLUDE_SUBDOMAINS = not DEBUG
    SECURE_HSTS_PRELOAD = not DEBUG
    SESSION_COOKIE_SECURE = not DEBUG
    CSRF_COOKIE_SECURE = not DEBUG
else:
    # SQLite للتطوير المحلي
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",
        }
    }

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# Internationalization
LANGUAGE_CODE = 'ar'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# Static files
STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

# DRF
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework.authentication.TokenAuthentication",
        "rest_framework.authentication.SessionAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.AllowAny",
    ],
}

# CORS/CSRF
CORS_ALLOWED_ORIGINS = [
    "https://gleeful-haupia-3d4fa4.netlify.app",
]
CSRF_TRUSTED_ORIGINS = [
    "https://quran-app-8ay9.onrender.com",
    "https://gleeful-haupia-3d4fa4.netlify.app",
]

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
