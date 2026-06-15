"""Download the official Synthea generator JAR from GitHub releases."""

import sys
from pathlib import Path

import requests
from tqdm import tqdm

SYNTHEA_VERSION = "v3.4.1"
SYNTHEA_JAR = "synthea-with-dependencies.jar"
SYNTHEA_URL = (
    f"https://github.com/synthetichealth/synthea/releases/download/"
    f"{SYNTHEA_VERSION}/{SYNTHEA_JAR}"
)


def download_synthea(target_dir: str = "./synthea", version: str = SYNTHEA_VERSION) -> Path:
    """Download the Synthea JAR from GitHub releases."""
    target = Path(target_dir)
    target.mkdir(parents=True, exist_ok=True)
    jar_path = target / SYNTHEA_JAR

    if jar_path.exists():
        print(f"[download_synthea] JAR already exists at {jar_path}")
        return jar_path

    url = SYNTHEA_URL.replace(SYNTHEA_VERSION, version)
    print(f"[download_synthea] Downloading Synthea {version} from GitHub...")

    try:
        response = requests.get(url, stream=True, timeout=300)
        response.raise_for_status()
        total_size = int(response.headers.get("content-length", 0))
        with open(jar_path, "wb") as f:
            with tqdm(total=total_size, unit="B", unit_scale=True, desc="Downloading") as pbar:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
                    pbar.update(len(chunk))
        print(f"[download_synthea] Downloaded to {jar_path}")
        return jar_path
    except requests.RequestException as e:
        print(f"[download_synthea] ERROR: {e}")
        print(f"Manual: download {SYNTHEA_JAR} from GitHub releases and place at {jar_path.absolute()}")
        sys.exit(1)
