const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");


// Expose sur localhost:3001 le serveur
const app = express();
const PORT = process.env.PORT || 3001;


// Cors permet d'intéragir entre les différents domaines ou ports (localhost:5173 peut utiliser le fichier api/espece sur localhost:3001)
app.use(cors());

app.use(express.json());

//Connexion à la BDD
const db = mysql.createConnection({
  host: "172.20.0.2",
  port: "3306",
  user: "wildlens_user",
  password: "iEI8NTMn7vDzTng",
  database: "wildlens",
});

// Retourne en console si connecté ou erreur
db.connect((err) => {
  if (err) {
    console.error("Erreur de connexion à la base de données :", err);
  } else {
    console.log("Connecté à la base de données MySQL");
  }
});

// Appel api. On utilise localhost:3001/ai/espece/chien par exemple
app.get("/api/espece/:speciesName", (req, res) => {
  const speciesName = req.params.speciesName;

// Query qui permet d'executer la requête sql
  db.query(
    // Requête sql qui récupère toutes les infos en l'espece en fonction de son nom. ? puisque c'est une requête préparée
    "SELECT espece_nom, espece_description, espece_habitat, espece_nom_latin, espece_fun_fact, espece_famille, espece_region, espece_taille, pe_url FROM espece LEFT JOIN photo_espece on fk_espece = espece_id WHERE espece_nom = ?",
    // Variable a passer dans la requête préparée (permet de limiter les injections sql)
    [speciesName],
    (err, result) => {

      // Gestion d'erreur
      if (err) {
        console.error("Erreur lors de la requête SQL :", err);
        res.status(500).json({ error: "Erreur serveur" });
      } else {
        if (result.length === 0) {
          res.status(404).json({ error: "Espèce non trouvée" });
        } else {
          res.json(result[0]); 
        }
      }
    }
  );
});

app.listen(PORT, () => {
  console.log(`Serveur Express en cours d'exécution sur le port ${PORT}`);
});
