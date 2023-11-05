/**
 * Saves int num of stat type to super-parent; returns num
 * @param {Element} post 
 * @param {Element} stat 
 * @param {string} type 
 */
function statPuller(post, stat, type) {
    let num = parseInt(
        stat.getAttribute('aria-label').match(/\d+/g)[0]
    );
    post.setAttribute(`data-${type}`, num);
    return num;
}

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
        const stats = post.querySelector('.css-1dbjc4n')
            .querySelectorAll('.r-1777fci');
        

        for (const stat of stats) {
            let value = 0;
            switch (stat.getAttribute('data-testid')) {
                case 'reply':
                    value = statPuller(post, stat, 'replies');
                    break;
                case 'like':
                    value = statPuller(post, stat, 'likes');
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

    for (const post of posts) {
        // const text = post.querySelector('.tweet-content');
        const likes = post.getAttribute('data-likes');
        const replies = post.getAttribute('data-comment');

        const likeRatio = likes / maxLikes;
        const replyRatio = replies / likes;

        post.style.opacity = likeRatio;
        // if (replyRatio >= replyThreshold)
        //     text.style.fontSize = replyRatio / replyThreshold + 'em';
        // else {
        //     post.style.opacity = likeRatio;
        //     text.style.fontSize = '1em';
        // }
    }
}

const callback = function(mutations) {
    mutations.forEach(mutation => {
        if (mutation.type === 'childList') {
            let posts = document.querySelectorAll('[data-testid="cellInnerDiv"]');
            console.log(posts);
        }
    });
}

const target = document.getElementById('react-root');
let maxLikes = 0;

const config = {
    attributes: false, 
    childList: true, 
    characterData: true,
    subtree: true
};
const observer = new MutationObserver(callback);
observer.observe(target, config);

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.subject === 'update' && request.message === 'threshold')
            display();
    }
);