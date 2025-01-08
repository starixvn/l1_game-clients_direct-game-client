import React from "react";
import Lobby from "./components/lobby";
import { initLanguage } from "./i18n";
import { Themes } from "./components/consts";
import UM from "./components/common/um";

initLanguage();
const App: React.FC = () => {
    const isUM = false;
    const theme = Themes.light;
    return isUM ? <UM /> : <Lobby theme={theme} />;
};

export default App;
