import styled from "styled-components";

export const LobbyContainer = styled.div<{ $tabHeight: number; $hideTab: boolean }>`
    height: 100%;
    position: relative;
    overflow: hidden;

    .menu-container {
        display: flex;
        align-items: center;
        width: 100%;
        background: #14262A;
        position: relative;
        z-index: 2;

        &:after {
            content: "";
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
        }
    }

    .menu-container-landscape {
        height: 46px;

        &:after {
            height: 3px;
            background: repeating-linear-gradient(
                to right,
                #003399 0 70px,
                #FFD700 70px 140px,
                #FF0000 140px 210px,
                #FFFFFF 210px 280px,
                #009966 280px 350px
            );
        }

        .tab-title {
           font-size: 27px;
        }
    }

    .menu-container-portrait {
        height: 36px;

        &:after {
            height: 2px;
            background: repeating-linear-gradient(
                to right,
                #003399 0 40px,
                #FFD700 40px 80px,
                #FF0000 80px 120px,
                #FFFFFF 120px 160px,
                #009966 160px 200px
            );
        }
        .tab-title {
            font-size: 14px;

            &.active{
                &::after {
                    bottom: -7px;
                }
            }
        }
    }

    .game-controls {
        padding: 0 15px;
        height: 100%;
        padding-bottom: 5px;
    }

    .nav-tabs {
        display: flex;
        flex-wrap: nowrap;
        white-space: nowrap;
        align-items: stretch;
        overflow-x: auto;
        border: none;
        position: relative;
        z-index: 2;
        height: 100%;
        padding: 0 !important;

        &::-webkit-scrollbar {
            display: none;
        }

        button {
            border: none;
            margin: 0;
        }

        .nav-link {
            padding: 5px 10px 3px 10px;
        }

        .nav-link.active {
            background-color: transparent;
        }

        .nav-item {
            height: 100%;
            display: flex;
             align-items: center;
             position: relative;

            &:not(:first-child)::before {
                content: "";
                position: absolute;
                left: 0;
                top: 0;
                bottom: 3px;
                width: 2px;
                background: linear-gradient(to bottom,
                    #2D342C,
                    #6E674B,
                    #2D342C
                );
            }
        }

        &.menu-tab-mobile{
            padding-right : 40px;
            scroll-snap-type: x mandatory;
            scroll-behavior: smooth;
            scrollbar-width: none;
            overflow-x: scroll;
            .nav-item{
                scroll-snap-align: start;
            }
        }
    }

    .tab-content,
    .tab-pane {
        height: 100%;
    }

    .tab-title {
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        color: #606748;
        text-transform: uppercase;
        line-height: 1.2;
        font-family: 'Noto Serif', serif;
        font-weight: 600;
    }

    .tab-title.active {
        color: #FEF39E;

        &::after {
            content: "";
            position: absolute;
            bottom: -3px;
            left: 50%;
            transform: translateX(-50%);
            width: 0;
            height: 0;
            border-left: 6px solid transparent;
            border-right: 6px solid transparent;
            border-bottom: 6px solid #FEF39E;
        }
    }

    .tab-icon {
        width: 23px;
        height: 23px;
        margin-right: 8px;
    }

    .skeleton{
        display: flex;
        align-items: center;
        gap: 8px;

        &-img{
            width : 24px;
            height : 24px;
            border-radius : 20px;
            background : #ddd;
        }

        &-text{
            width : 68px;
            height : 8px;
            background : #ddd;
        }
    }

    .mobile-game-list {
        position: absolute;
        top: 34px;
        left: 0;
        width: 100%;
        border-top: 1px solid #CACACA;
        background: #FFF;
        box-shadow: 0px 2px 6px 0px rgba(0, 0, 0, 0.15) inset;
        padding : 16px 8px;
        z-index: 1;
        margin-bottom : 0;
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        list-style: none;
        gap: 8px;

        li {
            position: relative;
            overflow: hidden;
            padding : 8px 12px 8px 12px;
            border-radius: 10px;
            border: 1px solid #C0C0C0;
            background: #FFF;

           .mask-name{
                display: flex;
                align-items: center;
                justify-content: flex-start;
                gap: 6px;
                white-space: nowrap;
                color: #797979;
                mask-image: linear-gradient(90deg, rgba(0, 0, 0, 1) 80%, rgba(0, 0, 0, 0) 100%);
                .mask-img{
                    width : 23px;
                    height : 23px;
                }
            }

            img{
                margin : 0;
            }

            &.active{
                border: 1px solid #5E85C5;
                .mask-name{
                    color: #5E85C5;
                }
            }
        }
    }

    .btn-collapse-menu{
        position: absolute;
        top: 0;
        right: 0;
        height: 34px;
        width: 40px;
        background: linear-gradient(90deg, #FFF 0%, #FFF 100%);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 2px;
        flex-direction: column;
        z-index: 3;
        mask-image: linear-gradient(-90deg, rgba(0, 0, 0, 1) 80%, rgba(0, 0, 0, 0) 100%);
        span{
            display: block;
            width: 100%;
            height: 4px;
            width: 4px;
            background: #5E85C5;
            border-radius: 100px;
        }
    }
    .overlay-menu{
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        background: rgba(0, 0, 0, 0.5);
        z-index: 0;
        height: 100%;
    }
    .new-tag{
        width: 3.8rem;
        height: 1.9rem;
        position: relative;
        top: -5px;
        &.menu-open{
            position: absolute;
            top: 2px;
            right: 2px
        }
    }
`;
