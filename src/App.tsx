import { useState } from "react";
import reactLogo from "./assets/react.svg";
import "./App.css";
import useQuery from "@jkominovic/use-query";

export interface Root {
  dos: Dos;
  test: Test;
}

export interface Dos {
  title: string;
  date: string;
  image: string;
  description: string;
  topic: string;
  toc: boolean;
  tags: string[];
  postTags: string[];
  fg: string;
  bg: string;
  accent: string;
}

export interface Test {
  title: string;
  date: string;
  image: string;
  description: string;
  topic: string;
  toc: boolean;
  tags: string[];
  postTags: string[];
  fg: string;
  bg: string;
  accent: string;
}

function App() {
  const [counter, setCounter] = useState(0);
  const { response, refetch, abort, error } = useQuery<Root>(
    "http://localhost:4000/posts"
  );
  const { response: res, refetch: ref } = useQuery<Root>(
    "http://localhost:4000/posts/" + counter
  );
  console.log("RERENDER");
  return (
    <div className="App">
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src="/vite.svg" className="logo" alt="Vite logo" />
        </a>
        <a href="https://reactjs.org" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <h2>counter: {counter}</h2>
      <button onClick={() => setCounter((prev) => prev + 1)}>Counter ++</button>
      <div className="card">
        <button onClick={() => refetch(false)}>Fetch!</button>
        <button onClick={abort}>ABORT!</button>
        <h4
          style={{
            color: "red",
          }}
        >
          {JSON.stringify(error, null, 2)}
        </h4>
        <pre
          style={{
            textAlign: "left",
          }}
        >
          {JSON.stringify(response?.data, null, 2)}
        </pre>
      </div>
    </div>
  );
}

export default App;
