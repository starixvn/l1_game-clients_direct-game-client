export const getGameUrl = (gameId: number) => {
    const token = "17fe6058-a2be-40d2-a7ec-ad803ad6dcfc";
    const lang = "vi-VN";
    const ref = "f_direct";
    const baseUrl = "https://l1-proxy1.lumigame.com";
    const url = `${baseUrl}/direct-client-${gameId}?token=${token}&lang=${lang}&ref=${ref}`;

    return url;
};
