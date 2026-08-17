$ErrorActionPreference = "Stop"

$dataset = "shalakagangurde/hospital-hmis-dataset-for-healthcare-analytics"
$destination = "backend/start/src/main/resources/seed-data/kaggle/hospital-hmis"

New-Item -ItemType Directory -Force -Path $destination | Out-Null

$downloaded = $false
if (Test-Path "$HOME\.kaggle\kaggle.json") {
  try {
    kaggle datasets download $dataset -p $destination --unzip -o
    $downloaded = $true
  } catch {
    Write-Warning "Kaggle CLI failed: $_. Falling back to direct download..."
  }
}

if (-not $downloaded) {
  Write-Host "Downloading $dataset via HTTPS..."
  python -c @"
import urllib.request, zipfile, io, os, shutil, glob
url = 'https://www.kaggle.com/api/v1/datasets/download/$dataset'
dest = r'$destination'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req) as resp:
    data = resp.read()
    with zipfile.ZipFile(io.BytesIO(data)) as z:
        z.extractall(dest)
sub = os.path.join(dest, 'hospital_synthetic_shalaka', 'hospital_data')
if os.path.exists(sub):
    for f in os.listdir(sub):
        shutil.move(os.path.join(sub, f), os.path.join(dest, f))
    shutil.rmtree(os.path.join(dest, 'hospital_synthetic_shalaka'))
for f in glob.glob(os.path.join(dest, '*.png')):
    os.remove(f)
"@
}

Get-ChildItem "$destination/*.csv" |
  Sort-Object Name |
  Get-FileHash -Algorithm SHA256 |
  ForEach-Object { "$($_.Hash.ToLower())  $([System.IO.Path]::GetFileName($_.Path))" } |
  Set-Content "$destination/CHECKSUMS.sha256"

Write-Host "Downloaded $dataset -> $destination"
Write-Host "Generated CHECKSUMS.sha256 with 19 files."
