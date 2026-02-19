
param([string]$dbName, [string]$query)
$connectionString = "Server=130.94.45.215,1433;Database=$dbName;User ID=DevUser;Password=KTS@Dev@2026;TrustServerCertificate=true;"
$connection = New-Object System.Data.SqlClient.SqlConnection($connectionString)
try {
    $connection.Open()
    $command = $connection.CreateCommand()
    $command.CommandText = $query
    $adapter = New-Object System.Data.SqlClient.SqlDataAdapter($command)
    $dataset = New-Object System.Data.DataSet
    $adapter.Fill($dataset) | Out-Null
    $dataset.Tables[0] | ConvertTo-Json | Out-String -Width 1000000
} catch {
    Write-Error $_.Exception.Message
} finally {
    if ($connection.State -eq "Open") {
        $connection.Close()
    }
}
