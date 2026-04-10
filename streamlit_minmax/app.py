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


def calc_tonnage(weight: float | None, reps: int | None) -> float:
    if not weight or not reps:
        return 0.0
    return float(weight) * int(reps)


def set_value_text(last_rows, exercise_id: str, set_index: int) -> str:
    row = next((r for r in last_rows if r["exercise_template_id"] == exercise_id and int(r["set_index"]) == set_index), None)
    if not row or row["skipped"] == 1:
        return "Skipped"
    return f"{row['weight']} kg × {row['reps']}"


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
            completed = len([r for r in last_rows if r["skipped"] == 0])
            st.caption(f"Last performed: {last_log['log_date']} ({days_ago_label(last_log['log_date'])})")
            st.caption(f"Workout tonnage: {last_log['total_tonnage']:.0f} kg")
            st.caption(f"Completed sets: {completed}/{len(exercises) * 2}")
            for e in exercises:
                st.write(
                    f"**{e.exercise_name}** — Set 1: {set_value_text(last_rows, e.id, 1)} | Set 2: {set_value_text(last_rows, e.id, 2)}"
                )

    draft = get_today_draft(workout_id)
    entries = []
    total = 0.0

    st.caption("Autosave: local draft + SQLite sync on every edit")
    for e in exercises:
        best = get_best_tonnage(workout_id, e.id)
        if last_log:
            last_text = (
                f"Set 1: {set_value_text(last_rows, e.id, 1)} | "
                f"Set 2: {set_value_text(last_rows, e.id, 2)} ({days_ago_label(last_log['log_date'])})"
            )
        else:
            last_text = "No data yet"

        st.markdown(f"### {e.exercise_name}")
        st.caption(f"Last: {last_text}")
        st.caption(f"Best tonnage: {f'{best:.0f} kg' if best else 'No data yet'}")

        selected_set = st.radio(
            f"Pick active set · {e.exercise_name}",
            options=[1, 2],
            horizontal=True,
            key=f"active_set_{e.id}",
            format_func=lambda s: f"Set {s}",
        )

        for set_idx in [1, 2]:
            defaults = draft.get(e.id, {}).get(set_idx, (None, None))
            is_active = selected_set == set_idx
            with st.container(border=True):
                st.markdown(f"**Set {set_idx}**{' ✅' if is_active else ''}")
                c1, c2 = st.columns(2)
                weight = c1.number_input(
                    f"Weight (kg) · {e.exercise_name} · Set {set_idx}",
                    min_value=0.0,
                    value=float(defaults[0] or 0.0),
                    key=f"w_{e.id}_{set_idx}",
                    disabled=not is_active,
                )
                reps = c2.number_input(
                    f"Reps · {e.exercise_name} · Set {set_idx}",
                    min_value=0,
                    value=int(defaults[1] or 0),
                    key=f"r_{e.id}_{set_idx}",
                    disabled=not is_active,
                )

                weight_val = weight if weight > 0 else None
                reps_val = reps if reps > 0 else None
                tonnage = calc_tonnage(weight_val, reps_val)
                skipped = weight_val is None or reps_val is None
                total += tonnage

                entries.append(
                    {
                        "exercise_template_id": e.id,
                        "set_index": set_idx,
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

    df = pd.DataFrame(rows)
    totals = df.groupby("log_date", as_index=False)["tonnage"].sum()
    st.plotly_chart(px.line(totals, x="log_date", y="tonnage", markers=True, title="Total tonnage"), use_container_width=True)

    regional = df.pivot_table(index="log_date", columns="region_group", values="tonnage", aggfunc="sum", fill_value=0).reset_index()
    st.plotly_chart(
        px.bar(regional, x="log_date", y=[c for c in regional.columns if c != "log_date"], barmode="stack", title="Upper vs Lower"),
        use_container_width=True,
    )

    body = df.groupby("body_part", as_index=False)["tonnage"].sum().sort_values("tonnage", ascending=False)
    body["pct"] = (body["tonnage"] / body["tonnage"].sum() * 100).round(1)
    st.plotly_chart(px.bar(body, x="body_part", y="tonnage", title="Body part contribution"), use_container_width=True)
    for row in body.itertuples(index=False):
        st.caption(f"{row.body_part.title()} — {row.pct}%")


st.title("Min Max Log • Streamlit")
st.caption("Local-first workout logging (Streamlit edition)")
st.info("Luka Dovah 2")

page = st.sidebar.radio("Navigate", ["Home", "Workout", "Progress"])
selected = st.sidebar.selectbox(
    "Workout template",
    options=[w.id for w in WORKOUT_TEMPLATES],
    format_func=lambda x: next(w.name for w in WORKOUT_TEMPLATES if w.id == x),
)

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
