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

const poller = setInterval(() => {

    console.log('polling')

    // both card view and split view have this when list is rendered
    const cards = document.querySelector('.infinite-scroll-component');
    // let jobCardGrid = document.querySelector('#JobCardGrid');

    if (cards !== null) {
        clearInterval(poller);
        console.log('polled')
        const results = document.querySelector("#JobCardGrid>ul");
        console.log(results);


        setInterval(() => {
            // @ts-ignore
            console.log(window);
        }, 1000);
    }
}, 300);





export function Monster(): React.ReactElement | null {
    const [parentElement] = React.useState(() =>
        // See https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver for more robust solution
        document.querySelector(".sc-ggqIjW") // CSS selector for Google main image container
    );

    return parentElement ? (
        <ShadowDom parentElement={parentElement}>Hello there 👋, </ShadowDom>
    ) : null;
}