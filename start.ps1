# Démarre le back-end (http://localhost:8080) et le front-end (http://localhost:4200).
# À lancer depuis la racine du projet, Docker Desktop démarré. Ctrl+C arrête les deux.

$back = Start-Process cmd -ArgumentList '/c', 'mvnw.cmd spring-boot:run' -WorkingDirectory back -PassThru -NoNewWindow

Push-Location front
try { npm start } finally { taskkill /T /F /PID $back.Id 2>$null | Out-Null; Pop-Location }
