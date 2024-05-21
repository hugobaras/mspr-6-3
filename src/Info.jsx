import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

const Infos = () => {
  const { speciesName } = useParams();
  const [speciesInfo, setSpeciesInfo] = useState({});

  useEffect(() => {
    fetchSpeciesInfo(speciesName);
  }, [speciesName]);

  const fetchSpeciesInfo = async (speciesName) => {
    try {
      const response = await fetch(
        `http://localhost:3001/api/espece/${speciesName}`
      );
      const data = await response.json();
      setSpeciesInfo(data);
      console.log(data);
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des informations sur l'espèce :",
        error
      );
    }
  };

  const capitalize = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  return (
    <div>
      <div className="header">
        <img
          className="header__logo"
          src="https://cdn.discordapp.com/attachments/1084902852666855467/1242119425486884908/logo_recadre.png?ex=664cad5c&is=664b5bdc&hm=bb8774ff11a98724415622eb1c60b461298f9c8c72a593684f302ea518e04aa8&"
          alt="Roboflow Inference"
        />
      </div>
      <div className="result" id="resultContainer">
        {speciesName !== "" && (
          <div className="animal">
            <div className="topInfos">
              <img src={speciesInfo.pe_url} alt="dog" />
              <div className="topInfoTitle">
                <h2 className="title">
                  {/* On affiche le nom de l'espece */}
                  {speciesName && capitalize(speciesName)}
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
                    : `Il existe un grand nombre de ${speciesName} de races différentes. De ce fait, il est compliqué d'estimer la taille.`}
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

      <Link to="/" className="link">
        <button type="button" className="bttn__primary">
          Scanner une autre empreinte
        </button>
      </Link>
    </div>
  );
};

export default Infos;