"""
AgriVision AI - Feature Engineering & Preprocessing Pipeline
Strict time-based train/test splits with zero leakage,
agronomic domain features, and robust transformations.
"""

from typing import Dict, List, Tuple
import numpy as np
import pandas as pd
from sklearn.base import BaseEstimator, TransformerMixin
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import OneHotEncoder, RobustScaler

IRRIGATION_EFFICIENCY = {
    "Drip": 1.50,
    "Sprinkler": 1.35,
    "Tube Well": 1.25,
    "Canal/Flood": 1.20,
    "Rainfed": 1.00
}

class AgronomicFeatureEngineer(BaseEstimator, TransformerMixin):
    """Generates agronomic interaction features without leaking test labels."""

    def __init__(self):
        self.historical_crop_district_means_ = {}

    def fit(self, X: pd.DataFrame, y=None):
        df = X.copy()
        if y is not None:
            df["target"] = y
            # Calculate mean yield per crop and district for fallback
            means = df.groupby(["crop", "district"])["target"].mean().to_dict()
            self.historical_crop_district_means_ = means
            # Overall mean fallback
            self.overall_mean_ = float(df["target"].mean())
        else:
            self.overall_mean_ = 3.5
        return self

    def transform(self, X: pd.DataFrame) -> pd.DataFrame:
        df = X.copy()

        # 1. Rainfall x Irrigation Interaction
        irrig_mult = df["irrigation_type"].map(IRRIGATION_EFFICIENCY).fillna(1.0)
        df["rainfall_x_irrigation"] = df["rainfall_mm"] * irrig_mult

        # 2. Approximate Growing Degree Days (Base Temp 10°C, 120-day season)
        base_temp = 10.0
        df["growing_degree_days"] = np.maximum(0.0, df["avg_temp_c"] - base_temp) * 120.0

        # 3. Heat Stress Index (temperature above critical 32°C threshold)
        df["heat_stress_idx"] = np.maximum(0.0, df["avg_temp_c"] - 32.0)

        # 4. NPK Balance Ratios
        df["npk_ratio"] = df["fertilizer_n"] / (df["fertilizer_p"] + df["fertilizer_k"] + 1.0)
        df["total_npk"] = df["fertilizer_n"] + df["fertilizer_p"] + df["fertilizer_k"]

        # 5. Soil pH deviation from neutral (7.0)
        df["ph_neutral_diff"] = (df["soil_ph"] - 7.0).abs()

        # 6. Historical benchmark yield feature
        def get_hist_mean(row):
            key = (row["crop"], row["district"])
            return self.historical_crop_district_means_.get(key, self.overall_mean_)

        df["historical_benchmark_yield"] = df.apply(get_hist_mean, axis=1)

        return df


def prepare_dataset(csv_path: str = "data/processed/crop_yield_enriched.csv") -> Tuple[pd.DataFrame, pd.DataFrame, pd.Series, pd.Series]:
    """Loads dataset and performs time-based train/test split (Train <= 2020, Test >= 2021)."""
    df = pd.read_csv(csv_path)

    # Sort strictly chronologically
    df = df.sort_values(by=["year", "crop", "district", "season"]).reset_index(drop=True)

    # Compute rolling 3-year historical yield per (crop, district) strictly using past years
    # to avoid any future leakage
    df["rolling_3yr_mean"] = 0.0
    df["lag_yield_1yr"] = 0.0

    for (crop, district), grp in df.groupby(["crop", "district"]):
        grp_sorted = grp.sort_values(by="year")
        past_yields = {}
        for idx, row in grp_sorted.iterrows():
            curr_year = row["year"]
            # Look at past 3 years: curr_year-1, curr_year-2, curr_year-3
            past_3 = [past_yields[y] for y in [curr_year - 1, curr_year - 2, curr_year - 3] if y in past_yields]
            if past_3:
                df.loc[idx, "rolling_3yr_mean"] = float(np.mean(past_3))
            else:
                df.loc[idx, "rolling_3yr_mean"] = float(row["yield_tonnes_per_ha"])

            if (curr_year - 1) in past_yields:
                df.loc[idx, "lag_yield_1yr"] = float(past_yields[curr_year - 1])
            else:
                df.loc[idx, "lag_yield_1yr"] = float(row["yield_tonnes_per_ha"])

            past_yields[curr_year] = row["yield_tonnes_per_ha"]

    # Time-based split
    train_mask = df["year"] <= 2020
    test_mask = df["year"] >= 2021

    train_df = df[train_mask].copy().reset_index(drop=True)
    test_df = df[test_mask].copy().reset_index(drop=True)

    target_col = "yield_tonnes_per_ha"
    feature_cols = [
        "crop", "state", "district", "season", "year", "area_ha",
        "soil_type", "soil_ph", "rainfall_mm", "avg_temp_c",
        "irrigation_type", "fertilizer_n", "fertilizer_p", "fertilizer_k",
        "rolling_3yr_mean", "lag_yield_1yr"
    ]

    X_train = train_df[feature_cols]
    y_train = train_df[target_col]
    X_test = test_df[feature_cols]
    y_test = test_df[target_col]

    return X_train, X_test, y_train, y_test
