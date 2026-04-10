from __future__ import annotations

import sqlite3
from contextlib import closing
from datetime import date
from pathlib import Path

DB_PATH = Path(__file__).parent / "minmax_streamlit.db"


def conn() -> sqlite3.Connection:
    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def init_db() -> None:
    with closing(conn()) as db:
        db.executescript(
            """
            create table if not exists workout_logs (
              id integer primary key autoincrement,
              workout_template_id text not null,
              log_date text not null,
              is_draft integer not null default 1,
              total_tonnage real not null default 0,
              updated_at text default current_timestamp,
              unique(workout_template_id, log_date)
            );

            create table if not exists exercise_logs (
              id integer primary key autoincrement,
              workout_log_id integer not null,
              exercise_template_id text not null,
              weight real,
              reps integer,
              tonnage real not null default 0,
              skipped integer not null default 0,
              updated_at text default current_timestamp,
              unique(workout_log_id, exercise_template_id)
            );
            """
        )
        db.commit()


def upsert_draft(workout_template_id: str, log_date: str, entries: list[dict], total_tonnage: float) -> None:
    with closing(conn()) as db:
        db.execute(
            """
            insert into workout_logs (workout_template_id, log_date, is_draft, total_tonnage)
            values (?, ?, 1, ?)
            on conflict(workout_template_id, log_date)
            do update set is_draft=1, total_tonnage=excluded.total_tonnage, updated_at=current_timestamp
            """,
            (workout_template_id, log_date, total_tonnage),
        )
        log_id = db.execute(
            "select id from workout_logs where workout_template_id=? and log_date=?",
            (workout_template_id, log_date),
        ).fetchone()[0]

        for e in entries:
            db.execute(
                """
                insert into exercise_logs (workout_log_id, exercise_template_id, weight, reps, tonnage, skipped)
                values (?, ?, ?, ?, ?, ?)
                on conflict(workout_log_id, exercise_template_id)
                do update set weight=excluded.weight, reps=excluded.reps, tonnage=excluded.tonnage, skipped=excluded.skipped, updated_at=current_timestamp
                """,
                (log_id, e["exercise_template_id"], e["weight"], e["reps"], e["tonnage"], 1 if e["skipped"] else 0),
            )
        db.commit()


def finish_workout(workout_template_id: str, log_date: str) -> None:
    with closing(conn()) as db:
        db.execute(
            "update workout_logs set is_draft=0, updated_at=current_timestamp where workout_template_id=? and log_date=?",
            (workout_template_id, log_date),
        )
        db.commit()


def get_today_draft(workout_template_id: str) -> dict[str, tuple[float | None, int | None]]:
    today = date.today().isoformat()
    with closing(conn()) as db:
        row = db.execute(
            "select id from workout_logs where workout_template_id=? and log_date=? and is_draft=1",
            (workout_template_id, today),
        ).fetchone()
        if not row:
            return {}
        records = db.execute(
            "select exercise_template_id, weight, reps from exercise_logs where workout_log_id=?",
            (row[0],),
        ).fetchall()
    return {r["exercise_template_id"]: (r["weight"], r["reps"]) for r in records}


def get_last_completed(workout_template_id: str):
    today = date.today().isoformat()
    with closing(conn()) as db:
        log = db.execute(
            """
            select * from workout_logs
            where workout_template_id=? and is_draft=0 and log_date < ?
            order by log_date desc
            limit 1
            """,
            (workout_template_id, today),
        ).fetchone()
        if not log:
            return None, []
        rows = db.execute(
            "select * from exercise_logs where workout_log_id=?",
            (log["id"],),
        ).fetchall()
    return log, rows


def get_best_tonnage(workout_template_id: str, exercise_template_id: str) -> float | None:
    with closing(conn()) as db:
        value = db.execute(
            """
            select max(el.tonnage) as best
            from workout_logs wl
            join exercise_logs el on el.workout_log_id = wl.id
            where wl.workout_template_id=? and wl.is_draft=0 and el.exercise_template_id=? and el.tonnage > 0
            """,
            (workout_template_id, exercise_template_id),
        ).fetchone()["best"]
    return float(value) if value else None


def fetch_progress_rows() -> list[sqlite3.Row]:
    with closing(conn()) as db:
        rows = db.execute(
            """
            select wl.log_date, et.region_group, et.body_part, sum(el.tonnage) as tonnage
            from workout_logs wl
            join exercise_logs el on el.workout_log_id = wl.id
            join (select id, body_part, region_group from (values
              ('u1-1','chest','upper'),('u1-2','chest','upper'),('u1-3','lats','upper'),
              ('l1-1','quads','lower'),('l1-2','hamstrings','lower'),('u2-1','chest','upper'),
              ('u2-2','upper back','upper'),('l2-1','quads','lower'),('l2-2','hamstrings','lower'),
              ('a1','biceps','upper'),('a2','triceps','upper'),('a3','shoulders','upper')
            ) as x(id, body_part, region_group)) et on et.id = el.exercise_template_id
            where wl.is_draft=0
            group by wl.log_date, et.region_group, et.body_part
            order by wl.log_date
            """
        ).fetchall()
    return rows
