import React, { useState, useRef } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import "./App.css";

// Utilisation de jquery pour les requetes ajax 
import $ from "jquery";

const WildlensMain = () => {
  // Déclaration des variables pour utiliser l'api roboflow
  const [model, setModel] = useState("animal-print");
  const [version, setVersion] = useState("3");
  const [apiKey, setApiKey] = useState("Q7a2kRHpLqtIAIRWoFIq");
  const [activeMethod, setActiveMethod] = useState("upload");

  // Déclaration des variables
  const [fileName, setFileName] = useState("");
  const [filePreview, setFilePreview] = useState("");
  const [outputAnimal, setOutputAnimal] = useState("");
  const [speciesInfo, setSpeciesInfo] = useState("");

  const [outputMessage, setOutputMessage] = useState("");
  const fileInputRef = useRef(null);

  // Informations relatives à l'espèce
  const animalTitle = "";
  const scientificName = "";
  const description = "";
  const family = "";
  const size = "";
  const habitat = "";
  const region = "";
  const funFact = "";

  // Fonction appelée quand on soumet le formulaire
  const handleFormSubmit = (event) => {
    event.preventDefault();
    infer();
  };

  // Fonction appelée quand on change le fichier sélectionné
  const handleFileChange = () => {
    const file = fileInputRef.current.files && fileInputRef.current.files[0];

    if (file) {
      // Récupération des info du fichier déposé 

      // Son chemin temporaire
      const path = fileInputRef.current.value.replace(/\\/g, "/");
      const parts = path.split("/");

      // Son nom
      const filename = parts.pop();

      setFileName(filename);

      // On affiche l'image déposée
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Fonction qui permet de faire les appels api et afficher les infos
  const infer = () => {
    // On affiche un message en attendant
    setOutputMessage("Analyse de l'image ...");

    // On appelle la fonction pour récupérer les paramètres du formulaire et on envoi de la requête pour l'analyse de l'image
    getSettingsFromForm((settings) => {
      $.ajax(settings)
        .then((response) => {
          // On récupère la classe renvoyée par l'api : par exemple Chat
          const topClass = response.top;

          // On set le nom de l'animal dans l'affichage
          setOutputAnimal(topClass);

          // On execute la fonction fetch pour récupérer les infos en bdd
          fetchSpeciesInfo(topClass);
        })
        .fail(() => {
          setOutputMessage("Erreur lors du chargement de la réponse...");
        });
    });
  };


  // Appel vers le serveur pour récupérer les infos de l'espèce en BDD
  const fetchSpeciesInfo = async (speciesName) => {
    try {

      // Exemple : http://127.0.0.1:3001/api/espece/Chat ou http://localhost/api/espece/Chat
      const response = await fetch(
        `http://127.0.0.1:3001/api/espece/${speciesName}`
      );

      // On récupère les infos renvoyés par l'api
      const data = await response.json();

      // On set les infos de l'espece dans l'affichage
      setSpeciesInfo(data);
    } catch (error) {
      // Gestion d'erreur
      console.error(
        "Erreur lors de la récupération des informations sur l'espèce :",
        error
      );
    }
  };

  //Fonction pour récuperer les paramètre du formulaire
  const getSettingsFromForm = (cb) => {

    // On passe dans le tableau settings les informations passées en post dans le formulaire
    const settings = {
      method: "POST",
    };

    // Création de l'url de roboflow avec les variables déclarées au dessus
    const parts = [
      "https://classify.roboflow.com/",
      model,
      "/",
      version,
      "?api_key=" + apiKey,
    ];

    
    const method = "upload";

    if (method === "upload") {
      const file = fileInputRef.current.files && fileInputRef.current.files[0];

      if (!file) {
        return;
      }

      getBase64fromFile(file).then((base64image) => {
        settings.url = parts.join("");
        settings.data = base64image;

        cb(settings);
      });
    }
  };

  // Fonction pour obtenir une représentation base64 d'un fichier
  const getBase64fromFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        resizeImage(reader.result).then((resizedImage) => {
          resolve(resizedImage);
        });
      };
      reader.onerror = (error) => {
        reject(error);
      };
    });
  };
  
  // Fonction pour redimensionner une image en fonction de certaines dimensions maximales
  const resizeImage = (base64Str) => {
    // Redimensionnement de l'image avant l'envoi pour l'analyse
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 1500;
        const MAX_HEIGHT = 1500;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 1.0));
      };
    });
  };

  // Fonction pour mettre en majuscule la première lettre d'une chaîne de caractères
  const capitalize = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  return (
    <Router>

    {/* onSubmit={handleFormSubmit} : on soumet le form sur handleFormSubmit */}
      <form onSubmit={handleFormSubmit}>
        <div className="header">
          <img
            className="header__logo"
            src="../public/logo_recadré.png"
            alt="Roboflow Inference"
          />
        </div>

        <div className="content">
          <div className="col-12-m8" id="fileSelectionContainer">
            <label className="input__label" htmlFor="file">
              Sélectionner un fichier
            </label>
            <div className="flex">
              <button
                type="button"
                onClick={() => fileInputRef.current.click()}
                className="bttn right active"
              >
                <img src="../public/photo.svg" alt="logo_photo" />
              </button>
              <input
                style={{ display: "none" }}
                type="file"
                id="file"
                ref={fileInputRef}
                onChange={handleFileChange}
              />

              {/* Preview de l'image */}
              {filePreview && (
                <div className="image-preview">
                  <img
                    src={filePreview}
                    alt="Image Preview"
                    className="addedPicture"
                  />
                </div>
              )}
              <input
                className="input input--left flex-1 hidden"
                type="text"
                id="fileName"
                value={fileName}
                disabled
              />
            </div>
          </div>
          <div className="col-12">
            <button
              type="submit"
              className="bttn__primary"
              disabled={!fileName}
            >
              Analyser l'image
            </button>
          </div>
        </div>
      </form>

      <div className="result" id="resultContainer">
        <div className="divider"></div>
        {outputAnimal !== "" && (
          <div className="animal">
            <div className="topInfos">
              <img
                src={speciesInfo.pe_url}
                alt="dog"
              />
              <div className="topInfoTitle">
                <h2 className="title">
                  {/* On affiche le nom de l'espece */}
                  {outputAnimal && capitalize(outputAnimal)}
                </h2>

                {/* Affichage des infos */}
                <span>{speciesInfo.espece_nom_latin}</span>
                <p>{speciesInfo.espece_description}</p>
              </div>
            </div>
            <div className="topInfosDesc">
              <div className="topInfo">
                <h2 className="family">Famille</h2>
                <span>
                  {/* Si l'info = "" alors on affichage Inconnu */}
                  {speciesInfo.espece_famille &&
                  speciesInfo.espece_famille.trim() !== ""
                    ? speciesInfo.espece_famille.trim()
                    : "Inconnu"}
                </span>
              </div>

              <div className="topInfo">
                <h2 className="size">Taille</h2>
                <span>
                  {speciesInfo.espece_taille &&
                  speciesInfo.espece_taille.trim() !== ""
                    ? speciesInfo.espece_taille.trim()
                    : `Il existe un grand nombre de ${outputAnimal} de races différentes. De ce fait, il est compliqué d'estimer la taille.`}
                </span>
              </div>
              <div className="topInfo">
                <h2 className="habitat">Habitat</h2>
                <span>
                  {speciesInfo.espece_habitat &&
                  speciesInfo.espece_habitat.trim() !== ""
                    ? speciesInfo.espece_habitat.trim()
                    : `Non estimable`}
                </span>
              </div>

              <div className="topInfo">
                <h2 className="region">Région</h2>
                <span>
                  {speciesInfo.espece_region &&
                  speciesInfo.espece_region.trim() !== ""
                    ? speciesInfo.espece_region.trim()
                    : "Inconnu"}
                </span>
              </div>
              <div className="topInfo">
                <h2 className="funFact">Fun Fact</h2>
                <span>
                  {speciesInfo.espece_fun_fact &&
                  speciesInfo.espece_fun_fact.trim() !== ""
                    ? speciesInfo.espece_fun_fact.trim()
                    : "Inconnu"}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </Router>
  );
};

export default WildlensMain;
