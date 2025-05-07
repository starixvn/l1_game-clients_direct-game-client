import { useTolgee } from "@tolgee/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getGameLocalizationUrl, getIconGameTabUrl } from "../utils/url-helper";

export const useGameNames = (offerGameIds: number[]) => {
    const currentLanguage = useTolgee().getLanguage();
    const [gameNames, setGameNames] = useState<Record<number, string>>({});

    // Memoize the offerGameIds array to prevent unnecessary effect triggers
    const memoizedGameIds = useMemo(() => [...offerGameIds], [offerGameIds.join(",")]);

    // Memoize the fetch function to prevent recreating it on every render
    const getGameName = useCallback(
        async (gameId: number) => {
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
        },
        [currentLanguage]
    );

    useEffect(() => {
        const fetchGameNames = async () => {
            const names = await Promise.all(memoizedGameIds.map(getGameName));
            const gameNames = names.reduce((result, gameName) => ({ ...result, ...gameName }), {});
            setGameNames(gameNames);
        };
        fetchGameNames();
    }, [memoizedGameIds, getGameName]); // Depend on memoized values

    // Memoize the final result to ensure referential equality
    return useMemo(() => gameNames, [gameNames]);
};

export const useGameIcons = (offerGameIds: number[]) => {
    const [iconUrls, setIconUrls] = useState<Record<number, string>>({});

    // Memoize the offerGameIds array to prevent unnecessary effect triggers
    const memoizedGameIds = useMemo(() => [...offerGameIds], [offerGameIds.join(",")]);

    // Memoize the fetch function to prevent recreating it on every render
    const getIconUrl = useCallback(async (gameId: number) => {
        const url = await getIconGameTabUrl(gameId);
        return { [gameId]: url };
    }, []);

    useEffect(() => {
        const fetchIconUrls = async () => {
            const urls = await Promise.all(memoizedGameIds.map(getIconUrl));
            const iconUrls = urls.reduce((result, iconUrl) => ({ ...result, ...iconUrl }), {});
            setIconUrls(iconUrls);
        };
        fetchIconUrls();
    }, [memoizedGameIds, getIconUrl]); // Depend on memoized values

    // Memoize the final result to ensure referential equality
    return useMemo(() => iconUrls, [iconUrls]);
};
