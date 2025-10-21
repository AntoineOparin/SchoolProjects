from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, verify_jwt_in_request
from . import bp_appointment
from models.database import db
from models.data_classes import Appointment
from models.static.services import services
from datetime import datetime

def update_past_appointments():
    """Helper function to update status of past appointments to 'Completed'"""
    current_time = datetime.now().astimezone()
    update_query = "UPDATE appointments SET status = 'Completed' WHERE stop_time < %s AND status = 'Scheduled'"
    cursor = db.get_cursor()
    try:
        cursor.execute(update_query, (current_time,))
        db.db_conn().commit()
    except Exception as e:
        print(f"Error updating past appointments: {e}")
        db.db_conn().rollback()
    finally:
        cursor.close()

#this route is accessible to any visitors of the site
@bp_appointment.route('/', methods=['GET'])
def get_appointments():
    # Update status of past appointments
    update_past_appointments()
    
    # Now get all appointments
    appointments = db.get_all_from('appointments')

    if not appointments:
        return jsonify({"error": "No appointments found"}), 404
    
    appointments_list = []

    for appointment in appointments:
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

        appointments_list.append(appointment_data)
    
    return jsonify(*appointments_list), 200

#this route is only accessible to members
#displays more info about individual appointments
#allows to modify an apointment
@bp_appointment.route('/<int:appointment_id>', methods=['GET'])
@jwt_required()
def get_appointment(appointment_id):
    # Update status of past appointments
    update_past_appointments()
    
    appointment = db.get_one_matching('appointments', f'appointment_id = {appointment_id}')
    if not appointment:
        return jsonify({"error": "Appointment not found"}), 404

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
            'phone_number': client.phone_number,
            'address': client.address
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
            'hourly_rate': professional.hourly_rate,
            'description': professional.description,
            'phone_number': professional.phone_number
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

    return jsonify(appointment_data), 200

#this route is only accessible to members
#allows to add an appointment
@bp_appointment.route('/create', methods=['POST'])
@jwt_required()
def create_appointment():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400

        # Validate required fields
        required_fields = ['client_id', 'professional_id', 'service_id', 'start_time', 'stop_time', 'location', 'status', 'cost']
        missing_fields = [field for field in required_fields if field not in data]
        if missing_fields:
            return jsonify({"error": f"Missing required fields: {', '.join(missing_fields)}"}), 400

        # Since frontend is now sending local time, we need to explicitly set timezone to Eastern Time
        for key in ['start_time', 'stop_time']:
            # Append Eastern Time zone if not present
            if not any(x in data[key] for x in ['+', '-', 'Z']):
                data[key] = f"{data[key]}-04:00"
        
        # Create string of fields and values for SQL insert
        fields = ', '.join(data.keys())
        values = []
        for key, value in data.items():
            if key in ['start_time', 'stop_time']:
                values.append(f"'{value}'::timestamp with time zone")
            elif value is None:
                values.append('NULL')
            elif isinstance(value, (int, float)):
                values.append(str(value))
            else:
                values.append(f"'{str(value)}'")
        
        values_str = ', '.join(values)
        
        # Insert the appointment
        db.insert_obj_into_db(fields, values_str, 'appointments')
        
        # Verify the appointment was created by getting the latest appointment for this client
        latest_appointment = db.get_first_matching(
            'appointments', 
            f"client_id = {data['client_id']}", 
            'created_at DESC'
        )
        
        if not latest_appointment:
            return jsonify({"error": "Failed to create appointment"}), 500
        
        return jsonify({"message": "Appointment created", "appointment": latest_appointment.__dict__}), 201
        
    except Exception as e:
        print(f"Error creating appointment: {str(e)}")  # Error log
        return jsonify({"error": f"Failed to create appointment: {str(e)}"}), 500

