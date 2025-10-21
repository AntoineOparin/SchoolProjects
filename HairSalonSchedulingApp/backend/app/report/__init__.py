from flask import Blueprint

bp_report = Blueprint('bp_report', __name__)

from . import routes
