import React from "react";
import dayjs from "dayjs";
import { appSettings } from "../../game-setting";

const UM = () => {
    type UMInfo = {
        start: Date;
        end: Date;
        finish: boolean;
        operatorId: string;
    };

    const umInfoDummy: UMInfo = {
        start: new Date(),
        end: new Date(),
        finish: false,
        operatorId: appSettings.defaultOperatorId,
    };

    const convertToGMT8 = (date: Date): string => {
        return dayjs(
            new Date(date).toLocaleString("en-US", {
                timeZone: "Asia/Manila",
            })
        ).format("HH:mm DD/MM/YYYY");
    };

    return (
        <div className="um">
            <div>
                <div>
                    <img className="logo" src="/images/um/logo.png" alt="Image" decoding="async" />
                </div>
                {/* <img className="image" src={`/images/um/icon-um_${i18n.language}.png`} alt="Image" /> */}
                <img className="image" src={`/images/um/maintence-icon.png`} alt="Image" />

                <div className="title">MAINTENANCE TIME</div>
                <div>{`(GMT + 8)`}</div>
                <div className="time">
                    {umInfoDummy?.start && (
                        <div>
                            From <span>{convertToGMT8(umInfoDummy.start)}</span>
                        </div>
                    )}
                    {umInfoDummy?.end && (
                        <div>
                            To <span>{convertToGMT8(umInfoDummy.end)}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UM;
