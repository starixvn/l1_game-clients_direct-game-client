import React from "react";
import Lobby from "./components/lobby";
import { initLanguage } from "./i18n";

initLanguage();
const App: React.FC = () => {
    return <Lobby />;
};

export default App;
