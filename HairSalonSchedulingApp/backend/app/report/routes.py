from flask_jwt_extended import jwt_required, get_jwt_identity
from models.database import db
from flask import request, jsonify
from . import bp_report
from datetime import datetime

def validate_report_data(data, current_user):
    errors = {}
    if not data:
        errors['general'] = "No data provided"
        return errors
    valid_statuses = ['Pending', 'Completed', 'Cancelled']
    if 'status' in data and data['status'] not in valid_statuses:
        errors['status'] = f"Status must be one of: {', '.join(valid_statuses)}"
    if current_user.user_type in ['professional', 'appointment_admin']:
        if not data.get('professional_feedback', '').strip():
            errors['professional_feedback'] = "Professional feedback is required"

    if 'date' in data:
        try:
            datetime.strptime(data['date'], '%Y-%m-%d')
        except ValueError:
            errors['date'] = "Invalid date format (YYYY-MM-DD required)"
    return errors

@bp_report.route('/appointments/<int:appointment_id>/report', methods=['POST'])
@jwt_required()
def create_report(appointment_id):
    try:
        # Get user info from token
        user_id = int(get_jwt_identity())
        user = db.get_one_matching('users', f"user_id = {user_id}")
        if not user:
            return jsonify({'error': 'User not found'}), 404

        # Get appointment
        appointment = db.get_one_matching('appointments', f'appointment_id = {appointment_id}')
        if not appointment:
            return jsonify({'error': 'Appointment not found'}), 404
        
        # Check if user has permission to create report
        is_admin = user.user_type in ['appointment_admin', 'super_admin']
        is_client = appointment.client_id == user_id
        is_professional = appointment.professional_id == user_id

        if not (is_admin or is_client or is_professional):
            return jsonify({
                'error': 'You can only create reports for your own appointments',
                'debug': {
                    'user_id': user_id,
                    'user_type': user.user_type,
                    'appointment_client_id': appointment.client_id,
                    'appointment_professional_id': appointment.professional_id
                }
            }), 403

        # Check if report already exists
        existing_report = db.get_one_matching('reports', f'appointment_id = {appointment_id}')
        if existing_report:
            return jsonify({'error': 'A report already exists for this appointment'}), 400

        # Get data from request
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400

        # Create report
        report = {
            'appointment_id': appointment_id,
            'status': 'Pending',
            'date': datetime.now().strftime('%Y-%m-%d'),
            'professional_feedback': data.get('professional_feedback', ''),
            'client_feedback': data.get('client_feedback', ''),
            'client_id': appointment.client_id,
            'professional_id': appointment.professional_id
        }

        # Save report to database
        fields = ', '.join(report.keys())
        values = ', '.join([f"'{v}'" if isinstance(v, str) else str(v) for v in report.values()])
        db.insert_obj_into_db(fields, values, 'reports')

        # Get the created report
        created_report = db.get_first_matching('reports', f'appointment_id = {appointment_id}', 'report_id DESC')
        if not created_report:
            return jsonify({'error': 'Failed to create report'}), 500

        return jsonify({
            'message': 'Report created successfully',
            'report_id': created_report.report_id
        }), 201

    except Exception as e:
        print(f"Error creating report: {str(e)}")
        return jsonify({'error': 'Internal server error', 'details': str(e)}), 500

@bp_report.route('/appointments/<int:appointment_id>/report', methods=['GET'])
@jwt_required()
def get_report(appointment_id):
    current_user_id = int(get_jwt_identity())
    current_user = db.get_one_matching('users', f"user_id = {current_user_id}")
    if not current_user:
        return jsonify({"error": "User not found"}), 404
        
    appointment = db.get_one_matching('appointments', f'appointment_id = {appointment_id}')
    if not appointment:
        return jsonify({"error": "Appointment not found"}), 404
        
    # Determine user's role and permissions
    is_client = current_user_id == appointment.client_id
    is_professional = current_user_id == appointment.professional_id
    is_admin = current_user.user_type in ['appointment_admin', 'super_admin']
    
    # Check if user has any access to this appointment
    if not (is_client or is_professional or is_admin):
        return jsonify({"error": "Unauthorized"}), 403
    
    # Get report if it exists
    report = db.get_one_matching('reports', f'appointment_id = {appointment_id}')
    
    # Convert report to dictionary if it exists
    report_dict = None
    if report:
        report_dict = {
            'report_id': report.report_id,
            'appointment_id': report.appointment_id,
            'status': report.status,
            'date': report.date.isoformat() if report.date else None,
            'professional_feedback': report.professional_feedback,
            'client_feedback': report.client_feedback,
            'client_id': report.client_id,
            'professional_id': report.professional_id
        }
    
    # Determine user role and permissions
    user_role = {
        'is_client': is_client,
        'is_professional': is_professional,
        'is_admin': is_admin
    }
    
    permissions = {
        'can_edit': is_admin or (is_professional and report and report.status != 'Completed'),
        'can_create': is_admin or is_professional or is_client,
        'can_delete': is_admin,
        'can_add_client_feedback': is_client and report and report.status != 'Completed',
        'can_add_professional_feedback': is_professional and report and report.status != 'Completed'
    }
    
    # Return the report data with permissions and user role
    return jsonify({
        'report': report_dict,
        'permissions': permissions,
        'user_role': user_role
    }), 200

