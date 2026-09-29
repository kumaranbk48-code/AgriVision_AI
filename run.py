"""
AgriVision AI - Unified Server Runner
Starts the production FastAPI service serving the full SPA application on port 8000,
with automatic checks for model artifacts and data generation.
"""

import os
import sys
import subprocess
import time

def check_or_build_artifacts():
    if not os.path.exists("artifacts/model.joblib"):
        print("[AgriVision AI] Artifacts missing. Generating dataset and training models...")
        subprocess.run([sys.executable, "-m", "src.data.generate_dataset"], check=True)
        subprocess.run([sys.executable, "-m", "src.ml.train"], check=True)
    else:
        print("[AgriVision AI] Model artifacts found in artifacts/")

def main():
    check_or_build_artifacts()
    
    print("\n" + "=" * 60)
    print("AGRIVISION AI: SEASONAL CROP INTELLIGENCE PLATFORM")
    print("=" * 60)
    print("Starting production server...")
    print("Web Application available at: http://localhost:8000")
    print("Interactive API Docs at:     http://localhost:8000/docs")
    print("Frontend Dev Server at:      http://localhost:5173 (optional)")
    print("=" * 60 + "\n")

    import uvicorn
    uvicorn.run("src.api.main:app", host="0.0.0.0", port=8000, reload=False)

if __name__ == "__main__":
    main()
