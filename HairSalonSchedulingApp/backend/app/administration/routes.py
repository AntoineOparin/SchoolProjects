from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from . import bp_admin
from models.database import db
from models.static.services import services

#These routes assume that the user access levels are stored in the DB as follows:
#   blocked: a user of any type that has been blocked (0)
#   client: regular non-admin user (1)
#   professional: regular non-admin user (1)
#   user_admin: admin in charge of users (2)
#   appointment_admin: admin in charge of appointments (3)
#   super_admin: admin in charge of everything(4)

#this route is accessible only to super admins or user admins
#only super admins (4) can affect other admins
#it returns a list of users if the method is GET
#if the method is POST, it accepts a JSON object with the following contents:
#   user_id: the id of the affected user
#   action: the action that needs to be done for that user
#       block: restrict user's access to the website (access level = 0)
#       unblock: remove user restriction (access level = previous)
#       warn: add one warning (at 3 warnings, a user gets blocked)
#       unwarn: remove a warning (will not unblock the user)
@bp_admin.route('/manage-users', methods=['GET', 'POST'])
@jwt_required()
def manage_users():
    try:
        user_id = get_jwt_identity()
        logged_in_user = db.get_one_matching('users', f"user_id='{user_id}'")
        if not logged_in_user:
            return jsonify({'error': 'User not found'}), 404
        if logged_in_user.access_level not in [2, 4]:
            return jsonify({'error': 'Access to user management forbidden'}), 403
    except Exception:
        return jsonify({'error': 'Internal server error'}), 503
    if request.method == 'POST':
        try:
            data = request.get_json()
            new_user_id = data['user_id']
            action = data['action']
            values_str = ''
            user_info = db.get_one_matching('users', f"user_id='{new_user_id}'")
            if user_info.access_level > 1 and logged_in_user.access_level != 4:
                return jsonify({'error':'Modification of admin users forbidden'}), 403
            #blocking
            if action == 'block':
                values_str = 'access_level = 0'
                #unblocking
            elif action == 'unblock':
                user_lvls = {'client':1, 'professional':1}
                values_str = f'access_level = {user_lvls.get(user_info.user_type)}'
            #add a warning
            elif action == 'warn':
                values_str = 'num_of_warns = num_of_warns + 1'
                #new number of warns is now one above user_info.num_of_warns
                if user_info.num_of_warns >= 2:
                    values_str += ', access_level = 0'
            #remove a warning
            elif action == 'unwarn':
                values_str = 'num_of_warns = num_of_warns - 1'
            else:
                raise Exception
            
            db.update_record_by_id('user', values_str, new_user_id)
            return jsonify({'message': 'User updated successfully'}), 200
        except Exception as e:
            print(e)
            return jsonify({'error': 'Request formatted incorrectly'}), 400
    
    if request.method == 'GET':
        cond = "user_type in('client', 'professional')" if logged_in_user.access_level != 4 else 'access_level <= 4'
        users_list = db.get_all_matching('users', cond)
        json_users_list = []
        for user in users_list:
            json_users_list.append(vars(user))
        return jsonify(*json_users_list), 200
        
    

