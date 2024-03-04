import React from "react";
import { ShadowDom } from "./ShadowDom";



function injectScript() {
    const script = document.createElement("script");
    // @ts-ignore
    script.src = chrome.runtime.getURL("injected.js");
    (document.head || document.documentElement).appendChild(script);
}
injectScript()

console.log('hello from monster')
const a = document.querySelector('header')
console.log(a);






export function Monster(): React.ReactElement | null {
    const [parentElement] = React.useState(() =>
        // See https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver for more robust solution
        document.querySelector(".sc-ggqIjW") // CSS selector for Google main image container
    );

    return parentElement ? (
        <ShadowDom parentElement={parentElement}>Hello there 👋, </ShadowDom>
    ) : null;
}