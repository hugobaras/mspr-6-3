import React, { useState, useRef } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import "./App.css";

import $ from "jquery";

const WildlensMain = () => {
  const [model, setModel] = useState("animal-print");
  const [version, setVersion] = useState("1");
  const [apiKey, setApiKey] = useState("Q7a2kRHpLqtIAIRWoFIq");
  const [activeMethod, setActiveMethod] = useState("upload");
  const [fileName, setFileName] = useState("");
  const [filePreview, setFilePreview] = useState("");
  const [outputAnimal, setOutputAnimal] = useState("");
  const [outputConfidence, setOutputConfidence] = useState("");
  const [outputMessage, setOutputMessage] = useState("");
  const fileInputRef = useRef(null);

  const animalTitle = "";
  const scientificName = "Canis lupus familiaris";
  const description =
    "Alors qu'on estimait autrefois que le Chien constituait une espèce à part entière (Canis canis ou encore Canis familiaris), les recherches génétiques contemporaines ont permis d'établir qu'il n'est que le résultat de la domestication du loup gris commun.";
  const family = "Mammifère";
  const size = `Il existe un grand nombre de ${animalTitle} de races différentes. De ce fait, il est compliqué d'estimer la taille.`;
  const habitat = "Non estimable";
  const region = "Hémisphère nord";
  const funFact =
    "L'empreinte de la truffe d'un chien est aussi unique que l'empreinte digitale chez les humains.";

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
          const topClass = response.top;
          const confidence = response.confidence * 100 + " %";

          setOutputAnimal(topClass);
          setOutputConfidence(confidence);
        })
        .fail((xhr) => {
          setOutputMessage(
            "Error loading response.\n\n" +
              "Check your API key, model, version,\n" +
              "and other parameters,\n" +
              "then try again."
          );
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
      "?api_key=" + apiKey,
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
  const capitalize = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };
  

  return (
    <Router>
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
                <img src="../public/photo.svg" alt="logo_photo"/>
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
                  <img src={filePreview} alt="Image Preview" className="addedPicture"/>
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
        {outputAnimal !== '' && (
  <div className="animal">
    <div className="topInfos">
      <img
        src="https://thumbs.dreamstime.com/z/portrait-vertical-d-un-adorable-chien-de-rep%C3%A9rage-f%C3%A9minin-contre-le-ciel-nuageux-255530668.jpg"
        alt="dog"
      />
      <div className="topInfoTitle">
        <h2 className="title">
          {outputAnimal && capitalize(outputAnimal)}
        </h2>
        <span>{scientificName}</span>
        <p>{description}</p>
      </div>
    </div>
    <div className="topInfosDesc">
      <div className="topInfo">
        <h2 className="family">
          Famille
        </h2>
        <span>{family}</span>
      </div>

      <div className="topInfo">
        <h2 className="size">
          Taille
        </h2>
        <span>{size}</span>
      </div>
      <div className="topInfo">
        <h2 className="habitat">
          Habitat
        </h2>
        <span>{habitat}</span>
      </div>
      <div className="topInfo">
        <h2 className="region">
          Région
        </h2>
        <span>{region}</span>
      </div>
      <div className="topInfo">
        <h2 className="funFact">
          Fun Fact
        </h2>
        <span>{funFact}</span>
      </div>
    </div>
  </div>
)}
      </div>
    </Router>
  );
};

export default WildlensMain;
