import styled from "styled-components";

export const GameContainer = styled.div<{ $remoteGameBackgroundUrl: string, $gameId: number;}>`
    display: flex;
    justify-content: center;
    align-items: flex-start;
    background-image: url(${(props) => props.$remoteGameBackgroundUrl});
    background-size: cover;
    background-position: center;
    width: 100%;
    height: 100%;
`;
