import React from "react";
import { Tab, Tabs } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { getImageUrl } from "../../_shared/utils/icon-helper";

interface GameTabsProps {
    activeKey: number;
    gameOfferIds: number[];
    onTabSelect: (index: number) => void;
    iframeSrc: string;
    wrapperIframeRef: React.RefObject<HTMLIFrameElement>;
}

export const GameTabs: React.FC<GameTabsProps> = ({ activeKey, gameOfferIds, onTabSelect, iframeSrc, wrapperIframeRef }) => {
    const { t } = useTranslation();

    return (
        <Tabs activeKey={activeKey} onSelect={(k) => k && onTabSelect(+k)}>
            {gameOfferIds.map((gameOfferId, index) => {
                const isActive = activeKey === index;
                return (
                    <Tab
                        eventKey={index}
                        title={
                            <div className={`tab-title ${isActive ? "active" : ""}`}>
                                <img src={getImageUrl(gameOfferId, isActive)} alt={t(`gameNames.${gameOfferId}`)} className="tab-icon" />
                                {t(`gameNames.${gameOfferId}`)}
                            </div>
                        }
                        key={gameOfferId}
                        unmountOnExit={true}
                    >
                        <iframe ref={wrapperIframeRef} title={`Game ${gameOfferId}`} width="100%" height="100%" src={iframeSrc} />
                    </Tab>
                );
            })}
        </Tabs>
    );
};
