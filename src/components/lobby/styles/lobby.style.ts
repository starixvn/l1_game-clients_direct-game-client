import styled from "styled-components";

export const LobbyContainer = styled.div<{ $tabHeight: number; $hideTab: boolean }>`
    height: ${(props) => (props.$hideTab ? "100%" : `calc(100% - ${props.$tabHeight}px)`)};

    .nav-tabs {
        flex-wrap: nowrap;
        white-space: nowrap;
        font-size: 14px;
        font-weight: bold;
        overflow-x: auto;
        scrollbar-width: none;
        border: none;

        button {
            padding: 5px 8px 6px 8px;
            border: none;
            margin: 0;
        }

        .nav-link.active {
            background-color: transparent;
        }
    }

    .tab-content,
    .tab-pane {
        height: 100%;
    }

    .tab-title {
        display: flex;
        align-items: center;
        color: #737373;
        position: relative;
    }

    .tab-title.active {
        color: #5e85c5;

        &::after {
            content: "";
            position: absolute;
            bottom: -6px;
            left: 50%;
            transform: translateX(-50%);
            width: 110%;
            height: 4px;
            background-color: #5e85c5;
        }
    }

    .tab-icon {
        width: 23px;
        height: 23px;
        margin-right: 8px;

        &.inactive {
            filter: grayscale(100%);
        }
    }
`;
