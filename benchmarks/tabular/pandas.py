import os
import sys
from pathlib import Path

SCRIPT_DIRECTORY = Path(__file__).resolve().parent
sys.path = [
    entry
    for entry in sys.path
    if Path(entry or ".").resolve() != SCRIPT_DIRECTORY
]

import numpy as np
import pandas as pd


def required_environment(name: str) -> str:
    value = os.environ.get(name)
    if not value:
        raise RuntimeError(f"Missing required environment variable {name}.")
    return value


input_path = required_environment("BENCHMARK_INPUT")
clean_output = required_environment("BENCHMARK_CLEAN_OUTPUT")
result_output = required_environment("BENCHMARK_RESULT_OUTPUT")

temperatures = pd.read_csv(
    input_path,
    dtype=str,
    usecols=["time", "station", "station_name", "tas"],
)
temperatures = temperatures.dropna(subset=["tas"])
temperatures["tas"] = pd.to_numeric(temperatures["tas"])
temperatures["time"] = pd.to_datetime(temperatures["time"])
temperatures["decade"] = (
    np.floor(temperatures["time"].dt.year / 10) * 10
).astype("int64")
temperatures.to_csv(clean_output, index=False)

result = (
    temperatures.groupby(["station", "station_name", "decade"], as_index=False)
    .agg(mean=("tas", "mean"))
    .sort_values(["station", "station_name", "decade"])
)
result.to_csv(result_output, index=False)