#this route is accessible only to superusers or appointment admins
#it contains a list of appointments with the necessary info
#and all the needed controls to add, delete, and change reports or appointments
@bp_admin.route('/manage-appointments', methods=['GET', 'POST'])
@jwt_required()
def manage_appointments():
    try:
        user_id = get_jwt_identity()
        user = db.get_one_matching('users', f"user_id='{user_id}'")
        if not user:
            return jsonify({'error': 'User not found'}), 404
        if user.access_level not in [3, 4]:
            return jsonify({'error': 'Access to appointment management forbidden'}), 403
    except Exception:
        return jsonify({'error': 'Internal server error'}), 503
    if request.method == 'POST':
        try:
            data = request.get_json()
            appointment_id = data['appointment_id']
            action = data['action']
            values_str = ''
            #blocking
            if action == 'delete':
                db.delete_record_by_id('appointment', appointment_id)
                return jsonify({'message': 'Appointment deleted successfully'}), 200
            
            # Only update if there are values to update
            if values_str:
                db.update_record_by_id('appointment', values_str, appointment_id)
                return jsonify({'message': 'Appointment updated successfully'}), 200
            else:
                return jsonify({'error': 'No update values provided'}), 400
        except Exception:
            return jsonify({'error': 'Form not filled properly'}), 400
    if request.method == 'GET':
        appointments_list = db.get_all_from('appointments')
        json_appointments_list = []

        for appointment in appointments_list: 
            # Get client info
            client = db.get_one_matching('users', f"user_id = {appointment.client_id}")
            client_data = None
            if client:
                client_data = {
                    'user_id': client.user_id,
                    'username': client.username,
                    'first_name': client.first_name,
                    'last_name': client.last_name,
                    'email': client.email,
                    'phone_number': client.phone_number
                }
            # Get professional info
            professional = db.get_one_matching('users', f"user_id = {appointment.professional_id}")
            professional_data = None
            if professional:
                professional_data = {
                    'user_id': professional.user_id,
                    'username': professional.username,
                    'first_name': professional.first_name,
                    'last_name': professional.last_name,
                    'email': professional.email,
                    'specialty': professional.specialty,
                    'hourly_rate': professional.hourly_rate
                }

            # Get service info from static services
            service_data = next((service for service in services if service['service_id'] == appointment.service_id), None)
            
            # Create appointment data with related info
            appointment_data = {
                'appointment_id': appointment.appointment_id,
                'created_at': appointment.created_at,
                'status': appointment.status,
                'cost': appointment.cost,
                'location': appointment.location,
                'start_time': appointment.start_time,
                'stop_time': appointment.stop_time,
                'service': service_data,
                'client': client_data,
                'professional': professional_data,
            }
            json_appointments_list.append(appointment_data)
        return jsonify(json_appointments_list), 200

#delete users
@bp_admin.route('/delete-user', methods=['DELETE'])
@jwt_required()
def delete_profile():
    try:
        uid = get_jwt_identity()
        user = db.get_one_matching('users', f"user_id = '{uid}'")
        if not user:
            return jsonify({'error': 'User not found'}), 404
        if user.access_level not in [2, 4]:
            return jsonify({'error': 'Access to user management forbidden'}), 403
        
        # Delete the user from the database
        data = request.get_json()
        db.delete_records_where('users', f"user_id = '{data['user_id']}'")
        
        return jsonify({'message': 'Profile deleted successfully'}), 200
    except Exception as e:
        print(f"Error in delete_profile route: {e}")
        return jsonify({'error': 'Failed to delete profile'}), 500
    

@bp_admin.route('/manage-logs', methods=['GET', 'POST'])
@jwt_required()
def manage_logs():
    try:
        user_id = get_jwt_identity()
        user = db.get_one_matching('users', f"user_id='{user_id}'")
        if not user:
            return jsonify({'error': 'User not found'}), 404
        if user.access_level not in [4]:
            return jsonify({'error': 'Access to log management forbidden'}), 403
    except Exception:
        return jsonify({'error': 'Internal server error'}), 503
    if request.method == 'GET':
        logs_list = db.get_all_from('logs')
        json_logs_list = []
        for log in logs_list:
            admin = db.get_one_matching('users', f'user_id={log.user_id}')
            admin_data = vars(admin)
            log_data = {
                'log_id': log.log_id,
                'admin': admin_data,
                'action':log.action,
                'created_at':log.created_at
            }
            json_logs_list.append(log_data)
        return jsonify(json_logs_list), 200
    if request.method == 'POST':
        try:
            data = request.get_json()
            admin_id = data['user_id']
            action = data['action']
            db.insert_obj_into_db('user_id, action', f"{admin_id}, '{action}'", 'logs')
            return jsonify({'message': 'Data logged successfully'}), 200
        except Exception as e:
            print(e)
            return jsonify({'error': 'Form not filled properly'}), 400

