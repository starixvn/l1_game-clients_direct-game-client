import { useTolgee } from "@tolgee/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import FunctionUtil from "../utils/function-util";
import { getGameLocalizationUrl, getIconGameTabUrl } from "../utils/url-helper";

export const useGameNames = (offerGameIds: number[]) => {
    const currentLanguage = useTolgee().getLanguage();
     
    const gameV3Ids = offerGameIds.filter((gameId) => !FunctionUtil.isGameV2(gameId));
    const gameV2Ids = offerGameIds.filter((gameId) => FunctionUtil.isGameV2(gameId));
    const [gameNames, setGameNames] = useState<Record<number, string>>({});

    // Memoize the offerGameIds array to prevent unnecessary effect triggers
    const memoizedGameIds = useMemo(() => [...offerGameIds], [offerGameIds.join(",")]);

    // Memoize the fetch function to prevent recreating it on every render
    const getGameNameV3 = useCallback(
        async (gameId: number) => {
            const url = await getGameLocalizationUrl(gameId);
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

    const getGameNameV2 = useCallback(
        async (gameIds: number[]) => {
            // Use first gameId to get localization URL since content will be same for all V2 games
            const url = await getGameLocalizationUrl(1); 
            try {
                const response = await fetch(url);
                if (response.ok) {
                    const data = await response.json();
                    // Map all gameIds to their names from the single response
                    return gameIds.reduce((acc, gameId) => ({
                        ...acc,
                        [gameId]: data.gameNames?.[gameId]?.[currentLanguage] || `game-${gameId}`
                    }), {});
                }
            } catch (error) {
                console.error(`Error fetching game names for games ${gameIds}:`, error);
            }
            // Return default names if fetch fails
            return gameIds.reduce((acc, gameId) => ({
                ...acc,
                [gameId]: `game-${gameId}`
            }), {});
        },
        [currentLanguage]
    );

    useEffect(() => {
        const fetchGameNames = async () => {
            const gameV3Names = await Promise.all(gameV3Ids.map(getGameNameV3));
            const gameV2Names = await getGameNameV2(gameV2Ids);
            const names = [];
            gameV3Names.forEach(game => names.push(game));
            Object.entries(gameV2Names).forEach(([_, game]) => names.push({ [_]: game }));
            const gameNames = names.reduce((result, gameName) => ({ ...result, ...gameName }), {});
            setGameNames(gameNames);
        };
        fetchGameNames();
    }, [memoizedGameIds, getGameNameV3, getGameNameV2]); // Depend on memoized values

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
