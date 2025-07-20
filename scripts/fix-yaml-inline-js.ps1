$basePath = "C:\decoded\cloudformation"
$yamlFiles = Get-ChildItem -Path $basePath -Include *.yml,*.yaml -File -Recurse

if ($yamlFiles.Count -eq 0) {
    Write-Host "❌ No .yml or .yaml files found in $basePath" -ForegroundColor Red
    exit
}

foreach ($file in $yamlFiles) {
    $filePath = $file.FullName
    Write-Host "`n📄 Processing $filePath..." -ForegroundColor Cyan
    $originalContent = Get-Content -Path $filePath -Raw
    $fixedContent = $originalContent
    $modified = $false

    $regex = [regex]::new('(?ms)(?<=ZipFile:\s*\|\s*\n)( {2,})(.*?)(?=\n\S|$)')
    $jsBlocks = $regex.Matches($originalContent)

    foreach ($block in $jsBlocks) {
        $indent = $block.Groups[1].Value
        $jsCode = $block.Groups[2].Value

        # Safely un-indent the JS code
        $escapedIndent = [regex]::Escape($indent)
        $code = [regex]::Replace($jsCode, "^$escapedIndent", "", [System.Text.RegularExpressions.RegexOptions]::Multiline)

        # Fix common JS lint problems
        $code = $code -replace '(\w+\s*&&\s*\w+)\s*\|\|\s*(\w+)', '($1) || $2'
        $code = $code -replace '(?<!\w),\s*', '; '
        $code = $code -replace '(^|\s)([a-zA-Z_$][\w$]*\s*\(.*?\));', '$1void $2;'
        $code = $code -replace 'const\s+\[(\w+),\s*set(\w+)\]\s*=\s*useState\([^\)]*\);(?![\s\S]*?\b\1\b)', 'const [_, set$2] = useState(null);'

        # Re-indent cleaned code
        $indentedCode = ($code -split "`n") | ForEach-Object { "$indent$_" } | Out-String
        $fixedContent = $fixedContent -replace [regex]::Escape($block.Value), $indentedCode.TrimEnd()
        $modified = $true
        Write-Host "  ✅ Cleaned embedded JS block" -ForegroundColor Green
    }

    if ($modified) {
        Set-Content -Path $filePath -Value $fixedContent -Encoding UTF8
        Write-Host "✅ Updated $filePath" -ForegroundColor Green
    } else {
        Write-Host "⚠️ No changes needed in $filePath" -ForegroundColor Yellow
    }
}
