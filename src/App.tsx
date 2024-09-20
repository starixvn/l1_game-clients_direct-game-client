import { Container } from "react-bootstrap";
import React from "react";
import Lobby from "./components/lobby";

import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import translationEN from "./i18n/en.json";
import translationVI from "./i18n/vi.json";
import translationID from "./i18n/id.json";
import translationTH from "./i18n/th.json";
import translationZHCN from "./i18n/zh_cn.json";
import translationZHTW from "./i18n/zh_tw.json";

const resources = {
    en: { translation: translationEN },
    vi: { translation: translationVI },
    id: { translation: translationID },
    th: { translation: translationTH },
    zh_cn: { translation: translationZHCN },
    zh_tw: { translation: translationZHTW },
};

i18next.use(initReactI18next).init({
    lng: "vi", // if you're using a language detector, do not define the lng option
    debug: true,
    resources,
});

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
