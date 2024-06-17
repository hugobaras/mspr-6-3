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
  const [model] = useState("animal-print");
  const [version] = useState("3");
  const [apiKey] = useState("Q7a2kRHpLqtIAIRWoFIq");
  const [fileName, setFileName] = useState("");
  const [filePreview, setFilePreview] = useState("");
  const [outputAnimal, setOutputAnimal] = useState("");
  const [outputMessage, setOutputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  /**
   * Fonction appelée lors de la soumission du formulaire
   * @param {object} event - L'événement de soumission du formulaire
   */
  const handleFormSubmit = (event) => {
    event.preventDefault(); // Empêche le comportement par défaut du formulaire
    setIsLoading(true); // Active le chargement
    infer(); // Lance le processus d'analyse
  };

  /**
   * Fonction appelée lors du changement de fichier sélectionné
   * @param {object} e - L'événement de changement de fichier
   */
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFile(file);

    if (file) {
      const path = e.target.value.replace(/\\/g, "/");
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

  /**
   * Fonction pour l'analyse de l'image
   */
  const infer = () => {
    setOutputMessage("Analyse de l'image ...");
    getSettingsFromForm((settings) => {
      console.log(settings.data);
      $.ajax({
        url: "http://localhost:3001/api/upload",
        type: "POST",
        data: settings.data,
        dataType: "json",
        success: function (data) {
          console.log("File uploaded successfully:", data);
        },
        error: function (error) {
          console.error("Error uploading the file:", error);
        },
      });
      $.ajax(settings)
        .then((response) => {
          const topClass = response.top;
          setOutputAnimal(topClass);
          navigate(`/infos/${topClass}`);
        })
        .fail(() => {
          Swal.fire({
            title: "Error!",
            text: "Une erreur est survenue",
            icon: "error",
            confirmButtonText: "Ok",
          });
          setOutputMessage("Erreur lors du chargement de la réponse...");
        })
        .always(() => {
          setIsLoading(false);
        });

      // const formData = new FormData();

      // fetch("http://localhost:3001/api/upload", {
      //   method: "POST",
      //   body: settings.data,
      // })
      //   .then((response) => {
      //     console.log(response);
      //     return response.json();
      //   })
      //   .then((data) => {
      //     console.log("File uploaded successfully:", data);
      //   })
      //   .catch((error) => {
      //     console.error("Error uploading the file:", error);
      //   });
    });
  };

  /**
   * Fonction pour obtenir les paramètres de la requête
   * @param {function} cb - Callback à exécuter avec les paramètres
   */
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

  /**
   * Fonction pour obtenir les données base64 du fichier
   * @param {File} file - L'image déposée à transformer en base64
   * @returns {Promise} - Promesse résolue avec l'image en base64
   */
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

  /**
   * Fonction pour redimensionner l'image
   * @param {string} base64Str - L'image déposée transformée en base64
   * @returns {Promise} - Promesse résolue avec l'image redimensionnée en base64
   */
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
            src="https://cdn.discordapp.com/attachments/1084902852666855467/1242119425486884908/logo_recadre.png?ex=6670ee9c&is=666f9d1c&hm=7d199760d32315f06fbf7b9684e9bc2345d86696321a605c313df6f336e7a3c7&"
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
