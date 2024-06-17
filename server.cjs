const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());

app.use(express.json());

const db = mysql.createConnection({
  host: "127.0.0.1",
  port: "3306",
  user: "wildlens_user",
  password: "iEI8NTMn7vDzTng",
  database: "wildlens",
});

db.connect((err) => {
  if (err) {
    console.error("Erreur de connexion à la base de données :", err);
  } else {
    console.log("Connecté à la base de données MySQL");
  }
});

app.get("/api/espece/:speciesName", (req, res) => {
  const speciesName = req.params.speciesName;

  db.query(
    "SELECT espece_nom, espece_description, espece_habitat, espece_nom_latin, espece_fun_fact, espece_famille, espece_region, espece_taille, pe_url FROM espece LEFT JOIN photo_espece on fk_espece = espece_id WHERE espece_nom = ?",
    [speciesName],
    (err, result) => {
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

app.use(express.urlencoded({ extended: true }));

app.post("/api/upload", (req, res) => {
  const imgData = Object.keys(req.body)[0];

  if (!imgData) {
    res.status(400).json({ error: "img_data is required" });
    return;
  }

  const imgBuffer = Buffer.from(imgData, "base64");

  const filename = `image-${Date.now()}.png`;

  console.log(__dirname);
  const filepath = path.join(__dirname, "uploads", filename);

  fs.writeFile(filepath, imgBuffer, (err) => {
    if (err) {
      console.error("Erreur lors de l'écriture du fichier :", err);
      res.status(500).json({ error: "Erreur serveur" });
    } else {
      res
        .status(200)
        .json({ message: "Image enregistrée avec succès", filename });
    }
  });
});
app.listen(PORT, () => {
  console.log(`Serveur Express en cours d'exécution sur le port ${PORT}`);
});
