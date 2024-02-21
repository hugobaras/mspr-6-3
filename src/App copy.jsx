import { Fragment } from "react";
const title = "bonjour";
const showTitle = true;
const todos = ["Présenter react", "Présenter le JSX", "Créer des composants"];

function App() {
  const handleClick = (e) => {
    alert("J'ai cliqué");
  };
  return (
    <>
      <Title color="lightgreen" id="monid" className="demo" data-demo="demo">Mon composant</Title>
      <input type="text" />
      <p>Test</p>
      <ul>
        {todos.map((todo) => (
          <li key={todo}>{todo}</li>
        ))}
      </ul>
    </>
  );
}

function Title({ color, ...props }) {
  
  return <h1 style={{ color: color }} {...props}/>;
}

export default App;
