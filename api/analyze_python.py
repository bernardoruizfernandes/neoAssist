import os
import sys
from typing import Optional

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse


# Ensure we can import from the local python/ directory
PROJECT_ROOT = os.getcwd()  # Use getcwd(), which is the project root in Vercel
PYTHON_DIR = os.path.join(PROJECT_ROOT, "python")
if PYTHON_DIR not in sys.path:
    sys.path.append(PYTHON_DIR)

try:
    # Import analyzer logic
    from analyzer import CollectionAnalyzer  # type: ignore
except Exception as import_error:  # pragma: no cover
    CollectionAnalyzer = None  # type: ignore
    _import_error = import_error
else:
    _import_error = None


app = FastAPI()


def _get_data_path() -> str:
    # Return the path to the data *directory*
    return os.path.join(PROJECT_ROOT, "python", "data")


@app.get("/")
async def get_summary():
    if CollectionAnalyzer is None:
        return JSONResponse(
            {"error": f"Failed to import analyzer: {_import_error}"}, status_code=500
        )

    try:
        analyzer = CollectionAnalyzer(_get_data_path())
        result = analyzer.get_summary_stats()
        return JSONResponse({"summary": result})
    except Exception as exc:  # pragma: no cover
        return JSONResponse({"error": str(exc)}, status_code=500)


@app.post("/")
async def post_analyze(request: Request):
    if CollectionAnalyzer is None:
        return JSONResponse(
            {"error": f"Failed to import analyzer: {_import_error}"}, status_code=500
        )

    try:
        body = await request.json()
        analysis_type: Optional[str] = body.get("analysisType") if isinstance(body, dict) else None
        if not analysis_type:
            return JSONResponse({"error": "analysisType is required"}, status_code=400)

        analyzer = CollectionAnalyzer(_get_data_path())

        if analysis_type == "summary":
            result = analyzer.get_summary_stats()
        elif analysis_type == "priority":
            result = analyzer.analyze_priority_clients()
        elif analysis_type == "strategies":
            result = analyzer.analyze_collection_strategies()
        elif analysis_type == "insights":
            result = analyzer.generate_recovery_insights()
        else:
            return JSONResponse({"error": "Invalid analysisType"}, status_code=400)

        return JSONResponse({"analysis": result})
    except Exception as exc:  # pragma: no cover
        return JSONResponse({"error": str(exc)}, status_code=500)


