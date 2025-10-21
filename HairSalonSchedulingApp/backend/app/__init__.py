from flask import Flask
from config import Config
from flask_cors import CORS
from .extensions import login_manager, cache, jwt
from models.database import db

from .api import bp_api
from .administration import bp_admin
from .authentication import bp_auth
from .appointment import bp_appointment
from .report import bp_report


def create_app():
    app = Flask(__name__, static_url_path='/static', static_folder='static')
    app.config.from_object(Config)

    app.config['JWT_SECRET_KEY'] = Config.JWT_SECRET_KEY
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = Config.JWT_ACCESS_TOKEN_EXPIRES
    app.config['JWT_REFRESH_TOKEN_EXPIRES'] = Config.JWT_REFRESH_TOKEN_EXPIRES
    app.config['MAX_CONTENT_LENGTH'] = 5 * 1024 * 1024  # 5MB max file size

    # Configure CORS with specific settings
    CORS(app, 
         origins="*",
         supports_credentials=True,
         expose_headers=["Content-Type", "Authorization"],
         allow_headers=["Content-Type", "Authorization"],
         methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])

    # Initialize extensions
    login_manager.init_app(app)
    cache.init_app(app)
    jwt.init_app(app)

    # Initialize database
    try:
        db.__init__()
        print("Database connection successful")
    except Exception as e:
        print(f"Database connection error: {e}")
        raise e

    # Register blueprints
    app.register_blueprint(bp_api, url_prefix='/api')
    app.register_blueprint(bp_auth, url_prefix='/auth')
    app.register_blueprint(bp_admin, url_prefix='/admin')
    app.register_blueprint(bp_appointment, url_prefix='/appointments')
    app.register_blueprint(bp_report, url_prefix='/reports')
    
    return app
