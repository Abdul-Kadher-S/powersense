"""SQLite database setup for local development.
Falls back from Supabase when no Supabase credentials are configured.
"""
import sqlite3
import os
import json
from datetime import datetime, date
from typing import Optional, List, Dict, Any
from contextlib import contextmanager

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "homeguard.db")


def get_db_path():
    return os.path.abspath(DB_PATH)


@contextmanager
def get_connection():
    """Get a database connection with row factory."""
    conn = sqlite3.connect(get_db_path())
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def init_db():
    """Create all tables if they don't exist."""
    with get_connection() as conn:
        conn.executescript("""
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                email TEXT UNIQUE NOT NULL,
                name TEXT NOT NULL,
                household_name TEXT DEFAULT 'My Home',
                created_at TEXT DEFAULT (datetime('now'))
            );

            CREATE TABLE IF NOT EXISTS electricity_readings (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                month INTEGER NOT NULL,
                year INTEGER NOT NULL,
                units_kwh REAL NOT NULL,
                bill_amount REAL,
                reading_date TEXT,
                source TEXT DEFAULT 'demo',
                notes TEXT,
                created_at TEXT DEFAULT (datetime('now')),
                FOREIGN KEY (user_id) REFERENCES users(id)
            );

            CREATE TABLE IF NOT EXISTS electricity_predictions (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                predicted_month INTEGER NOT NULL,
                predicted_year INTEGER NOT NULL,
                predicted_kwh REAL NOT NULL,
                predicted_bill REAL,
                confidence_low REAL,
                confidence_high REAL,
                model_used TEXT,
                created_at TEXT DEFAULT (datetime('now')),
                FOREIGN KEY (user_id) REFERENCES users(id)
            );

            CREATE TABLE IF NOT EXISTS appliances (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                name TEXT NOT NULL,
                category TEXT NOT NULL,
                brand TEXT,
                model TEXT,
                purchase_year INTEGER,
                age_years REAL,
                usage_hours_daily REAL,
                usage_days_per_week INTEGER DEFAULT 7,
                energy_rating TEXT,
                rated_power_watts REAL,
                last_maintenance_date TEXT,
                maintenance_frequency_months INTEGER,
                reported_issues INTEGER DEFAULT 0,
                reported_symptoms TEXT,
                status TEXT DEFAULT 'active',
                icon TEXT,
                created_at TEXT DEFAULT (datetime('now')),
                FOREIGN KEY (user_id) REFERENCES users(id)
            );

            CREATE TABLE IF NOT EXISTS appliance_readings (
                id TEXT PRIMARY KEY,
                appliance_id TEXT NOT NULL,
                month INTEGER NOT NULL,
                year INTEGER NOT NULL,
                energy_kwh REAL NOT NULL,
                usage_hours REAL,
                notes TEXT,
                created_at TEXT DEFAULT (datetime('now')),
                FOREIGN KEY (appliance_id) REFERENCES appliances(id)
            );

            CREATE TABLE IF NOT EXISTS maintenance_records (
                id TEXT PRIMARY KEY,
                appliance_id TEXT NOT NULL,
                maintenance_date TEXT NOT NULL,
                maintenance_type TEXT,
                description TEXT,
                cost REAL,
                performed_by TEXT,
                created_at TEXT DEFAULT (datetime('now')),
                FOREIGN KEY (appliance_id) REFERENCES appliances(id)
            );

            CREATE TABLE IF NOT EXISTS insights (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                category TEXT NOT NULL,
                severity TEXT NOT NULL,
                title TEXT NOT NULL,
                description TEXT NOT NULL,
                explanation TEXT,
                recommendation TEXT,
                related_appliance_id TEXT,
                data_json TEXT,
                is_read INTEGER DEFAULT 0,
                created_at TEXT DEFAULT (datetime('now')),
                FOREIGN KEY (user_id) REFERENCES users(id)
            );

            CREATE TABLE IF NOT EXISTS uploaded_bills (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                filename TEXT,
                file_type TEXT,
                billing_period TEXT,
                units_consumed REAL,
                bill_amount REAL,
                meter_number TEXT,
                consumer_number TEXT,
                extracted_data TEXT,
                ocr_status TEXT DEFAULT 'pending',
                created_at TEXT DEFAULT (datetime('now')),
                FOREIGN KEY (user_id) REFERENCES users(id)
            );

            CREATE TABLE IF NOT EXISTS recommendations (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                priority TEXT NOT NULL,
                category TEXT NOT NULL,
                title TEXT NOT NULL,
                description TEXT NOT NULL,
                expected_impact TEXT,
                reason TEXT,
                suggested_action TEXT,
                related_appliance_id TEXT,
                is_completed INTEGER DEFAULT 0,
                created_at TEXT DEFAULT (datetime('now')),
                FOREIGN KEY (user_id) REFERENCES users(id)
            );
        """)


def query(sql: str, params: tuple = (), one: bool = False) -> Any:
    """Execute a query and return results as list of dicts."""
    with get_connection() as conn:
        cursor = conn.execute(sql, params)
        rows = cursor.fetchall()
        if one:
            return dict(rows[0]) if rows else None
        return [dict(row) for row in rows]


def execute(sql: str, params: tuple = ()) -> None:
    """Execute a statement (INSERT/UPDATE/DELETE)."""
    with get_connection() as conn:
        conn.execute(sql, params)


def execute_many(sql: str, params_list: list) -> None:
    """Execute a statement with multiple parameter sets."""
    with get_connection() as conn:
        conn.executemany(sql, params_list)
