from flask import jsonify, request
from flask_jwt_extended import jwt_required
from . import bp_api
from models.database import db
from models.static.services import services

# Root route to confirm API is working
@bp_api.route('/', methods=['GET'])
def root():
    return jsonify({
        'message': 'API is working',
        'endpoints': {
            'appointments': '/api/appointments',
            'users': '/api/users',
            'auth': '/auth',
            'reports': '/api/reports',
            'services': '/api/services',
            'login': '/auth/login',
            'register': '/auth/register'
        }
    })

# get all appointments
@bp_api.route('/appointments', methods=['GET'])
def appoinments():
    appointments_qry_result = db.get_all_from('appointments')
    if not appointments_qry_result:
        return jsonify({'error':'no appointments found'}), 404
    appointments_list = []
    for appt in appointments_qry_result:
        appointments_list.append(vars(appt))
    return jsonify(appointments_list), 200

# get single appointment
@bp_api.route('/appointments/<int:appt_id>', methods=['GET'])
def appointment(appt_id):
    appointment_result = db.get_first_matching('appointments', f'appointment_id={appt_id}', 'appointment_id')
    if not appointment_result:
        return jsonify({'error':f'no appointment with id {appt_id} exists'}), 404
    return jsonify(vars(appointment_result)), 200
@bp_api.route('/reports/<int:report_id>', methods=['GET'])
def report(report_id):
    report_result = db.get_first_matching('reports', f'report_id={report_id}', 'report_id')
    if not report_result:
        return jsonify({'error':f'no report with id {report_id} exists'}), 404
    return jsonify(vars(report_result)), 200
@bp_api.route('/reports', methods=['GET'])
def reports():
    reports_qry_result = db.get_all_from('reports')
    if not reports_qry_result:
        return jsonify({'error':'no reports found'}), 404
    reports_list = []
    for report in reports_qry_result:
        reports_list.append(vars(report))
    return jsonify(reports_list), 200

# get all users
@bp_api.route('/users', methods=['GET'])
def users():
    """Return all users"""
    users = db.get_all_from('users')
    if not users:
        return jsonify({'error':'no users found'}), 404
    
    # Convert the list of User objects to a list of dictionaries
    users_list = []
    for user in users:
        users_list.append({
            'user_id': user.user_id,
            'username': user.username,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'email': user.email,
            'specialty': user.specialty,
            'hourly_rate': user.hourly_rate
        })
    return jsonify(users_list), 200

# get single user
@bp_api.route('/users/<int:user_id>', methods=['GET'])
def user(user_id):
    """Return a specific user by ID"""
    user = db.get_first_matching('users', f'user_id={user_id}', 'user_id')
    if not user:
        return jsonify({'error': f'No user with id {user_id} exists'}), 404
    return jsonify(vars(user)), 200

# get all services
@bp_api.route('/services', methods=['GET'])
def get_services():
    """Return all available services"""
    return jsonify(services), 200

# get single service
@bp_api.route('/services/<int:service_id>', methods=['GET'])
def get_service(service_id):
    """Return a specific service by ID"""
    service = next((s for s in services if s['service_id'] == service_id), None)
    if not service:
        return jsonify({'error': f'No service with id {service_id} exists'}), 404
    return jsonify(service), 200
