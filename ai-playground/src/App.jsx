import React, { useState, useEffect } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { python } from "@codemirror/lang-python";
import "./App.css";
import { oneDark } from "@codemirror/theme-one-dark";

import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

import startCode from "./start.txt";
import endCode from "./end.txt";
import baseCode from "./baseCode.txt"

import BoardViewer from './BoardViewer';


const loadSkulpt = () => {
  return new Promise((resolve, reject) => {
    const script1 = document.createElement("script");
    const script2 = document.createElement("script");

    script1.src = "https://cdn.jsdelivr.net/npm/skulpt@1.2.0/dist/skulpt.min.js";
    script2.src = "https://cdn.jsdelivr.net/npm/skulpt@1.2.0/dist/skulpt-stdlib.min.js";

    script1.onload = () => {
      script2.onload = resolve;
      document.body.appendChild(script2);
    };

    script1.onerror = reject;
    script2.onerror = reject;

    document.body.appendChild(script1);
  });
};

const App = () => {
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [pythonCode, setPythonCode] = useState("print('Hello World!')");
  const [preCode, setPreCode] = useState("")
  const [postCode, setPostCode] = useState("")
  const [tab, setTab] = useState("lossRate")

  useEffect(() => {
    loadSkulpt().catch(() => {
      setError("Failed to load Skulpt");
    });

    fetch(startCode)
        .then(r => r.text())
        .then(text => {
          setPreCode(text)
        });

    fetch(endCode)
    .then(r => r.text())
    .then(text => {
      setPostCode(text)
    });

    fetch(baseCode)
    .then(r => r.text())
    .then(text => {
      setPythonCode(text)
    });
  }, []);

  const runPython = (codeType) => {
    if (window.Sk) {
      const Sk = window.Sk;

      let combinedCode;
      combinedCode = `${preCode}\n${pythonCode}\n${postCode}`

      Sk.configure({
        output: (text) => {
          console.log(text);
          setOutput(JSON.parse(text))
        
        },
        
          read: (x) => {
          if (Sk.builtinFiles === undefined || Sk.builtinFiles["files"][x] === undefined) {
            throw new Error(`File not found: '${x}'`);
          }
          return Sk.builtinFiles["files"][x];
        },
      });

      setOutput(""); 
      Sk.misceval
        .asyncToPromise(() => Sk.importMainWithBody("<stdin>", false, combinedCode, true))
        .catch((err) => setError(err.toString()));
    } else {
      setError("Skulpt is not loaded yet!");
    }
  };


  return (
    <div id="site-container">

      <div id="site-header">
        <div id="header-title">
          <h2>AI Playground</h2>
        </div>
        <div id="header-button-holder">
          <button className="header-button" onClick={() => setTab("versus") || runPython("versus")}>Run</button>
 
        </div>
      </div>
      <div id="site-content">
        <CodeMirror
          className="codeMirror"
          value={pythonCode}
          extensions={[python()]}
          theme={oneDark}
          onChange={(value) => setPythonCode(value)}
        />
        <div className="output-container">
          <div className="board-viewer">
            <BoardViewer data={output} />
          </div>

          <div className="terminal-output">
            {error && <p style={{ color: "red" }}>Error: {error}</p>}
          </div>
          
        </div>
      </div>
     
      
    </div>
  );
};

export default App;
