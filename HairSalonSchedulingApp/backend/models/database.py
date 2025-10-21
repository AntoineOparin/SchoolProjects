import os
import psycopg2
import psycopg2.extras
from config import Config
from models.data_classes import User, Appointment, Report, Log

class Database:
    def __init__(self, autocommit=True):
        self.__connection = self.__connect()
        self.__connection.autocommit = autocommit

    def __connect(self):
        try:
            return psycopg2.connect(
                database=Config.DATABASE_NAME,
                user=Config.DATABASE_USER,
                password=Config.DATABASE_PASSWORD,
                host=Config.DATABASE_HOST,
                port=Config.DATABASE_PORT
            )
        except psycopg2.Error as e:
            print(f"Error connecting to database: {e}")
            return None
     # -----------------------------------
    def __reconnect(self):
        try:
            self.close()
        except psycopg2.Error as f:
            pass
        self.__connection = self.__connect()
     # ----------------------------------
    def db_conn (self): 
        return self.__connection
     # ----------------------------------
    def close(self):
        '''Closes the connection'''
        if self.__connection is not None:
            self.__connection.close()
            self.__connection = None
     # ----------------------------------
    def get_cursor(self):
            for i in range(3):
                try:
                    return self.__connection.cursor(cursor_factory=psycopg2.extras.DictCursor)
                except Exception as e:
                    # Might need to reconnect
                    self.__reconnect()
     # -----------------------------------
    def __run_file(self, file_path):
        statement_parts = []
        with self.__connection.cursor() as cursor:
            # pdb.set_trace()
            with open(file_path, 'r') as f:
                for line in f:
                    if line[:2]=='--': continue
                    statement_parts.append(line)
                    if line.strip('\n').strip('\n\r').strip().endswith(';'):
                        statement = "".join( statement_parts).strip().rstrip(';')
                        if statement:
                            try:
                                # pdb.set_trace()
                                cursor.execute(statement)
                            except Exception as e:
                                print(e)
                        statement_parts = []
     # ----------------------------------
    def run_sql_script(self, sql_filename):
        if os.path.exists(sql_filename):
            self.__connect()
            self.__run_file(sql_filename)
            self.close()
        else:
            print('Invalid Path')
    # ===========================================================================
    # ----------------DML  (CRUD) queries (retrieve, insert, update, delete) ----
    # ---------------------------------------------------------------------------

    # CREATE
    def insert_obj_into_db(self, fields, values, table):
        # Insert information into the database based on fields, values and table
        qry_str = f'INSERT INTO {table} ({fields}) VALUES ({values})'
        cursor = self.get_cursor()
        try:
            cursor.execute(qry_str)
            self.__connection.commit()
        except Exception as e:
            print(e)
            self.__connection.rollback()
        finally:
            cursor.close()

    # READ
    #   get all records and all fields from a specific table
    def get_all_from(self, table):
        cursor = self.get_cursor()
        try:
            cursor.execute(f'SELECT * FROM {table}')
            all_results = cursor.fetchall()
            list_results = []
            for result in all_results:
                result_to_type = None
                if table == 'appointments':
                    result_to_type = Appointment(**result)
                if table == 'users':
                    result_to_type = User(**result)
                if table == 'reports':
                    result_to_type = Report(**result)
                if table == 'logs':
                    result_to_type = Log(**result)
                list_results.append(result_to_type)
            return list_results
        except Exception as e:
            print(e)
            self.__connection.rollback()
        finally:
            cursor.close()
    
    #   get all records matching the condition from a certain table
    def get_all_matching(self, table, condition):
        cursor = self.get_cursor()
        try:
            cursor.execute(f'SELECT * FROM {table} WHERE {condition}')
            all_results = cursor.fetchall()
            list_results = []
            for result in all_results:
                result_to_type = None
                if table == 'appointments':
                    result_to_type = Appointment(**result)
                if table == 'users':
                    result_to_type = User(**result)
                if table == 'reports':
                    result_to_type = Report(**result)
                if table == 'logs':
                    result_to_type = Log(**result)
                list_results.append(result_to_type)
            return list_results
        except Exception as e:
            print(e)
            self.__connection.rollback()
        finally:
            cursor.close()

    # get one record matching the condition from a certain table
    def get_one_matching(self, table, condition):
        cursor = self.get_cursor()
        try:
            cursor.execute(f'SELECT * FROM {table} WHERE {condition}')
            result_cursor = cursor.fetchone()
            if not result_cursor:
                return None
                
            result = None
            if table == 'appointments':
                result = Appointment(**result_cursor)
            elif table == 'users':
                result = User(**dict(result_cursor))
            elif table == 'reports':
                result = Report(**result_cursor)
            elif table == 'logs':
                result = Log(**result_cursor)
            return result
        except Exception as e:
            print(f"Error in get_one_matching: {e}")
            self.__connection.rollback()
            return None
        finally:
            cursor.close()

    def get_one_field_from(self, table, field, condition):
        cursor = self.get_cursor()
        try:
            cursor.execute(f'SELECT {field} FROM {table} WHERE {condition}')
            result = cursor.fetchone()
            if not result:
                return None
            return result[0]  # Return just the field value
        except Exception as e:
            print(e)
            self.__connection.rollback()
            return None
        finally:
            cursor.close()
    
    #   get first record matching the condition from a certain table (results ordered by order)
    def get_first_matching(self, table, condition, order):
        cursor = self.get_cursor()
        try:
            cursor.execute(f'SELECT * FROM {table} WHERE {condition} ORDER BY {order}')
            result_cursor = cursor.fetchone()
            result = None
            if table == 'appointments':
                result = Appointment(**result_cursor)
            if table == 'users':
                result = User(**result_cursor)
            if table == 'reports':
                result = Report(**result_cursor)
            if table == 'logs':
                result = Log(**result_cursor)
            return result
        except Exception as e:
            print(e)
            self.__connection.rollback()
        finally:
            cursor.close()

    # UPDATE
    #   update a single object based on its id with specified fields and values
    #   in this method, fields must be the complete list of values to change
    #   ex: fields="fname='John', age=30, lname='Smith'"
    def update_record_by_id(self, table, fields, obj_id):
        cursor = self.get_cursor()
        qry_str = f'UPDATE {table}s SET {fields} WHERE {table}_id={obj_id}'
        try:
            cursor.execute(qry_str)
            self.__connection.commit()  # Explicitly commit the transaction
            print(qry_str)
        except Exception as e:
            print(e)
            self.__connection.rollback()
            raise e  # Re-raise the exception to handle it in the caller
        finally:
            cursor.close()

    #   mass update records based on a condition    
    #   in this method, fields must be the complete list of values to change
    #   ex: fields="fname='John', age=30, lname='Smith'"
    def update_records_where(self, table, fields, condition):
        cursor = self.get_cursor()
        qry_str = f'UPDATE {table} SET {fields} WHERE {condition}'
        try:
            cursor.execute(qry_str)
            self.__connection.commit()  # Explicitly commit the transaction
        except Exception as e:
            print(e)
            self.__connection.rollback()
            raise e  # Re-raise the exception to handle it in the caller
        finally:
            cursor.close()

    # DELETE
    #   delete a single record based on its id
    def delete_record_by_id(self, table, obj_id):
        cursor = self.get_cursor()
        qry_str = f'DELETE FROM {table}s WHERE {table}_id={obj_id}'
        try:
            cursor.execute(qry_str)
        except Exception as e:
            print(e)
            self.__connection.rollback()
        finally:
            cursor.close()

    #   mass delete records based on a condition
    def delete_records_where(self, table, condition):
        cursor = self.get_cursor()
        qry_str = f'DELETE FROM {table} WHERE {condition}'
        try:
            cursor.execute(qry_str)
        except Exception as e:
            print(e)
            self.__connection.rollback()
        finally:
            cursor.close()


#import pdb
# pdb.set_trace()

db = Database()
if __name__ == '__main__':
    # pdb.set_trace()
    db.run_sql_script('./database.sql')