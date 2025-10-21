class User:
    def __init__(self, **kwargs):
        self.user_id = kwargs.get('user_id')
        self.user_type = kwargs.get('user_type')
        self.username = kwargs.get('username')
        self.first_name = kwargs.get('first_name')
        self.last_name = kwargs.get('last_name')
        self.password = kwargs.get('password')
        self.address = kwargs.get('address')
        self.phone_number = kwargs.get('phone_number')
        self.specialty = kwargs.get('specialty')
        self.description = kwargs.get('description')
        self.email = kwargs.get('email')
        self.num_of_warns = kwargs.get('num_of_warns')
        self.access_level = kwargs.get('access_level')
        self.hourly_rate = kwargs.get('hourly_rate')
        self.profile_picture = kwargs.get('profile_picture')

    # created_at timestamp without time zone,
    # status character varying,
    # cost numeric,
    # location character varying,
    # start_time timestamp without time zone,
    # stop_time timestamp without time zone,
    # client_id integer REFERENCES users(user_id),
    # professional_id integer REFERENCES users(user_id),
    # service_id integer REFERENCES services(service_id),
    # report_id integer REFERENCES reports(report_id),
    # PRIMARY KEY (appointment_id)
class Appointment:
    def __init__(self, **kwargs):
        self.appointment_id = kwargs.get('appointment_id')
        self.service = kwargs.get('service')
        self.created_at = kwargs.get('created_at')
        self.status = kwargs.get('status')
        self.cost = kwargs.get('cost')
        self.location = kwargs.get('location')
        self.start_time = kwargs.get('start_time')
        self.stop_time = kwargs.get('stop_time')
        self.client_id = kwargs.get('client_id')
        self.professional_id = kwargs.get('professional_id')
        self.service_id = kwargs.get('service_id')
        self.report_id = kwargs.get('report_id')
    
# report_id serial,
#     status character varying(64),
#     date date,
#     professional_feedback character varying(64),
#     client_feedback character varying(64),
#     PRIMARY KEY (report_id)
class Report:
    def __init__(self, **kwargs):
        self.report_id = kwargs.get('report_id')
        self.appointment_id = kwargs.get('appointment_id')
        self.status = kwargs.get('status')
        self.date = kwargs.get('date')
        self.professional_feedback = kwargs.get('professional_feedback')
        self.client_feedback = kwargs.get('client_feedback')
        self.client_id = kwargs.get('client_id')
        self.professional_id = kwargs.get('professional_id')

class Log:
    def __init__(self, **kwargs):
        self.log_id = kwargs.get('log_id')
        self.user_id = kwargs.get('user_id')
        self.action = kwargs.get('action')
        self.created_at = kwargs.get('created_at')