@echo off
echo ========================================================
echo AgriVision AI - Setup & Launch Script
echo ========================================================

REM Step 1: Install Python Dependencies
echo [1/3] Installing Python ML & API packages...
pip install -r requirements.txt

REM Step 2: Generate Data and Train Models
echo [2/3] Generating agronomic dataset and training LightGBM models...
python -m src.data.generate_dataset
python -m src.ml.train

REM Step 3: Run Backend & Unified Web App
echo [3/3] Launching AgriVision AI Web Application...
python run.py
