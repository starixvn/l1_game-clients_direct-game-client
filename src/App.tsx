import React from "react";
import Logo from "./assets/logo.png";
import ExampleComponent from "./components/ExampleComponent";

const App: React.FC = () => {
    return (
        <div>
            <h1>Lobby ReactJS</h1>
            <img src={Logo} alt="App Logo" />
            <ExampleComponent />
        </div>
    );
};

export default App;
