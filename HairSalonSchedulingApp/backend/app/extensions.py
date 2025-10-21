from flask_login import LoginManager
from flask_caching import Cache
from flask_jwt_extended import JWTManager

login_manager = LoginManager()
cache = Cache()
jwt = JWTManager()