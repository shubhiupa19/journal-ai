import pytest
import sqlite3
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from database import init_db, save_feedback, get_training_feedback, mark_used_feedback

@pytest.fixture
def db_path(tmp_path):
    path = str(tmp_path / "test.db")
    init_db(path)
    return path

def test_init_db_creates_tables(db_path):
    init_db(db_path)
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")

    tables = [row[0] for row in cursor.fetchall()]                                                                                  
    conn.close()

    assert "feedback" in tables                                                                                                     
    assert "model_versions" in tables

def test_save_feedback_returns_id(db_path):
    feedback_id = save_feedback(text="I always mess everything up", predicted_distortion="Overgeneralization", user_correction=None, is_accepted=True, confidence=0.85, path=db_path)
    assert isinstance(feedback_id, int)
    assert feedback_id > 0

def test_get_training_feedback_returns_untrained_rows(db_path):
    save_feedback("I never do anything right", "Overgeneralization", None, False, 0.76, path=db_path)                               
    save_feedback("Everything is fine", "No Distortion", None, True, 0.91, path=db_path)                                            
                                                                                                                                      
    results = get_training_feedback(path=db_path)                                                                                   
                                                                                                                                      
    assert len(results) == 1
    assert results[0][0] == "I never do anything right"