//@ts-nocheck

/*
    this is run as a script embedded into the webpage (via script tag)
    responsibilities:
        - monitor search results
        - notify context (via messages) of updates to search results and search context etc
          (data is retrieved from window.searchResults)
        - notify context of hover events on search results
 */

export const monitorReactNodes = function() {

    const sendResults = () => {
        window.postMessage({
            type: 'JOB_RESULTS_UPDATED',
            payload: window.searchResults?.jobResults || [],
            source: 'content'
        }, "*");
    }

    const sendAppContext = () => {
        let obj = window.searchResults?.jobRequest || {};
        obj.estimatedTotalSize = window.searchResults?.estimatedTotalSize || 0;
        obj.totalSize = window.searchResults?.totalSize || 0;
        window.postMessage({
            type: 'APP_CONTEXT_UPDATED',
            payload: obj,
            source: 'content'
        }, "*");
    }

    const sendSearchId = () => {
        window.postMessage({
            type: 'SEARCH_ID_UPDATED',
            payload: window.searchResults?.searchId || '',
            source: 'content'
        }, "*");
    }

    const sendFingerprintId = () => {
        window.postMessage({
            type: 'FINGERPRINT_ID_UPDATED',
            payload: window.searchResults?.jobRequest?.fingerprintId || '',
            source: 'content'
        }, "*");
    }

    const sendRequest = () => {
        let obj = window.searchResults?.jobRequest || {};
        obj.estimatedTotalSize = window.searchResults?.estimatedTotalSize || 0;
        obj.totalSize = window.searchResults?.totalSize || 0;
        window.postMessage({
            type: 'SEARCH_REQUEST_UPDATED',
            payload: obj,
            source: 'content'
        }, "*");
    }



    // have to use poller here, as memoized state is partially set then updated later with the data
    const sendContext = (nodeWithRequestInfo: Element) => {
        if (nodeWithRequestInfo) {
            const poll = setInterval(() => {

                let n = nodeWithRequestInfo.memoizedState?.baseState;
                // @ts-ignore
                if (n?.location) {
                    clearInterval(poll);
                    n.totalSize = window.searchResults?.totalSize;
                    n.searchId = window.searchResults?.searchId;
                    n.fingerprintId = window.searchResults?.jobRequest?.fingerprintId;
                    window.postMessage({
                        type: 'APP_CONTEXT_UPDATED',
                        // @ts-ignore
                        payload: n,
                        source: 'content'
                    }, "*");
                }
            }, 200);
        }
    }


    const header = document.querySelector('.ds-header');

    const findRequest = () => {
        for (const key in header) {
            if (key.startsWith('__reactFiber$')) {
                // console.log('header has key');
                // @ts-ignore
                let item = header[key];
                let numberIt = 0;
                // todo!
                while (item.memoizedState?.baseState?.client === undefined && numberIt < 50) {
                    item = item?.return;
                    numberIt++;
                }
                if (item.memoizedState?.baseState) {
                    return item;
                } else {
                    return null;
                }
            }
        }
    }


    const poller = setInterval(() => {

        // both card view and split view have this when list is rendered
        const cards = document.querySelector('.infinite-scroll-component');
        // let jobCardGrid = document.querySelector('#JobCardGrid');

        if (cards !== null) {
            clearInterval(poller);

            // todo ? - deal with both being present, and switching layout
            const cardList = document.querySelector("[class^='job-search-resultsstyle__CardGrid']");
            const cardListSplit = document.querySelector("#JobCardGrid>ul");

            let results: Element | null = null;
            if (cardList) {
                results = cardList;
            }
            // bias to cardListSplit
            if (cardListSplit) {
                results = cardListSplit;
            }

            let timeout: NodeJS.Timeout;
            const handleMove = (event: Event) => {
                clearTimeout(timeout);
                timeout = setTimeout(() => {
                    // @ts-ignore
                    let path = event.path || event.composedPath();
                    try {
                        for (let i = 0; i < path.length; i++) {
                            if (path[i].nodeName === 'ARTICLE') {
                                // console.log(path[i]);
                                let id = path[i].getAttribute('data-test-id');
                                let match = id.match(/-component-(\d*)$/);
                                let pos;
                                if (match) {
                                    pos = parseInt(match[1]);
                                    window.postMessage({
                                        type: 'HOVER_RESULTS',
                                        payload: pos,
                                        source: 'content'
                                    }, "*");
                                }

                                // todo - want to do any checks???!!!
                                let child = path[i].children[0];
                                let link = child?.href;
                                let decoration = child.children[child.children.length];
                                if (decoration && decoration.nodeName === 'DIV') {
                                    let position = parseInt(decoration.children[0]?.children[2]?.innerText);
                                    if (position !== pos) {
                                        console.log('ERROR with position')
                                    }
                                }
                                break;
                            }
                        }
                    } catch (e) {
                        console.log(e);
                    }
                }, 200);
            }

            // monitor updates to card list and listen for mouse hovers
            if (results) {

                if (window.PointerEvent) {
                    results.addEventListener("pointermove", handleMove);
                } else {
                    results.addEventListener("mousemove", handleMove);
                    console.log('no pointer?!');
                }

                // if we have results, then there will be a request
                let nodeWithRequestInfo = findRequest();
                const sendData = () => {
                    sendResults();
                    sendRequest();
                    sendSearchId();
                    sendFingerprintId();
                    sendContext(nodeWithRequestInfo);
                }

                // need to send initial results, for popular searches
                sendData();

                const sendDataForEmptySearches = () => {
                    const empty = document.querySelector('[type=empty]');
                    if (empty) {
                        sendData();
                    }
                }

                let isFirstRender = true;

                const resultsObserver = new MutationObserver((mutations: any) => {
                    if (isFirstRender) {
                        // send results for empty searches - which takes time to resolve
                        setTimeout(sendDataForEmptySearches, 5000);
                        isFirstRender = false;
                    }
                    sendData();
                });

                // @ts-ignore
                resultsObserver.observe(results, {
                    childList: true // report added/removed nodes
                });
            }
        }

    }, 100);


    // todo - look for no results, more results etc
    /*
        <div className="job-search-resultsstyle__LoadMoreContainer-sc-1wpt60k-1 htsqfC">
            <button aria-pressed="false" className="sc-dkPtyc jRkyeO  ds-button" disabled="" role="button" type="button"
                    shape="rectangle">No More Results
            </button>
        </div>
     */

    const style = 'background: #444; color: #fff; font-weight: bold; padding-top: 3px; padding-bottom: 3px;';
    console.log("%c adinfo ::: LOADED ", style, { logType: "LOADED", moduleName: "injected script", time: Date.now() });

}