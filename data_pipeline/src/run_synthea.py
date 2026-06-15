"""Execute Synthea to generate synthetic patient data."""

import subprocess
import sys
from pathlib import Path


def run_synthea(
    jar_path: str,
    population: int = 100,
    output_dir: str = "./synthea/output",
    exporter: str = "csv",
    seed: int = None,
) -> Path:
    """Run Synthea to generate synthetic patient data."""
    jar = Path(jar_path)
    if not jar.exists():
        print(f"[run_synthea] ERROR: JAR not found at {jar_path}")
        print("  Run download_synthea.py first or download manually.")
        sys.exit(1)

    output = Path(output_dir)
    output.mkdir(parents=True, exist_ok=True)

    cmd = [
        "java", "-jar", str(jar.absolute()),
        "-p", str(population),
        f"--exporter.{exporter}.export", "true",
        f"--exporter.baseDirectory", str(output.absolute()),
    ]
    if seed is not None:
        cmd.extend(["--seed", str(seed)])

    print(f"[run_synthea] Generating {population} patients...")
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=600)
        if result.stdout:
            for line in result.stdout.strip().split("\n"):
                if line.strip():
                    print(f"  [synthea] {line.strip()}")
        if result.returncode != 0:
            print(f"[run_synthea] ERROR: exit code {result.returncode}")
            if result.stderr:
                print(f"  stderr: {result.stderr}")
            sys.exit(1)
        print(f"[run_synthea] Done. Output: {output.absolute()}")
        return output
    except subprocess.TimeoutExpired:
        print("[run_synthea] ERROR: timed out after 10 minutes.")
        sys.exit(1)
    except FileNotFoundError:
        print("[run_synthea] ERROR: 'java' not found. Install Java 11+.")
        sys.exit(1)
