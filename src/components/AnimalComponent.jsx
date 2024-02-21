import React, { useState, useEffect } from 'react';

const AnimalComponent = () => {
  const [animaux, setAnimaux] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5173/wildlens')
      .then(response => response.json())
      .then(data => {
        setAnimaux(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Erreur lors de la récupération des données:', error);
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <h1>Liste des animaux sauvages</h1>
      {loading ? (
        <p>Chargement en cours...</p>
      ) : (
        <ul>
          {animaux && animaux.length > 0 ? (
            animaux.map(animal => (
              <li key={animal.id}>{animal.name}</li>
            ))
          ) : (
            <p>Aucun animal trouvé.</p>
          )}
        </ul>
      )}
    </div>
  );
};

export default AnimalComponent;
