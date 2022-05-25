import React from "react";

export const SiteHeader = (props: { title: string }) =>
    <div className="SiteHeader">
        <div className="AppName border-wh-5">
            <h1 className="header-txt">{props.title}</h1>
        </div>
    </div>