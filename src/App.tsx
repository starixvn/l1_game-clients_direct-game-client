import React, { useEffect } from "react";
import Lobby from "./components/lobby";
import UM from "./components/common/um";
import { TolgeeProvider } from "@tolgee/react";
import { tolgee } from "./tolgee";
import { GameEventManager } from "./_shared/utils/game-event-manager";

const App: React.FC = () => {
    useEffect(() => {
        GameEventManager.getInstance();

        return () => {
            GameEventManager.destroy();
        };
    }, []);
    return (
        <TolgeeProvider tolgee={tolgee}>
            <Lobby />
        </TolgeeProvider>
    );
};

export default App;
