# EtuBibliothèque

Application de gestion des étudiants abonnés à une bibliothèque.

- `back/` : API Spring Boot 3 (Java 21, MySQL, JWT)
- `front/` : application Angular 19

## Fonctionnalités

- Inscription et connexion d'un agent de la bibliothèque (token JWT)
- CRUD des étudiants : ajout, liste, détail, modification, suppression
- APIs `/api/students/**` et écrans des étudiants accessibles uniquement une fois connecté

## Lancer l'application

Pré-requis : JDK 21, Docker Desktop démarré, Node.js 20+.

Dans PowerShell, depuis la racine du projet :

```powershell
.\install.ps1   # une seule fois : dépendances du back et du front
.\start.ps1     # démarre les deux serveurs, Ctrl+C les arrête
```

Manuellement :

```bash
# Back-end (démarre aussi MySQL via Docker Compose) -> http://localhost:8080
cd back
mvnw spring-boot:run

# Front-end -> http://localhost:4200
cd front
npm install
npm start
```

Créer un compte sur http://localhost:4200/register, puis se connecter sur `/login`.

## Tests et couverture

| Partie | Commande | Rapport de couverture |
|---|---|---|
| Back-end (JUnit, Mockito, Testcontainers) | `cd back && mvnw clean verify` | `back/target/site/jacoco/index.html` |
| Front-end (Jest) | `cd front && npm test` | `front/coverage/jest/index.html` |
| E2E (Cypress) | `cd front && npm run start:e2e` puis, dans un 2e terminal, `npm run cy:run` | `front/coverage/e2e/index.html` |

Les tests d'intégration du back-end utilisent une base MySQL jetable dans Docker :
Docker Desktop doit être démarré. Le seuil minimum de couverture (80 %) est vérifié
automatiquement par JaCoCo (back), Jest et nyc (E2E).

Résultats obtenus : back-end 92 % des lignes, front-end 89 %, E2E 87 %.
