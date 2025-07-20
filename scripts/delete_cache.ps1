# PowerShell script to delete the .cache folder in node_modules
$cachePath = "./node_modules/.cache"
if (Test-Path $cachePath) {
    Remove-Item -Recurse -Force $cachePath
    Write-Host ".cache folder deleted successfully."
} else {
    Write-Host ".cache folder does not exist."
}
