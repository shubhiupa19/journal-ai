import sqlite3
from datetime import datetime

DATABASE_PATH = "feedback.db"


def init_db():
    # create a connection to the db
    conn = sqlite3.connect(DATABASE_PATH)

    # create cursor
    cursor = conn.cursor()

    # create feedback table if it doesn't exist
    cursor.execute(
        """ CREATE TABLE IF NOT EXISTS feedback (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                   text TEXT NOT NULL,
                   predicted_distortion TEXT, 
                   user_correction TEXT, 
                   is_accepted BOOLEAN,
                   confidence REAL,
                   timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                   used_in_training BOOLEAN DEFAULT FALSE)
                   """
    )
    # create model_versions table if it doesn't exist
    cursor.execute(
        """ CREATE TABLE IF NOT EXISTS model_versions (
                   id INTEGER PRIMARY KEY AUTOINCREMENT,
                   version_number INTEGER,
                   training_samples INTEGER,
                   accuracy REAL,
                   notes TEXT
                   )"""
    )

    # save the changes via
    conn.commit()

    # close the connection
    conn.close()


def save_feedback(text, predicted_distortion, user_correction, is_accepted, confidence):
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()

    # add data point to feedback table
    cursor.execute(
        """ INSERT INTO feedback (text, predicted_distortion, user_correction, is_accepted, confidence)
                   VALUES (?,?,?,?,?)""",
        (text, predicted_distortion, user_correction, is_accepted, confidence),
    )

    # save changes
    conn.commit()

    # get the most recent row of feedback id
    feedback_id = cursor.lastrowid

    conn.close()

    return feedback_id


def retrieve_feedback():
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()

    cursor.execute(""" SELECT * FROM feedback """)

    table = cursor.fetchall()

    conn.close()

    return table


def get_training_feedback():
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    cursor.execute(
        """ SELECT text, user_correction FROM feedback WHERE is_accepted IS FALSE AND used_in_training IS FALSE"""
    )

    table = cursor.fetchall()

    conn.close()

    return table


def mark_used_feedback():
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    cursor.execute(
        """ UPDATE feedback SET used_in_training=TRUE WHERE is_accepted=FALSE and used_in_training=FALSE"""
    )
    conn.commit()
    conn.close()


def save_model_version(version_number, training_samples, accuracy, notes):
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()

    # add new version to model_versions table
    cursor.execute(
        """ INSERT INTO model_versions (version_number, training_samples, accuracy, notes)
                   VALUES (?,?,?,?)""",
        (version_number, training_samples, accuracy, notes),
    )

    # save changes
    conn.commit()

    # get the most recent row of model_versions
    model_version_id = cursor.lastrowid

    conn.close()

    return model_version_id


def get_latest_version():
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    cursor.execute(""" SELECT MAX(version_number) FROM model_versions """)
    version_number = cursor.fetchone()
    conn.close()
    if version_number[0] is None:
        return 1
    else:
        return version_number[0]

if __name__ == "__main__":
    print("Initializing database...")
    init_db()
    print("Successfully initialized db")
