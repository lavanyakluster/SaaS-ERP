
param([string]$dbName, [string]$query)
$connectionString = "Server=130.94.45.215,1433;Database=$dbName;User ID=DevUser;Password=KTS@Dev@2026;TrustServerCertificate=true;"
$connection = New-Object System.Data.SqlClient.SqlConnection($connectionString)
try {
    $connection.Open()
    $command = $connection.CreateCommand()
    $command.CommandText = $query
    $rowCount = $command.ExecuteNonQuery()
    Write-Output "Successfully executed query. Rows affected: $rowCount"
} catch {
    Write-Error $_.Exception.Message
} finally {
    if ($connection.State -eq "Open") {
        $connection.Close()
    }
}
