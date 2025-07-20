$excludeDirs = @('node_modules', 'build', 'public')

Get-ChildItem -Path . -Include *.js,*.jsx -Recurse | Where-Object {
    $fullPath = $_.FullName.ToLower()
    -not ($excludeDirs | ForEach-Object { $fullPath -like "*\$_\*" })
} | ForEach-Object {
    $filePath = $_.FullName
    $lines = Get-Content -Path $filePath

    # 1. Remove unused error variable, keep setError
    $fixedLines = $lines | ForEach-Object {
        if ($_ -match 'const\s+\[error,\s*setError\]\s*=\s*useState') {
            $_ -replace 'const\s+\[error,\s*setError\]', 'const [, setError]'
        } else {
            $_
        }
    }

    # 2. Add eslint-disable comment before useEffect with empty deps
    $fixedLines = $fixedLines | ForEach-Object -Begin { $buffer = @() } -Process {
        if ($_ -match 'useEffect\(\(\)\s*=>\s*\{.*checkCurrentUser\(\);?.*\},\s*\[\]\);') {
            $buffer += "// eslint-disable-next-line react-hooks/exhaustive-deps"
        }
        $buffer += $_
    } -End { $buffer }

    # 3. Fix anonymous default export of new class instance
    $fixedLines = $fixedLines | ForEach-Object {
        if ($_ -match '^export\s+default\s+new\s+([A-Za-z0-9_]+)\(\);') {
            $className = $matches[1]
            $instanceName = ($className.Substring(0,1).ToLower() + $className.Substring(1) + "Instance")
            "const $instanceName = new $className();"
            "export default $instanceName;"
        } else {
            $_
        }
    }

    # 4. Fix 'mport' typos and remove lone slashes
    $fixedLines = $fixedLines | ForEach-Object {
        if ($_ -match '^\s*mport\s') {
            $_ -replace '^\s*mport', 'import'
        } elseif ($_ -match '^\s*/\s*$') {