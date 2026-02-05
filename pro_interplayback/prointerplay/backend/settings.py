from pathlib import Path
import os
from datetime import timedelta
import dj_database_url

# Build paths
BASE_DIR = Path(__file__).resolve().parent.parent

# -------------------
# Segurança
# -------------------
SECRET_KEY = os.getenv("SECRET_KEY", "fallback-secret-key")
DEBUG = os.getenv("DEBUG", "False") == "True"

# Render vai disponibilizar o domínio do backend
ALLOWED_HOSTS = ["*"]  # depois você pode colocar só seu domínio Render

# -------------------
# Aplicações
# -------------------
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'core.apps.CoreConfig',
    'users',
]

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
        "rest_framework.authentication.SessionAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.AllowAny",
    ),
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=60),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "AUTH_HEADER_TYPES": ("Bearer",),
}

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# -------------------
# URLs e Templates
# -------------------
ROOT_URLCONF = 'backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'backend.wsgi.application'

# -------------------
# Banco de dados (PostgreSQL no Render)
# -------------------
DATABASES = {
    "default": dj_database_url.config(
        default=os.getenv("DATABASE_URL")
    )
}

# -------------------
# Senhas
# -------------------
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',},
]

# -------------------
# Internacionalização
# -------------------
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# -------------------
# Arquivos estáticos e mídia
# -------------------
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / "staticfiles"  # Render precisa disso

MEDIA_ROOT = BASE_DIR / "media"
MEDIA_URL = "/media/"

# -------------------
# CORS
# -------------------
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",  # frontend local
    "https://interplaydeploy.onrender.com"  # frontend deployado
]

# -------------------
# Custom user
# -------------------
AUTH_USER_MODEL = 'users.User'

# -------------------
# Logging
# -------------------
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {'console': {'class': 'logging.StreamHandler',}},
    'loggers': {'django.request': {'handlers': ['console'],'level': 'DEBUG','propagate': True,}},
}
