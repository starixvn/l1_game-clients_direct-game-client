import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/main.scss";
import "./styles/errors.scss";
import "./styles/um.scss";

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
root.render(<App />);
