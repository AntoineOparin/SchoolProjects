import os
from flask import Blueprint, request, jsonify, current_app, send_from_directory
from flask_jwt_extended import (
    create_access_token, 
    create_refresh_token,
    jwt_required,
    get_jwt_identity,
    get_jwt,
    verify_jwt_in_request
)
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from datetime import timedelta
from . import bp_auth
from models.database import db
from models.data_classes import User
import platform
import magic

# Initialize magic library based on platform
if platform.system() == 'Windows':
    try:
        import magic
    except ImportError:
        print("Failed to import magic-bin on Windows")
        raise
else:
    try:
        import magic
    except ImportError:
        print("Failed to import python-magic on non-Windows platform")
        raise

# Rest of your imports...

def get_mime_type(file_content):
    """Helper function to get MIME type with proper error handling"""
    try:
        if platform.system() == 'Windows':
            # Windows-specific handling
            ms = magic.Magic(mime=True)
            mime_type = ms.from_buffer(file_content)
        else:
            # Unix-like systems
            mime_type = magic.from_buffer(file_content, mime=True)
        return mime_type
    except Exception as e:
        print(f"Error detecting MIME type: {e}")
        print(f"Platform: {platform.system()}")
        print(f"Magic library version: {magic.__version__ if hasattr(magic, '__version__') else 'unknown'}")
        raise

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@bp_auth.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    # Validate required fields
    if not all(k in data for k in ['user_type','username', 'email', 'password']):
        return jsonify({'error': 'Missing required fields'}), 400
    
    try:
        # Check if user already exists
        if db.get_one_matching("users", f"email = '{data['email']}'"):
            return jsonify({'error': 'Email already registered'}), 409
        
        if db.get_one_matching("users", f"username = '{data['username']}'"):
            return jsonify({'error': 'Username already taken'}), 409
        
        # Hash password
        password_hash = generate_password_hash(data['password'])
        
        # Set access level based on user type
        access_level = 1  # Default for client/professional
        if data['user_type'] == 'user_admin':
            access_level = 2
        elif data['user_type'] == 'appointment_admin':
            access_level = 3
        elif data['user_type'] == 'super_admin':
            access_level = 4
        
        # Create new user
        new_user = User(
            user_type=data['user_type'],
            username=data['username'],
            first_name=data.get('first_name', ''),
            last_name=data.get('last_name', ''),
            password=password_hash,
            address=data.get('address', ''),
            phone_number=data.get('phone_number', ''),
            specialty=data.get('specialty', ''),
            description=data.get('description', ''),
            email=data['email'],
            num_of_warns=0,
            access_level=access_level,
            hourly_rate=data.get('hourly_rate', 0),
            profile_picture=data.get('profile_picture', '')
        )
        
        # Add new user to the database
        values_str = f"'{new_user.user_type}', '{new_user.username}', '{new_user.first_name}', '{new_user.last_name}', '{new_user.password}', '{new_user.address}', '{new_user.phone_number}', '{new_user.specialty}', '{new_user.description}', '{new_user.email}', {new_user.num_of_warns}, {new_user.access_level}, {new_user.hourly_rate}, 'default_pfp.jpg'"
        db.insert_obj_into_db(
            'user_type, username, first_name, last_name, password, address, phone_number, specialty, description, email, num_of_warns, access_level, hourly_rate, profile_picture',
            values_str,
            'users'
        )

        # Get the newly created user's ID
        user_id = db.get_one_field_from("users", "user_id", f"username = '{data['username']}'")
        if not user_id:
            return jsonify({'error': 'User ID not found'}), 500
            
        # Create access token and refresh token - convert user_id to string
        access_token = create_access_token(
            identity=str(user_id),  # Convert to string
            expires_delta=timedelta(days=1)
        )
        refresh_token = create_refresh_token(
            identity=str(user_id),  # Convert to string
            expires_delta=timedelta(days=7)
        )
            
        # Return tokens and user data
        return jsonify({
            'message': 'Registration successful',
            'access_token': access_token,
            'refresh_token': refresh_token,
            'user': {
                'user_id': user_id,
                'username': new_user.username,
                'email': new_user.email,
                'user_type': new_user.user_type,
                'access_level': new_user.access_level
            }
        }), 201
        
    except Exception as e:
        if hasattr(db, 'db_conn') and db.db_conn():
            db.db_conn().rollback()
        print(f"Error: {e}")
        return jsonify({'error': str(e)}), 500

