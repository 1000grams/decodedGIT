# search_button_usage.ps1
# PowerShell script to search for all usages of 'Button' in the src directory

$pattern = 'Button'
$searchPath = "./src"

Write-Host "Searching for all usages of 'Button' in $searchPath..."

Get-ChildItem -Path $searchPath -Recurse -Include *.js,*.jsx | ForEach-Object {
    $file = $_.FullName
    $buttonMatches = Select-String -Path $file -Pattern $pattern
    if ($buttonMatches) {
        Write-Host "`nFile: $file"
        $buttonMatches | ForEach-Object {
            Write-Host ("Line {0}: {1}" -f $_.LineNumber, $_.Line.Trim())
        }
    }
}

Write-Host "`nSearch complete."
