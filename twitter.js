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
    let styleToggle = await chromeFetch("style");

    for (const post of posts) {
        const text = post.querySelector('[data-testid="tweetText"]');
        const likes = post.getAttribute('data-likes');
        const replies = post.getAttribute('data-replies');

        if (text === null)
            continue;
        else if (styleToggle) {
            const likeRatio = likes / maxLikes;
            const replyRatio = replies / likes;
            
            if (replyRatio >= replyThreshold) {
                post.style.opacity = 1;
                text.style.fontSize = replyRatio / replyThreshold + 'em';
            } else {
                post.style.opacity = likeRatio;
                text.style.fontSize = '1em';
            }
        } else {
            post.style.opacity = 1;
            text.style.fontSize = '1em';
        }
    }
}

function logoReplace() {
    if (!target.getAttribute('data-tweeted')) {
        const labels = ['X', 'Premium'];
        for (const label of labels) {
            const svg = target.querySelector(`[aria-label="${label}"] svg`);
            const oldLogo = svg.querySelector('g');

            const newLogo = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            newLogo.setAttributeNS(null, 'd', "M 0.0814 17.2734 Q 1.5066 16.6539 2.8698 16.5299 Q 1.3207 17.4595 0.763 19.1944 Q 2.2501 18.327 3.8612 18.0171 A 4.8953 4.8953 270 0 0 12.2265 13.5556 Q 18.4851 13.9894 22.327 18.6987 A 4.9573 4.9573 270 0 0 20.8398 12.1303 Q 21.8932 12.1303 23.0705 12.75 S 23.2564 8.9082 19.1047 7.8548 Q 20.282 7.5449 21.3355 7.7928 S 20.406 4.5086 16.75 4.3847 Q 19.8483 1.9061 24 2.3398 A 13.8803 13.8803 270 0 0 2.56 14.7329 Q 1.1347 15.7243 0.0814 17.2734") 

            oldLogo.remove();
            svg.append(newLogo);
            target.setAttribute('data-tweeted', 'true');
        }
    }
}

function postEncourage() {
    const button = target.querySelector('[data-testid="tweetButton"] span.css-1hf3ou5 > span');
    const input = target.querySelector('[data-testid="tweetTextarea_0"]');

    // WIP: Set the text of the button as a user types
    // if (button && input) {
    //     button.innerText = input.innerText.length;
    // }
}

// [data-testid="tweetButton"] span.css-1hf3ou5 > span
// [data-testid="tweetTextarea_0"] [data-text="true"]

const callback = function(mutations) {
    mutations.forEach(mutation => {
        if (mutation.type === 'childList') {
            posts = document.querySelectorAll('[data-testid="cellInnerDiv"]');
            // console.log(posts);
            if (posts.length > 0) {
                logoReplace();
                postEncourage();
                init();
                display();
            }
        }
    });
}

const target = document.getElementById('react-root');
let maxLikes = 0;
let posts = [];

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
        if (request.subject === 'update')
            display();
    }
);