@bp_auth.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    
    if not all(k in data for k in ['username', 'password']):
        return jsonify({'error': 'Missing username or password'}), 400
    
    try:
        user = db.get_one_matching("users", f"username = '{(data['username'])}'")
        
        if not user or not check_password_hash(user.password, data['password']):
            return jsonify({'error': 'Invalid username or password'}), 401
        
        if user.access_level == 0:
            return jsonify({'error': 'You have been blocked. Please contact an admin to know why.'}), 403
        # Create access token and refresh token
        access_token = create_access_token(
            identity=str(user.user_id),
            additional_claims={'access_level':user.access_level},
            expires_delta=timedelta(days=1)
        )
        refresh_token = create_refresh_token(
            identity=str(user.user_id),
            expires_delta=timedelta(days=7)
        )
        
        return jsonify({
            'access_token': access_token,
            'refresh_token': refresh_token,
            'user': {
                'user_id': user.user_id,
                'username': user.username,
                'email': user.email,
                'user_type': user.user_type,
                'access_level': user.access_level
            }
        }), 200
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'error': str(e)}), 500

@bp_auth.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    try:
        current_user_id = get_jwt_identity()
        new_access_token = create_access_token(
            identity=current_user_id,
            expires_delta=timedelta(days=1)
        )
        return jsonify({
            'access_token': new_access_token
        }), 200
    except Exception as e:
        print(f"Error refreshing token: {e}")
        return jsonify({'error': 'Failed to refresh token'}), 500

#this route allows logged-in users to see their profiles
@bp_auth.route('/profile', methods=['GET'])
@jwt_required()
def profile():
    try:
        uid = get_jwt_identity()
        # Try both with and without quotes to handle both string and integer IDs
        user = db.get_one_matching('users', f"user_id = {uid} OR user_id = '{uid}'")
        if not user:
            return jsonify({'error': 'User not found'}), 404
            
        user_data = {
            'user_id': user.user_id,
            'user_type': user.user_type,
            'username': user.username,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'email': user.email,
            'address': user.address,
            'phone_number': user.phone_number,
            'specialty': user.specialty if user.user_type == 'professional' else None,
            'description': user.description if user.user_type == 'professional' else None,
            'hourly_rate': user.hourly_rate if user.user_type == 'professional' else None,
            'profile_picture': user.profile_picture,
            'num_of_warns': user.num_of_warns
        }
        return jsonify({'user': user_data}), 200
    except Exception as e:
        print(f"Error in profile route: {e}")
        return jsonify({'error': 'Failed to fetch profile data'}), 500

@bp_auth.route('/profile', methods=['DELETE'])
@jwt_required()
def delete_profile():
    try:
        uid = get_jwt_identity()
        user = db.get_one_matching('users', f"user_id = '{uid}'")
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Delete the user from the database
        db.delete_records_where('users', f"user_id = '{uid}'")
        
        return jsonify({'message': 'Profile deleted successfully'}), 200
    except Exception as e:
        print(f"Error in delete_profile route: {e}")
        return jsonify({'error': 'Failed to delete profile'}), 500

#this route allows logged-in users to log out
@bp_auth.route('/logout', methods=['GET'])
@jwt_required()
def logout():
    return jsonify({'msg': 'Successfully logged out'}), 200

@bp_auth.route('/upload-profile-picture', methods=['POST'])
@jwt_required()
def upload_profile_picture():
    try:
        file = request.files['profile_picture']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
            
        if not allowed_file(file.filename):
            return jsonify({'error': 'Invalid file type. Allowed types: png, jpg, jpeg, gif'}), 400

        # Read the file content
        file_content = file.read()
        # Reset file pointer to beginning after reading
        file.seek(0)

        try:
            # Use our platform-independent MIME type detection
            mime = get_mime_type(file_content)
            print(f"Detected MIME type: {mime}")
        except Exception as magic_error:
            print(f"Error during MIME type detection: {magic_error}")
            return jsonify({'error': f'Failed to detect file type: {str(magic_error)}'}), 500

        if mime not in ['image/png', 'image/jpeg', 'image/gif']:
            return jsonify({'error': f'Invalid file type: {mime}. Allowed types: png, jpg, jpeg, gif'}), 400

        # Get current user
        user_id = get_jwt_identity()
        user = db.get_one_matching('users', f"user_id = '{user_id}'")
        if not user:
            return jsonify({'error': 'User not found'}), 404

        # Create upload directory if it doesn't exist
        upload_dir = os.path.join(current_app.root_path, 'static', 'profile_pictures')
        os.makedirs(upload_dir, exist_ok=True)

        # Delete old profile picture if it exists and is not the default
        if user.profile_picture and user.profile_picture != 'default_pfp.jpg':
            old_file_path = os.path.join(upload_dir, user.profile_picture)
            if os.path.exists(old_file_path):
                try:
                    os.remove(old_file_path)
                except OSError as e:
                    print(f"Error deleting old profile picture: {e}")
                    # Continue with upload even if delete fails

        # Get file extension from original filename
        file_ext = os.path.splitext(file.filename)[1].lower()
        # Generate unique filename using username
        filename = secure_filename(f"{user.username}_pfp{file_ext}")
        file_path = os.path.join(upload_dir, filename)

        # Save the file
        file.save(file_path)

        # Update user's profile_picture in database
        db.update_records_where('users', f"profile_picture = '{filename}'", f"user_id = '{user_id}'")

        return jsonify({
            'message': 'Profile picture uploaded successfully',
            'profile_picture': filename
        }), 200

    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        print(f"Error uploading profile picture: {e}")
        print(f"Stack trace: {error_details}")
        return jsonify({'error': f'Failed to upload profile picture: {str(e)} traceback: {error_details}'}), 500

