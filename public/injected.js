console.log('hello from injected');


const poller = setInterval(() => {

    console.log('polling injected')

    // both card view and split view have this when list is rendered
    const cards = document.querySelector('.infinite-scroll-component');
    // let jobCardGrid = document.querySelector('#JobCardGrid');

    if (cards !== null) {
        clearInterval(poller);
        console.log('polled injected')
        const results = document.querySelector("#JobCardGrid>ul");
        console.log(results);


        setInterval(() => {
            // @ts-ignore
            console.log(window.searchResults);
        }, 1000);
    }
}, 300);