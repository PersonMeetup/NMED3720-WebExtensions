function chromeFetch(property) {
	return new Promise(function(resolve) {
		chrome.storage.local.get(property, function(obj) {
			resolve(obj[property]);
		});
	});
}

function init() {
    for (const post of posts) {
        /**
         * Stats Array Reference
         * 
         * [0] Replies /
         * [1] Retweets /
         * [2] Quotes /
         * [3] Likes
         */
        const stats = post.querySelector('.tweet-stats')
                        .querySelectorAll('.icon-container');
        
        for (const stat of stats) {
            let value = 0;
            switch (stat.children[0].getAttribute('class')) {
                case 'icon-comment':
                    value = parseInt(stat.textContent.replace(/,/g, ''));
                    post.setAttribute('data-comment', value);
                    break;
                case 'icon-heart':
                    value = parseInt(stat.textContent.replace(/,/g, ''));
                    post.setAttribute('data-likes', value);
                    if (value > maxLikes)
                        maxLikes = value;
                    break;
                default:
                    break;
            }
        }
    }
}

async function display() {
    let replyThreshold = await chromeFetch("threshold");
    let replyInvert = await chromeFetch("invert");
    let styleToggle = await chromeFetch("style");

    for (const post of posts) {
        const text = post.querySelector('.tweet-content');
        const likes = post.getAttribute('data-likes');
        const replies = post.getAttribute('data-comment');

        if (text === null)
            continue;
        else if (styleToggle) {
            const likeRatio = likes / maxLikes;
            const replyRatio = replies / likes;

            switch (replyInvert) {
                case true:
                    if (replyRatio <= replyThreshold) {
                        post.style.opacity = 1;
                        text.style.fontSize = replyThreshold / replyRatio + 'em';
                    } else {
                        post.style.opacity = likeRatio;
                        text.style.fontSize = '1em';
                    }
                    break;
                case false:
                    if (replyRatio >= replyThreshold) {
                        post.style.opacity = 1;
                        text.style.fontSize = replyRatio / replyThreshold + 'em';
                    } else {
                        post.style.opacity = likeRatio;
                        text.style.fontSize = '1em';
                    }
                    break;
            }
        } else {
            post.style.opacity = 1;
            text.style.fontSize = '1em';
        }
    }
}

function main() {
    posts = document.querySelectorAll('.timeline-item:not(.show-more)');
    // console.log(posts);
    if (posts.length > 0) {
        init();
        display();
    }
}

const callback = function(mutations) {
    mutations.forEach(mutation => {
        if (mutation.type === 'childList') {
            main();
        }
    });
}

const target = document.querySelector('.timeline');
let maxLikes = 0;
let posts = [];

const config = {
    attributes: false, 
    childList: true, 
    characterData: true
};  
const observer = new MutationObserver(callback);
observer.observe(target, config);

main();

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.subject === 'update')
            display();
    }
);