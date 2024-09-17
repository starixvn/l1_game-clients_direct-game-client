import Container from "@mui/material/Container";
import React from "react";
import ScrollableTabs from "./components/header";

const App: React.FC = () => {
    return (
        <div>
            <Container maxWidth="sm">
                {/* <img src={Logo} alt="App Logo" /> */}
                <ScrollableTabs />
            </Container>
        </div>
    );
};

export default App;
