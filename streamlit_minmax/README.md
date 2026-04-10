# Min Max Log (Streamlit Version)

This folder is a Streamlit duplicate of the core Min Max Log workflow.

## Run

```bash
cd streamlit_minmax
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
streamlit run app.py
```

Open the URL shown by Streamlit (usually `http://localhost:8501`).

## Included

- Workout templates + exercise templates
- Last time summary + per-exercise status
- Last/Best preview under each exercise
- Two independent set logs per exercise (Set 1 / Set 2)
- Autosaving drafts to SQLite (`minmax_streamlit.db`)
- Finish workout action
- Progress charts for total/upper-lower/body-part contribution
