import sqlite3
import sys

def validate_sql(db_path, sql):
    print(db_path, sql)
    with sqlite3.connect(db_path) as conn:
        cursor = conn.cursor()
        try:
            cursor.execute(sql)
        except sqlite3.Error as e:
            return False
        return True
    conn.close()
