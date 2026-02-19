
param([string]$dbName)
$connectionString = "Server=130.94.45.215,1433;Database=$dbName;User ID=DevUser;Password=KTS@Dev@2026;TrustServerCertificate=true;"
$connection = New-Object System.Data.SqlClient.SqlConnection($connectionString)
try {
    $connection.Open()
    $command = $connection.CreateCommand()
    $command.CommandText = "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE'"
    $reader = $command.ExecuteReader()
    Write-Output "--- Tables in $dbName ---"
    while($reader.Read()) {
        Write-Output $reader["TABLE_NAME"]
    }
} catch {
    Write-Error $_.Exception.Message
} finally {
    if ($connection.State -eq "Open") {
        $connection.Close()
    }
}