@bp_auth.route('/static/profile_pictures/<path:filename>')
def serve_profile_picture(filename):
    upload_dir = os.path.join(current_app.root_path, 'static', 'profile_pictures')
    return send_from_directory(upload_dir, filename)

@bp_auth.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    try:
        uid = get_jwt_identity()
        user = db.get_one_matching('users', f"user_id = '{uid}'")
        if not user:
            return jsonify({'error': 'User not found'}), 404

        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400

        # Check password confirmation if password is being updated
        if 'password' in data and data['password']:
            if not data.get('confirm_password'):
                return jsonify({'error': 'Password confirmation is required'}), 400
            if data['password'] != data['confirm_password']:
                return jsonify({'error': 'Passwords do not match'}), 400
            # Generate password hash for the new password
            password_hash = generate_password_hash(data['password'])

        # Fields that can be updated
        allowed_fields = ['first_name', 'last_name', 'email', 'address', 'phone_number']
        if user.user_type == 'professional':
            allowed_fields.extend(['specialty', 'description', 'hourly_rate'])

        # Build update fields string with proper SQL escaping
        update_fields = []
        for field in allowed_fields:
            if field in data and data[field] is not None:
                # Handle hourly_rate separately
                if field == 'hourly_rate':
                    try:
                        # Convert to float and validate
                        rate = float(data[field])
                        if rate < 0:
                            return jsonify({'error': 'Hourly rate cannot be negative'}), 422
                        update_fields.append(f"{field} = {rate}")
                    except (ValueError, TypeError):
                        return jsonify({'error': 'Invalid hourly rate format'}), 422
                else:
                    # Escape string values
                    escaped_value = str(data[field]).replace("'", "''")
                    update_fields.append(f"{field} = '{escaped_value}'")

        # Add password update if provided
        if 'password' in data and data['password']:
            update_fields.append(f"password = '{password_hash}'")

        if not update_fields:
            return jsonify({'error': 'No valid fields to update'}), 400

        # Update user in database
        try:
            update_str = ', '.join(update_fields)
            db.update_records_where('users', update_str, f"user_id = '{uid}'")
            print(f"Update SQL: UPDATE users SET {update_str} WHERE user_id = '{uid}'")
        except Exception as e:
            print(f"Database error: {e}")
            return jsonify({'error': 'Database update failed'}), 422

        # Get updated user data
        updated_user = db.get_one_matching('users', f"user_id = '{uid}'")
        if not updated_user:
            return jsonify({'error': 'Failed to retrieve updated user data'}), 500

        user_data = {
            'user_id': updated_user.user_id,
            'user_type': updated_user.user_type,
            'username': updated_user.username,
            'first_name': updated_user.first_name,
            'last_name': updated_user.last_name,
            'email': updated_user.email,
            'address': updated_user.address,
            'phone_number': updated_user.phone_number,
            'specialty': updated_user.specialty if updated_user.user_type == 'professional' else None,
            'description': updated_user.description if updated_user.user_type == 'professional' else None,
            'hourly_rate': float(updated_user.hourly_rate) if updated_user.hourly_rate is not None else None,
            'profile_picture': updated_user.profile_picture,
            'num_of_warns': updated_user.num_of_warns
        }

        return jsonify({'message': 'Profile updated successfully', 'user': user_data}), 200

    except Exception as e:
        print(f"Error updating profile: {e}")
        return jsonify({'error': 'Failed to update profile'}), 500