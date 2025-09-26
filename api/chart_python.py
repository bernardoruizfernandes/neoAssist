
import os
import sys
from typing import Optional

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

# Ensure we can import from the local python/ directory
PROJECT_ROOT = os.getcwd()
PYTHON_DIR = os.path.join(PROJECT_ROOT, "python")
if PYTHON_DIR not in sys.path:
    sys.path.append(PYTHON_DIR)

try:
    # Import chart generator logic
    from chart_generator import generate_chart_data
except Exception as import_error:
    generate_chart_data = None
    _import_error = import_error
else:
    _import_error = None

app = FastAPI()

def _get_data_path() -> str:
    # Return the path to the data *directory*
    return os.path.join(PROJECT_ROOT, "python", "data")

@app.post("/")
async def post_generate_chart(request: Request):
    if generate_chart_data is None:
        return JSONResponse(
            {"error": f"Failed to import chart_generator: {_import_error}"}, status_code=500
        )

    try:
        body = await request.json()
        chart_type: Optional[str] = body.get("chartType")
        query: Optional[str] = body.get("query")

        if not chart_type:
            return JSONResponse({"error": "chartType is required"}, status_code=400)

        # Pass the data path to the chart generator
        chart_data = generate_chart_data(chart_type, query or "", data_dir=_get_data_path())

        if chart_data:
            return JSONResponse({"success": True, "chartData": chart_data})
        else:
            return JSONResponse({"success": False, "error": "Failed to generate chart data"})

    except Exception as exc:
        return JSONResponse({"error": str(exc)}, status_code=500)
