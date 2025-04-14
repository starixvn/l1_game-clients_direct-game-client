import { useTolgee } from "@tolgee/react";
import { useEffect, useState } from "react";
import { getGameLocalizationUrl, getIconGameTabUrl } from "../utils/url-helper";

export const useGameNames = (gameOfferIds: number[]) => {
    const currentLanguage = useTolgee().getLanguage();
    const [gameNames, setGameNames] = useState<Record<number, string>>({});

    useEffect(() => {
        const fetchGameNames = async () => {
            const names = await Promise.all(gameOfferIds.map((gameId) => getGameName(gameId)));
            const gameNames = names.reduce((result, gameName) => ({ ...result, ...gameName }), {});
            setGameNames(gameNames);
        };
        fetchGameNames();
    }, [gameOfferIds, currentLanguage]);

    const getGameName = async (gameId: number) => {
        const url = getGameLocalizationUrl(gameId);
        try {
            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                return { [gameId]: data.gameNames?.[currentLanguage] || `game-${gameId}` };
            }
        } catch (error) {
            console.error(`Error fetching game name for game ${gameId}:`, error);
        }
        return { [gameId]: `game-${gameId}` };
    };

    return gameNames;
};

export const useGameIcons = (gameOfferIds: number[]) => {
    const [iconUrls, setIconUrls] = useState<Record<number, string>>({});

    useEffect(() => {
        const fetchIconUrls = async () => {
            const urls = await Promise.all(
                gameOfferIds.map(async (gameId) => {
                    const url = await getIconGameTabUrl(gameId);
                    return { [gameId]: url };
                })
            );
            const iconUrls = urls.reduce((result, iconUrl) => ({ ...result, ...iconUrl }), {});
            setIconUrls(iconUrls);
        };
        fetchIconUrls();
    }, [gameOfferIds]);

    return iconUrls;
};