# Update an appointment
@bp_appointment.route('/<int:appointment_id>', methods=['PUT'])
@jwt_required()
def update_appointment(appointment_id):
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400
    
    appointment = db.get_one_matching('appointments', f'appointment_id = {appointment_id}')
    if not appointment:
        return jsonify({"error": "Appointment not found"}), 404
    
    try:
        # If only status is being updated, handle it directly
        if len(data.keys()) == 1 and 'status' in data:
            db.update_records_where('appointments', f"status = '{data['status']}'", f"appointment_id = {appointment_id}")
            return jsonify({"message": "Appointment status updated"}), 200
        
        # Otherwise handle full appointment update
        values = []
        for key, value in data.items():
            if value is None:
                values.append(f"{key}=NULL")
            elif isinstance(value, (int, float)):
                values.append(f"{key}={value}")
            else:
                values.append(f"{key}='{value}'")
        
        values_str = ', '.join(values)
        db.update_records_where('appointments', values_str, f"appointment_id = {appointment_id}")
        return jsonify({"message": "Appointment updated"}), 200    
    
    except Exception as e:
        print(f"Error updating appointment: {e}")
        return jsonify({"error": f"Failed to update appointment: {str(e)}"}), 500

@bp_appointment.route('/user/<int:user_id>', methods=['GET'])
def get_user_appointments(user_id):
    """Get all appointments for a specific user (either as client or professional)"""
    # Update status of past appointments
    update_past_appointments()
    
    appointments = db.get_all_matching('appointments', f'client_id = {user_id} OR professional_id = {user_id}')
    
    if not appointments:
        return jsonify({"error": "No appointments found"}), 200
    
    appointments_list = []
    
    for appointment in appointments:
        # Get client info
        client = db.get_one_matching('users', f"user_id = {appointment.client_id}")
        client_data = None
        if client:
            client_data = {
                'user_id': client.user_id,
                'username': client.username,
                'first_name': client.first_name,
                'last_name': client.last_name,
                'email': client.email
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
        from models.static.services import services
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
        
        appointments_list.append(appointment_data)
    
    return jsonify(appointments_list), 200

@bp_appointment.route('/available-professionals', methods=['GET'])
def get_available_professionals():
    """Get available professionals for a specific time slot"""
    start_time = request.args.get('start_time')
    service_id = request.args.get('service_id')
    location = request.args.get('location')

    if not all([start_time, service_id, location]):
        return jsonify({"error": "Missing required parameters"}), 400

    try:
        # Convert string to datetime
        start_time = datetime.fromisoformat(start_time.replace('Z', '+00:00'))
        
        # Get service duration
        service = next((s for s in services if s['service_id'] == int(service_id)), None)
        if not service:
            return jsonify({"error": "Service not found"}), 404
            
        # Calculate end time based on service duration
        duration_minutes = service['duration']
        stop_time = start_time.timestamp() + (duration_minutes * 60)
        
        # Get all professionals
        professionals = db.get_all_matching('users', "user_type = 'professional'")
        if not professionals:
            return jsonify({"error": "No professionals found"}), 404
            
        available_professionals = []
        
        for professional in professionals:
            # Get professional's appointments for that day
            appointments = db.get_all_matching('appointments', 
                f"professional_id = {professional.user_id} AND status != 'Cancelled' AND DATE(start_time) = DATE('{start_time}')")
            
            is_available = True
            for appt in appointments:
                # Check if the new appointment time overlaps with any existing appointment
                appt_start = datetime.fromisoformat(str(appt.start_time)).timestamp()
                appt_stop = datetime.fromisoformat(str(appt.stop_time)).timestamp()
                
                if (start_time.timestamp() < appt_stop and stop_time > appt_start):
                    is_available = False
                    break
            
            if is_available:
                available_professionals.append({
                    'user_id': professional.user_id,
                    'username': professional.username,
                    'first_name': professional.first_name,
                    'last_name': professional.last_name,
                    'specialty': professional.specialty,
                    'hourly_rate': professional.hourly_rate,
                    'email': professional.email
                })
        
        return jsonify(available_professionals), 200
        
    except ValueError as e:
        return jsonify({"error": f"Invalid date format: {str(e)}"}), 400
    except Exception as e:
        return jsonify({"error": f"Server error: {str(e)}"}), 500