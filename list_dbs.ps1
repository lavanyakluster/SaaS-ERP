
$connectionString = "Server=130.94.45.215,1433;User ID=DevUser;Password=KTS@Dev@2026;TrustServerCertificate=true;"
$connection = New-Object System.Data.SqlClient.SqlConnection($connectionString)
try {
    $connection.Open()
    $command = $connection.CreateCommand()
    $command.CommandText = "SELECT name FROM sys.databases WHERE name NOT IN ('master', 'tempdb', 'model', 'msdb')"
    $reader = $command.ExecuteReader()
    while($reader.Read()) {
        Write-Output $reader["name"]
    }
} catch {
    Write-Error $_.Exception.Message
} finally {
    if ($connection.State -eq "Open") {
        $connection.Close()
    }
}
