import React, { useState } from "react";
import "./style.scss";
import { getSession } from "../../../_shared/utils";
import { AppTypes } from "../../../_shared/consts";

const Loading = () => {
    const [appType] = useState(() => {
        const params = new URLSearchParams(window.location.search);
        const type = params.get("appType");
        const session = getSession();
        return +type || +session?.system || 0;
    });
    return appType === AppTypes.DIRECT && <div className="fake-tab-menu" data-testid="fake-tab-menu"></div>;
};

export default Loading;
