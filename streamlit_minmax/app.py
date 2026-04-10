from __future__ import annotations

from datetime import date, datetime

import pandas as pd
import plotly.express as px
import streamlit as st

from data import EXERCISE_TEMPLATES, WORKOUT_TEMPLATES
from storage import (
    fetch_progress_rows,
    finish_workout,
    get_best_tonnage,
    get_last_completed,
    get_today_draft,
    init_db,
    upsert_draft,
)

st.set_page_config(page_title="Min Max Log (Streamlit)", page_icon="🏋️", layout="wide")
init_db()


def days_ago_label(d: str) -> str:
    parsed = datetime.strptime(d, "%Y-%m-%d").date()
    delta = (date.today() - parsed).days
    if delta <= 0:
        return "today"
    if delta == 1:
        return "1 day ago"
    return f"{delta} days ago"


def calc_tonnage(weight: float | None, reps: int | None, sets: int) -> float:
    if not weight or not reps:
        return 0.0
    return float(weight) * int(reps) * sets


def workout_page(workout_id: str) -> None:
    workout = next(w for w in WORKOUT_TEMPLATES if w.id == workout_id)
    exercises = sorted([e for e in EXERCISE_TEMPLATES if e.workout_template_id == workout_id], key=lambda x: x.display_order)

    st.subheader(workout.name)
    last_log, last_rows = get_last_completed(workout_id)
    with st.expander("Last time", expanded=st.session_state.get(f"first_open_{workout_id}", True)):
        st.session_state[f"first_open_{workout_id}"] = False
        if not last_log:
            st.info("No last time data yet")
        else:
            completed = sum(1 for r in last_rows if r["skipped"] == 0)
            st.caption(f"Last performed: {last_log['log_date']} ({days_ago_label(last_log['log_date'])})")
            st.caption(f"Workout tonnage: {last_log['total_tonnage']:.0f} kg")
            st.caption(f"Exercises completed: {completed}/{len(exercises)}")
            for e in exercises:
                row = next((r for r in last_rows if r["exercise_template_id"] == e.id), None)
                text = "Skipped" if not row or row["skipped"] == 1 else f"{row['weight']} kg × {row['reps']}"
                st.write(f"**{e.exercise_name}** — {text}")

    draft = get_today_draft(workout_id)
    entries = []
    total = 0.0

    st.caption("Autosave: local draft + SQLite sync on every edit")
    for e in exercises:
        prev = next((r for r in last_rows if r["exercise_template_id"] == e.id and r["skipped"] == 0), None)
        best = get_best_tonnage(workout_id, e.id)

        st.markdown(f"### {e.exercise_name}")
        if prev and last_log:
            last_text = f"{prev['weight']} kg × {prev['reps']} ({days_ago_label(last_log['log_date'])})"
        else:
            last_text = "No data yet"
        st.caption(f"Last: {last_text}")
        st.caption(f"Best tonnage: {f'{best:.0f} kg' if best else 'No data yet'}")

        c1, c2 = st.columns(2)
        default_w = draft.get(e.id, (None, None))[0]
        default_r = draft.get(e.id, (None, None))[1]

        weight = c1.number_input(f"Weight (kg) · {e.exercise_name}", min_value=0.0, value=float(default_w or 0.0), key=f"w_{e.id}")
        reps = c2.number_input(f"Reps · {e.exercise_name}", min_value=0, value=int(default_r or 0), key=f"r_{e.id}")

        weight_val = weight if weight > 0 else None
        reps_val = reps if reps > 0 else None
        tonnage = calc_tonnage(weight_val, reps_val, e.default_set_count)
        skipped = weight_val is None or reps_val is None
        total += tonnage

        entries.append(
            {
                "exercise_template_id": e.id,
                "weight": weight_val,
                "reps": reps_val,
                "tonnage": tonnage,
                "skipped": skipped,
            }
        )

    upsert_draft(workout_id, date.today().isoformat(), entries, total)
    st.success(f"Saved draft • Workout tonnage: {total:.0f} kg")

    if st.button("Finish Workout", type="primary", use_container_width=True):
        finish_workout(workout_id, date.today().isoformat())
        st.success("Workout marked complete.")
        st.rerun()


def progress_page() -> None:
    st.subheader("Progress")
    rows = fetch_progress_rows()
    if not rows:
        st.info("No completed logs yet.")
        return

    df = pd.DataFrame(rows, columns=["log_date", "region_group", "body_part", "tonnage"])
    totals = df.groupby("log_date", as_index=False)["tonnage"].sum()
    st.plotly_chart(px.line(totals, x="log_date", y="tonnage", markers=True, title="Total tonnage"), use_container_width=True)

    regional = df.pivot_table(index="log_date", columns="region_group", values="tonnage", aggfunc="sum", fill_value=0).reset_index()
    st.plotly_chart(px.bar(regional, x="log_date", y=[c for c in regional.columns if c != "log_date"], barmode="stack", title="Upper vs Lower"), use_container_width=True)

    body = df.groupby("body_part", as_index=False)["tonnage"].sum().sort_values("tonnage", ascending=False)
    body["pct"] = (body["tonnage"] / body["tonnage"].sum() * 100).round(1)
    st.plotly_chart(px.bar(body, x="body_part", y="tonnage", title="Body part contribution"), use_container_width=True)
    for row in body.itertuples(index=False):
        st.caption(f"{row.body_part.title()} — {row.pct}%")


st.title("Min Max Log • Streamlit")
st.caption("Local-first workout logging (Streamlit edition)")

page = st.sidebar.radio("Navigate", ["Home", "Workout", "Progress"])
selected = st.sidebar.selectbox("Workout template", options=[w.id for w in WORKOUT_TEMPLATES], format_func=lambda x: next(w.name for w in WORKOUT_TEMPLATES if w.id == x))

if page == "Home":
    st.subheader("Workouts")
    for w in WORKOUT_TEMPLATES:
        log, _ = get_last_completed(w.id)
        st.markdown(f"**{w.name}**")
        st.caption(f"Last logged: {log['log_date'] if log else '—'}")
elif page == "Workout":
    workout_page(selected)
else:
    progress_page()
