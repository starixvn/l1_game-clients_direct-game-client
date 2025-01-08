import React, { useEffect } from "react";
import Lobby from "./components/lobby";
import { initLanguage } from "./_shared/i18n";
import UM from "./components/common/um";
import { TolgeeProvider } from "@tolgee/react";
import { tolgee } from "../tolgee/tolgee";
import { GameEventManager } from "./_shared/utils/game-event-manager";

initLanguage();
const App: React.FC = () => {
    const isUM = false;
    useEffect(() => {
        GameEventManager.getInstance();

        return () => {
            GameEventManager.destroy();
        };
    }, []);
    return <TolgeeProvider tolgee={tolgee}>{isUM ? <UM /> : <Lobby />}</TolgeeProvider>;
};

export default App;
