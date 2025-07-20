 Get-ChildItem -Path . -Include *.js,*.jsx -Recurse |
    Where-Object { $_.FullName -notmatch '\\node_modules\\' } |
    ForEach-Object {
        $filePath = $_.FullName
        $content  = Get-Content -Path $filePath -Raw

        # 1) Fix "mport" → "import"
        $content = $content -replace '\bmport\b','import'

        # 2) Remove standalone slash lines (naive approach)
        $content = $content -replace '^\s*/\s*$',''

        Set-Content -Path $filePath -Value $content
    }

Write-Host "✔ Syntax fixes applied outside node_modules. Rerun:
  npx eslint . --fix
  npm run build
"