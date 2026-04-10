from __future__ import annotations

import sqlite3
from contextlib import closing
from datetime import date
from pathlib import Path

from data import EXERCISE_TEMPLATES

DB_PATH = Path(__file__).parent / "minmax_streamlit.db"
BODY_MAP = {e.id: {"body_part": e.body_part, "region_group": e.region_group} for e in EXERCISE_TEMPLATES}


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
              set_index integer not null default 1,
              weight real,
              reps integer,
              tonnage real not null default 0,
              skipped integer not null default 0,
              updated_at text default current_timestamp,
              unique(workout_log_id, exercise_template_id, set_index)
            );
            """
        )

        cols = [r["name"] for r in db.execute("pragma table_info(exercise_logs)").fetchall()]
        if "set_index" not in cols:
            db.execute("alter table exercise_logs add column set_index integer not null default 1")

        db.execute(
            """
            create unique index if not exists uq_exercise_set
            on exercise_logs(workout_log_id, exercise_template_id, set_index)
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
                insert into exercise_logs (workout_log_id, exercise_template_id, set_index, weight, reps, tonnage, skipped)
                values (?, ?, ?, ?, ?, ?, ?)
                on conflict(workout_log_id, exercise_template_id, set_index)
                do update set weight=excluded.weight, reps=excluded.reps, tonnage=excluded.tonnage, skipped=excluded.skipped, updated_at=current_timestamp
                """,
                (
                    log_id,
                    e["exercise_template_id"],
                    e["set_index"],
                    e["weight"],
                    e["reps"],
                    e["tonnage"],
                    1 if e["skipped"] else 0,
                ),
            )
        db.commit()


def finish_workout(workout_template_id: str, log_date: str) -> None:
    with closing(conn()) as db:
        db.execute(
            "update workout_logs set is_draft=0, updated_at=current_timestamp where workout_template_id=? and log_date=?",
            (workout_template_id, log_date),
        )
        db.commit()


def get_today_draft(workout_template_id: str) -> dict[str, dict[int, tuple[float | None, int | None]]]:
    today = date.today().isoformat()
    with closing(conn()) as db:
        row = db.execute(
            "select id from workout_logs where workout_template_id=? and log_date=? and is_draft=1",
            (workout_template_id, today),
        ).fetchone()
        if not row:
            return {}
        records = db.execute(
            "select exercise_template_id, set_index, weight, reps from exercise_logs where workout_log_id=?",
            (row[0],),
        ).fetchall()

    result: dict[str, dict[int, tuple[float | None, int | None]]] = {}
    for r in records:
        result.setdefault(r["exercise_template_id"], {})[int(r["set_index"])] = (r["weight"], r["reps"])
    return result


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
            "select * from exercise_logs where workout_log_id=? order by exercise_template_id, set_index",
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


def fetch_progress_rows() -> list[dict]:
    with closing(conn()) as db:
        rows = db.execute(
            """
            select wl.log_date, el.exercise_template_id, sum(el.tonnage) as tonnage
            from workout_logs wl
            join exercise_logs el on el.workout_log_id = wl.id
            where wl.is_draft=0
            group by wl.log_date, el.exercise_template_id
            order by wl.log_date
            """
        ).fetchall()

    result = []
    for row in rows:
        meta = BODY_MAP.get(row["exercise_template_id"], {"body_part": "other", "region_group": "upper"})
        result.append(
            {
                "log_date": row["log_date"],
                "region_group": meta["region_group"],
                "body_part": meta["body_part"],
                "tonnage": float(row["tonnage"] or 0),
            }
        )
    return result
