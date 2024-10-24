import { Container } from "react-bootstrap";
import React from "react";
import Lobby from "./components/lobby";
import { initLanguage } from "./i18n";

initLanguage();
const App: React.FC = () => {
    return (
        <div>
            <Container>
                <Lobby />
            </Container>
        </div>
    );
};

export default App;
