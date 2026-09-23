# Installe les dépendances du projet. À lancer une fois, depuis la racine.
# Pré-requis : JDK 21, Node.js 20+, Docker Desktop.

Push-Location back; .\mvnw.cmd dependency:go-offline; Pop-Location

Push-Location front; npm install; Pop-Location
