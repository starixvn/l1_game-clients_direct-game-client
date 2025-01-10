import React from "react";
import { useTranslator } from "../../../_shared/react-hooks";
import { ResourceTypes } from "../../../_shared/consts";
import "./styles.scss";

const NonOffer = () => {
    const { t } = useTranslator([ResourceTypes.COMMON]);
    return (
        <div className="error-page">
            <img alt="NoGamesOffer" className="error-background" src="/images/error-session.svg" />
            <p className="no-games-offer-title">{t("message_no_game_offer")}</p>
        </div>
    );
};

export default NonOffer;
