import styled from "styled-components";

export const LobbyContainer = styled.div<{ $tabHeight: number; $hideTab: boolean }>`
    height: ${(props) => (props.$hideTab ? "100%" : `calc(100% - ${props.$tabHeight}px)`)};
    position: relative;
    .nav-tabs {
        scrollbar-width: none;
        flex-wrap: nowrap;
        white-space: nowrap;
        font-size: 14px;
        font-weight: bold;
        overflow-x: auto;
        border: none;
        background: #fff;
        position: relative;
        z-index: 2;
        button {
            padding: 5px 8px 6px 8px;
            border: none;
            margin: 0;
        }

        .nav-link.active {
            background-color: transparent;
        }
        &.menu-tab-mobile {
            padding-right: 40px;
            scroll-snap-type: x mandatory;
            scroll-behavior: smooth;
            scrollbar-width: none;
            overflow-x: scroll;
            .nav-item {
                scroll-snap-align: start;
            }
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
    }

    .skeleton {
        display: flex;
        align-items: center;
        gap: 8px;
        &-img {
            width: 24px;
            height: 24px;
            border-radius: 20px;
            background: #ddd;
        }
        &-text {
            width: 68px;
            height: 8px;
            background: #ddd;
        }
    }

    .mobile-game-list {
        position: absolute;
        top: 34px;
        left: 0;
        width: 100%;
        border-top: 1px solid #cacaca;
        background: #fff;
        box-shadow: 0px 2px 6px 0px rgba(0, 0, 0, 0.15) inset;
        padding: 16px 8px;
        z-index: 1;
        margin-bottom: 0;
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        list-style: none;
        gap: 8px;
        li {
            position: relative;
            overflow: hidden;
            padding: 8px 12px 8px 12px;
            border-radius: 10px;
            border: 1px solid #c0c0c0;
            background: #fff;
            .mask-name {
                display: flex;
                align-items: center;
                justify-content: flex-start;
                gap: 6px;
                white-space: nowrap;
                color: #797979;
                mask-image: linear-gradient(90deg, rgba(0, 0, 0, 1) 80%, rgba(0, 0, 0, 0) 100%);
                .mask-img {
                    width: 23px;
                    height: 23px;
                }
            }
            img {
                margin: 0;
            }
            &.active {
                border: 1px solid #5e85c5;
                .mask-name {
                    color: #5e85c5;
                }
            }
        }
    }

    .btn-collapse-menu {
        position: absolute;
        top: 0;
        right: 0;
        height: 34px;
        width: 40px;
        background: linear-gradient(90deg, #fff 0%, #fff 100%);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 2px;
        flex-direction: column;
        z-index: 3;
        mask-image: linear-gradient(-90deg, rgba(0, 0, 0, 1) 80%, rgba(0, 0, 0, 0) 100%);
        span {
            display: block;
            width: 100%;
            height: 4px;
            width: 4px;
            background: #5e85c5;
            border-radius: 100px;
        }
    }
    .overlay-menu {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        background: rgba(0, 0, 0, 0.5);
        z-index: 0;
        height: 100%;
    }
    .new-tag {
        width: 3.8rem;
        height: 1.9rem;
        position: relative;
        top: -5px;
        &.menu-open {
            position: absolute;
            top: 2px;
            right: 2px;
        }
    }
`;
