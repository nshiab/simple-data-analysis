import os
import sys
from pathlib import Path

SCRIPT_DIRECTORY = Path(__file__).resolve().parent
sys.path = [
    entry
    for entry in sys.path
    if Path(entry or ".").resolve() != SCRIPT_DIRECTORY
]

import geopandas as gpd
import pandas as pd


def required_environment(name: str) -> str:
    value = os.environ.get(name)
    if not value:
        raise RuntimeError(f"Missing required environment variable {name}.")
    return value


trees_input = required_environment("BENCHMARK_INPUT")
neighbourhoods_input = required_environment("BENCHMARK_POLYGONS")
result_output = required_environment("BENCHMARK_RESULT_OUTPUT")

trees = pd.read_csv(trees_input, usecols=["Longitude", "Latitude"])
trees = trees.dropna(subset=["Longitude", "Latitude"])
trees = gpd.GeoDataFrame(
    trees,
    geometry=gpd.points_from_xy(trees["Longitude"], trees["Latitude"]),
    crs="EPSG:4326",
)
neighbourhoods = gpd.read_file(neighbourhoods_input, columns=["nom_qr"])
joined = gpd.sjoin(trees, neighbourhoods, how="inner", predicate="covered_by")
result = (
    joined.groupby("nom_qr", as_index=False)
    .size()
    .rename(columns={"size": "count"})
    .sort_values("nom_qr")
)
result.to_csv(result_output, index=False)
