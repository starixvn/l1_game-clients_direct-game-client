import React from "react";
import Lobby from "./components/lobby";
import { initLanguage } from "./_shared/i18n";
import { Themes } from "./_shared/consts";
import UM from "./components/common/um";
import { TolgeeProvider } from "@tolgee/react";
import { tolgee } from "../tolgee/tolgee";

initLanguage();
const App: React.FC = () => {
    const isUM = false;
    const theme = Themes.light;
    return (
        <TolgeeProvider tolgee={tolgee}>
            {isUM ? <UM /> : <Lobby theme={theme} />}
        </TolgeeProvider>
    );
};

export default App;
