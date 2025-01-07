import React from "react";
import Lobby from "./components/lobby";
import { initLanguage } from "./i18n";
import { Themes } from "./components/consts";

initLanguage();
const App: React.FC = () => {
    const theme = Themes.light;
    return <Lobby theme={theme} />;
};

export default App;
