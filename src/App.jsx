import $ from "jquery";
import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

/**
 * Le composant WildlensMain gère la sélection du fichier image, l'aperçu
 * et l'envoi de l'image pour inférence afin d'identifier l'animal dans l'image.
 *
 * @summary WildlensMain
 */
const WildlensMain = () => {
  // Définition des états locaux
  const [model] = useState("animal-print");
  const [version] = useState("3");
  const [apiKey] = useState("Q7a2kRHpLqtIAIRWoFIq");
  const [fileName, setFileName] = useState("");
  const [filePreview, setFilePreview] = useState("");
  const [outputAnimal, setOutputAnimal] = useState("");
  const [outputMessage, setOutputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null); // Référence pour l'élément de sélection de fichier
  const navigate = useNavigate(); // Fonction de navigation fournie par React Router

  /**
   *  Fonction appelée lors de la soumission du formulaire
   * @name handleFormSubmit
   * @function
   * @param {string} event Le formulaire (et toutes les infos)
   **/

  const handleFormSubmit = (event) => {
    event.preventDefault(); // Empêche le comportement par défaut du formulaire
    setIsLoading(true); // Active le chargement
    infer(); // Lance le processus d'analyse
  };

  /**
   * Fonction appelée lors du changement de fichier sélectionné
   *  @name handleFileChange
   *  @function
   *
   *  **/
  const handleFileChange = () => {
    const file = fileInputRef.current.files && fileInputRef.current.files[0];
    if (file) {
      const path = fileInputRef.current.value.replace(/\\/g, "/");
      const parts = path.split("/");
      const filename = parts.pop();
      setFileName(filename);

      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  /** Fonction pour l'analyse de l'image
   *  @name infer
   *  @function
   * **/
  const infer = () => {
    setOutputMessage("Analyse de l'image ...");
    getSettingsFromForm((settings) => {
      $.ajax(settings)
        .then((response) => {
          const topClass = response.top;
          setOutputAnimal(topClass);
          navigate(`/infos/${topClass}`);
        })
        .fail(() => {
          setOutputMessage("Erreur lors du chargement de la réponse...");
        })
        .always(() => {
          setIsLoading(false);
        });
    });
  };

  /** Fonction pour obtenir les paramètres de la requête
   *  @name getSettingsFromForm
   * @function
   * **/
  const getSettingsFromForm = (cb) => {
    const settings = {
      method: "POST",
    };

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
        setIsLoading(false);
        return;
      }

      getBase64fromFile(file).then((base64image) => {
        settings.url = parts.join("");
        settings.data = base64image;
        cb(settings);
      });
    }
  };

  /** Fonction pour obtenir les données base64 du fichier
   *  @name getBase64fromFile
   * @function
   * @param {file} file L'image déposée à transformer en base64
   * **/
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

  /** Fonction pour redimensionner l'image
   *  @name resizeImage
   *  @function
   *  @param {string} base64Str L'image déposée transformée en base64
   * **/
  const resizeImage = (base64Str) => {
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

  return (
    <div>
      <form onSubmit={handleFormSubmit}>
        <div className="header">
          <img
            className="header__logo"
            src="https://cdn.discordapp.com/attachments/1084902852666855467/1242119425486884908/logo_recadre.png?ex=664cad5c&is=664b5bdc&hm=bb8774ff11a98724415622eb1c60b461298f9c8c72a593684f302ea518e04aa8&"
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
                label="Analyser l'image"
              >
                <img src="photo.svg" alt="logo_photo" />
              </button>
              <input
                style={{ display: "none" }}
                type="file"
                id="file"
                ref={fileInputRef}
                onChange={handleFileChange}
              />

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
      {isLoading && <div className="loader"></div>}
    </div>
  );
};

export default WildlensMain;
