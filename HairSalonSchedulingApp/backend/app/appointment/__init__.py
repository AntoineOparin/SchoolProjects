from flask import Blueprint

bp_appointment = Blueprint('bp_appointment', __name__)

from . import routes