import { useState } from "react";
import "./App.css";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <button className="btn-green">test</button>
      <hr />
      <button className="btn-black">test</button>
      <h1>Vite /\5 React</h1>
    </>
  );
}

export default App;
