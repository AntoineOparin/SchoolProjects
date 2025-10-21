import os
import secrets

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or secrets.token_hex(32)
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or secrets.token_hex(32)
    JWT_ACCESS_TOKEN_EXPIRES = 900 # 15 minutes
    JWT_REFRESH_TOKEN_EXPIRES = 604800  # 7 days

    # Cache configuration
    CACHE_TYPE = "SimpleCache"  # Use simple in-memory caching
    CACHE_DEFAULT_TIMEOUT = 300  # Cache timeout in seconds (5 minutes)

    try:
        DATABASE_HOST = os.environ['DATABASE_HOST'] 
        DATABASE_NAME = os.environ['DATABASE_NAME']
        DATABASE_USER = os.environ['DATABASE_USER']
        DATABASE_PASSWORD = os.environ['DATABASE_PASSWORD']
        DATABASE_PORT = os.environ['DATABASE_PORT']
        
    except KeyError as e:
        raise RuntimeError(f"Missing required environment variable: {e}")