@bp_report.route('/appointments/<int:appointment_id>/report', methods=['PUT'])
@jwt_required()
def update_report(appointment_id):
    current_user_id = int(get_jwt_identity())
    current_user = db.get_one_matching('users', f"user_id = {current_user_id}")
    if not current_user:
        return jsonify({"error": "User not found"}), 404

    report = db.get_one_matching('reports', f'appointment_id = {appointment_id}')
    if not report:
        return jsonify({"error": "Report not found"}), 404

    appointment = db.get_one_matching('appointments', f'appointment_id = {appointment_id}')
    if not appointment:
        return jsonify({"error": "Associated appointment not found"}), 404

    if not (current_user_id in [appointment.client_id, appointment.professional_id] or 
            current_user.user_type == 'appointment_admin'):
        return jsonify({"error": "Unauthorized"}), 403

    data = request.get_json()
    errors = validate_report_data(data, current_user)
    if errors:
        return jsonify({"error": "Validation failed", "details": errors}), 400

    # Validate status transition
    if 'status' in data and data['status'] != report.status:
        if report.status == 'Completed' and current_user.user_type != 'appointment_admin':
            return jsonify({"error": "Only admin can change status from Completed"}), 400
        if report.status == 'Cancelled' and data['status'] != 'Cancelled':
            return jsonify({"error": "Cannot change status from Cancelled"}), 400

    # Build update fields
    updates = []
    allowed_fields = ['status', 'professional_feedback', 'client_feedback', 'date']
    for field in allowed_fields:
        if field in data:
            updates.append(f"{field} = '{data[field]}'")

    if updates:
        db.update_records_where('reports', ', '.join(updates), f"appointment_id = {appointment_id}")

    return jsonify({"message": "Report updated"}), 200

@bp_report.route('/<int:report_id>', methods=['DELETE'])
@jwt_required()
def delete_report(report_id):
    current_user_id = int(get_jwt_identity())
    current_user = db.get_one_matching('users', f"user_id = {current_user_id}")
    if not current_user:
        return jsonify({"error": "User not found"}), 404

    if current_user.user_type not in ['appointment_admin', 'super_admin']:
        return jsonify({"error": "Unauthorized"}), 403

    report = db.get_one_matching('reports', f'report_id = {report_id}')
    if not report:
        return jsonify({"error": "Report not found"}), 404

    db.delete_records_where('reports', f'report_id = {report_id}')
    return jsonify({"message": "Report deleted"}), 200

@bp_report.route('/user/<int:user_id>/reports', methods=['GET'])
@jwt_required()
def get_user_reports(user_id):
    current_user_id = int(get_jwt_identity())
    current_user = db.get_one_matching('users', f"user_id = {current_user_id}")
    if not current_user:
        return jsonify({"error": "User not found"}), 404
        
    # For non-admin users, only return their reports
    if current_user_id != user_id:
        return jsonify({"error": "Unauthorized"}), 403
        
    # Get appointments with reports for this user
    appointments = db.get_all_matching(
        'appointments',
        f'(client_id = {user_id} OR professional_id = {user_id})'
    )
    
    if not appointments:
        return jsonify([]), 200

    # Get reports for these appointments
    appointment_ids = [appt.appointment_id for appt in appointments]
    reports = db.get_all_matching(
        'reports',
        f'appointment_id IN ({",".join(map(str, appointment_ids))})'
    )

    # Create a mapping of appointment_id to appointment
    appointment_map = {appt.appointment_id: appt for appt in appointments}
    
    result = []
    for report in reports:
        appt = appointment_map.get(report.appointment_id)
        if appt:
            result.append({
                **report.__dict__,
                'appointment_id': appt.appointment_id,
                'client_id': appt.client_id,
                'professional_id': appt.professional_id,
                'appointment_date': appt.start_time,
                'appointment_time': appt.stop_time
            })
    
    return jsonify(result), 200


@bp_report.route('/admin/user/<int:user_id>/reports', methods=['GET'])
@jwt_required()
def get_all_admin_reports(user_id):
    current_user_id = int(get_jwt_identity())
    current_user = db.get_one_matching('users', f"user_id = {current_user_id}")
    if not current_user:
        return jsonify({"error": "User not found"}), 404
        
    # If user is admin, return all reports
    if current_user.user_type in ['appointment_admin', 'super_admin']:
        reports = db.get_all_from('reports')
        appointments = db.get_all_from('appointments')
        appointment_map = {appt.appointment_id: appt for appt in appointments}
        
        result = []
        for report in reports:
            appt = appointment_map.get(report.appointment_id)
            if appt:
                result.append({
                    **report.__dict__,
                    'appointment_id': appt.appointment_id,
                    'client_id': appt.client_id,
                    'professional_id': appt.professional_id,
                    'appointment_date': appt.start_time,
                    'appointment_time': appt.stop_time
                })
        return jsonify(result), 200
    else:
        return jsonify({"error": "Unauthorized"}), 403