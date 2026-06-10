from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Any, List, Optional
import sqlite3, os, trafilatura

DB_PATH = os.environ.get("DB_PATH", "/opt/zen.db")

app = FastAPI()


@app.get("/extract")
def extract(url: str):
    """Extract clean text from a URL. Returns content, word_count, quality_score."""
    downloaded = trafilatura.fetch_url(url)
    if not downloaded:
        raise HTTPException(status_code=422, detail="Failed to fetch URL")

    result = trafilatura.extract(
        downloaded,
        output_format="txt",
        include_comments=False,
        include_tables=True,
        favor_recall=True,
        with_metadata=True,
    )

    if not result:
        return JSONResponse({"content": None, "word_count": 0, "quality_score": 0.0})

    words = result.split()
    word_count = len(words)

    # quality_score: simple heuristic — penalise very short extractions
    if word_count >= 300:
        quality_score = 1.0
    elif word_count >= 150:
        quality_score = 0.85
    elif word_count >= 50:
        quality_score = 0.5
    else:
        quality_score = 0.2

    return JSONResponse({
        "content": result,
        "word_count": word_count,
        "quality_score": quality_score,
    })


class QueryRequest(BaseModel):
    sql: str
    params: Optional[List[Any]] = []


@app.post("/db/query")
def db_query(req: QueryRequest):
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        cur = conn.execute(req.sql, req.params)
        conn.commit()
        rows = [dict(r) for r in cur.fetchall()]
        return {"rows": rows}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()


@app.get("/healthz")
def health():
    return {"ok": True}
