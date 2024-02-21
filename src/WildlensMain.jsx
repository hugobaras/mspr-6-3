// WildlensMain.jsx
import React, { useState, useRef } from "react";
import { Route, useNavigate, BrowserRouter as Router } from "react-router-dom";
import $ from "jquery";

const WildlensMain = () => {
  const navigate = useNavigate();
  const [model, setModel] = useState("animal-print");
  const [version, setVersion] = useState("1");
  const [apiKey, setApiKey] = useState("Q7a2kRHpLqtIAIRWoFIq");
  const [activeMethod, setActiveMethod] = useState("upload");
  const [fileName, setFileName] = useState("");
  const [filePreview, setFilePreview] = useState("");
  const [outputMessage, setOutputMessage] = useState("");
  const [outputResult, setOutputResult] = useState("");
  const fileInputRef = useRef(null);

  const handleFormSubmit = (event) => {
    event.preventDefault();
    infer();
  };

  const handleMethodButtonClick = (value) => {
    setActiveMethod(value);

    if (value === "upload") {
      fileInputRef.current.click();
    }
  };

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

  const infer = () => {
    setOutputMessage("Analyse de l'image ...");

    getSettingsFromForm((settings) => {
      $.ajax(settings)
        .then((response) => {
          const { top: topClass, confidence } = response;

          const resultString = `Le résultat est un : ${topClass}\nAvec un taux de confiance de : ${confidence * 100}%`;

          console.log(resultString);

          setOutputMessage(resultString);
          setOutputResult("Résultat");
          navigate("/ResultPage");
        })
        .fail((xhr) => {
          const errorMessage =
            xhr.responseJSON && xhr.responseJSON.error
              ? xhr.responseJSON.error
              : "Error loading response. Check your API key, model, version, and other parameters, then try again.";

          setOutputMessage(errorMessage);
        });
    });
  };

  const getSettingsFromForm = (cb) => {
    const settings = {
      method: "POST",
    };

    const parts = [
      "https://classify.roboflow.com/",
      model,
      "/",
      version,
      `?api_key=${apiKey}`,
    ];

    const method = activeMethod === "upload" ? "upload" : "url";

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
    <Router>
     <form onSubmit={handleFormSubmit}>
        <div className="header">
          {/* Assurez-vous que le chemin de l'image est correct */}
          <img className="header__logo" src="../public/logo_recadré.png" alt="Roboflow Inference" />
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
              {filePreview && (
                <div className="image-preview">
                  <img src={filePreview} alt="Image Preview" />
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
            <button type="submit" className="bttn__primary" disabled={!fileName}>
              Analyser l'image
            </button>
          </div>
        </div>
      </form>
    </Router>
  );
};

export default WildlensMain;
