import styled from "styled-components";

export const GameContainer = styled.div<{ $remoteGameBackgroundUrl: string, $gameId: number; $height: number | string }>`
    display: flex;
    justify-content: center;
    align-items: flex-start;
    background-image: url(${(props) => props.$remoteGameBackgroundUrl});
    background-size: cover;
    background-position: center;
    width: 100%;
    height: ${(props) => props.$height};
`;
