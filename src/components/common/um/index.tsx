import React from "react";
import dayjs from "dayjs";
import "./um.scss";
import { useTranslator } from "../../../_shared/react-hooks/use-translator";
import { ResourceTypes } from "../../../_shared/consts";

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
        operatorId: "ONEworks1",
    };

    const { t } = useTranslator([ResourceTypes.COMMON]);
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
                <img className="image" src={`/images/um/maintence-icon.png`} alt="Image" />

                <div className="title">{t("maintenance_time")}</div>
                <div>{`(GMT + 8)`}</div>
                <div className="time">
                    {umInfoDummy?.start && (
                        <div>
                            {t("from")} <span>{convertToGMT8(umInfoDummy.start)}</span>
                        </div>
                    )}
                    {umInfoDummy?.end && (
                        <div>
                            {t("to")} <span>{convertToGMT8(umInfoDummy.end)}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UM;
