import React from "react";
import "./styles.scss";
import { ResourceTypes } from "../../_shared/consts";
import { useTranslator } from "../../_shared/react-hooks";
import ReturnToURLButton from "../common/return-to-url-button";

const NonOffer = () => {
    const { t } = useTranslator([ResourceTypes.COMMON]);

    return (
        <div className="non-offer-page" data-testid="non-offer-page">
            <img alt="NoGamesOffer" className="non-offer-icon" src="/images/icon-warning.png" />
            <div className="non-offer-title-container" data-testid="non-offer-title-container">
                <div className="non-offer-icon-wrapper" data-testid="non-offer-icon-wrapper"></div>
                <p className="non-offer-title">{t("message_no_game_offer")}</p>
            </div>
            <ReturnToURLButton />
        </div>
    );
};

export default NonOffer;
