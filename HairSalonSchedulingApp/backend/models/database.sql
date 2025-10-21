DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS reports CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS logs CASCADE;

CREATE TABLE IF NOT EXISTS users
(
    user_id serial,
    user_type character varying(64) NOT NULL,
    username character varying(64) NOT NULL,
    first_name character varying(64),
    last_name character varying(64),
    password text NOT NULL,
    address character varying(64),
    phone_number character varying(16),
    specialty character varying(32),
    description character varying(128),
    email character varying(64) NOT NULL,
    num_of_warns numeric,
    access_level numeric,
    hourly_rate numeric,
    profile_picture character varying(64),
    PRIMARY KEY (user_id)
);

CREATE TABLE IF NOT EXISTS appointments
(
    appointment_id serial,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    status character varying,
    cost numeric,
    location character varying,
    start_time timestamp with time zone,
    stop_time timestamp with time zone,
    client_id integer REFERENCES users(user_id) ON DELETE CASCADE,
    professional_id integer REFERENCES users(user_id) ON DELETE CASCADE,
    service_id integer,
    PRIMARY KEY (appointment_id)
);

CREATE TABLE IF NOT EXISTS reports
(
    report_id serial,
    appointment_id integer REFERENCES appointments(appointment_id) ON DELETE CASCADE,
    status character varying(64),
    date date,
    professional_feedback text,
    client_feedback text,
    client_id integer REFERENCES users(user_id) ON DELETE CASCADE,
    professional_id integer REFERENCES users(user_id) ON DELETE CASCADE,
    PRIMARY KEY (report_id)
);

CREATE TABLE IF NOT EXISTS logs
(
    log_id serial,
    user_id  integer REFERENCES users(user_id) ON DELETE CASCADE,
    action text,
    created_at timestamp with time zone DEFAULT NOW(),
    PRIMARY KEY (log_id)
);

INSERT INTO users ( user_type, username, first_name, last_name, password, address, phone_number, specialty, description, email, num_of_warns, access_level, hourly_rate, profile_picture) VALUES
  ('professional', 'stylist_amy',  'Amy', 'Johnson', 'amy123', '12 Elm St', '416-555-0101', 'Colorist', 'Specializes in vibrant colors', 'amy.johnson@hairsalon.com', 0, 1, 45.00, 'amy.jpg'),
  ('professional', 'stylist_ben',  'Ben', 'Thompson', 'bensecure', '34 Maple Ave', '416-555-0102', 'Barber',   'Expert in fades and trims', 'ben.thompson@hairsalon.com', 1, 1, 35.00, 'ben.png'),
  ('professional','stylist_claire','Claire','Smith','clairepw','23 Birch St','416-555-0301','Stylist','Expert in balayage and highlights','claire.smith@hairsalon.com',0,1,50.00,'claire.jpg'),
  ('professional','barber_daniel','Daniel','King','danielpw','45 Elm St','416-555-0302','Barber','Specializes in beards and cuts','daniel.king@hairsalon.com',0,1,40.00,'daniel.jpg'),
  ('professional','colorist_elena','Elena','Garcia','elenapw','67 Spruce Rd','416-555-0303','Colorist','Creative color transformations','elena.garcia@hairsalon.com',0,1,55.00,'elena.jpg'),
  ('client', 'client_sara', 'Sara', 'Lee', 'sara!pw', '56 Pine Rd', '416-555-0201', NULL, NULL, 'sara.lee@gmail.com', 0, 1, NULL, 'client_sara.jpg'),
  ('client', 'client_mike', 'Mike', 'Brown', 'mikepw', '78 Oak Blvd', '416-555-0202', NULL, NULL, 'mike.brown@gmail.com', 0, 1, NULL, 'client_mike.png'),
  ('client', 'client_nina', 'Nina', 'Patel', 'ninapass', '90 Cedar Ln', '416-555-0203', NULL, NULL, 'nina.patel@gmail.com', 0, 1, NULL, 'client_nina.jpg'),
  ('client','client_zoe','Zoe','Turner','zoepw','123 Cherry Blvd','416-555-0401',NULL,NULL,'zoe.turner@gmail.com',0,1,NULL,'client_zoe.jpg'),
  ('client','client_chris','Chris','Martin','chrispw','456 Walnut St','416-555-0402',NULL,NULL,'chris.martin@gmail.com',0,1,NULL,'client_chris.png'),
  ('client','client_karen','Karen','Wilson','karenpw','789 Ash Rd','416-555-0403',NULL,NULL,'karen.wilson@gmail.com',0,1,NULL,'client_karen.jpg'),
  ('client','client_luke','Luke','Evans','lukepw','135 Palm Ave','416-555-0404',NULL,NULL,'luke.evans@gmail.com',0,1,NULL,'client_luke.jpg'),
  ('client','client_emma','Emma','Davis','emmapw','246 Pinecone St','416-555-0405',NULL,NULL,'emma.davis@gmail.com',0,1,NULL,'client_emma.png');

INSERT INTO appointments (created_at, status, cost, location, start_time, stop_time, client_id, professional_id, service_id) VALUES
  ('2025-04-06 09:00','Scheduled', 25.00, 'Lachine', '2025-04-10 10:00', '2025-04-10 10:30', 3, 1, 1),
  ('2025-04-06 10:15','Completed', 80.00, 'Lachine', '2025-04-08 14:00', '2025-04-08 16:30', 4, 1, 2),
  ('2025-04-07 11:00','Completed', 30.00, 'Lachine', '2025-04-09 12:00', '2025-04-09 12:45', 5, 2, 3),
  ('2025-04-07 12:30','Cancelled', 0.00, 'Lachine', '2025-04-11 11:00', '2025-04-11 11:30', 3, 2, 4),
  ('2025-04-08 14:45','Completed', 15.00, 'Lachine', '2025-04-12 15:00', '2025-04-12 15:15', 4, 2, 5);
