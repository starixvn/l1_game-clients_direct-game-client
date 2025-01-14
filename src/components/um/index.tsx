import React from "react";
import dayjs from "dayjs";
import "./um.scss";
import { useTranslator } from "../../_shared/react-hooks/use-translator";
import { ResourceTypes } from "../../_shared/consts";
import { UMInfo } from "sc-user-service-client/dist/auth";

interface UMProps {
    umInfo: UMInfo;
}

const UM: React.FC<UMProps> = ({ umInfo }) => {
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
            {umInfo && (
                <div>
                    <img className="image" src={`/images/um/maintence-icon.png`} alt="Image" />

                    <div className="title">{t("maintenance_time")}</div>
                    <div>{`(GMT + 8)`}</div>
                    <div className="time">
                        {umInfo?.startTime && (
                            <div>
                                {t("from")} <span>{convertToGMT8(umInfo.startTime)}</span>
                            </div>
                        )}
                        {umInfo?.endTime && (
                            <div>
                                {t("to")} <span>{convertToGMT8(umInfo.endTime)}</span>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default UM;
