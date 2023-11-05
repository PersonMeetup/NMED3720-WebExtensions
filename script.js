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

    for (const post of posts) {
        const text = post.querySelector('.tweet-content');
        const likes = post.getAttribute('data-likes');
        const replies = post.getAttribute('data-comment');

        const likeRatio = likes / maxLikes;
        const replyRatio = replies / likes;

        if (replyRatio >= replyThreshold)
            text.style.fontSize = replyRatio / replyThreshold + 'em';
        else {
            post.style.opacity = likeRatio;
            text.style.fontSize = '1em';
        }
    }
}

let maxLikes = 0;
const posts = document.querySelectorAll('.timeline-item:not(.show-more)');
if (posts !== null) {
    init();
    display();
}    

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.subject === 'update' && request.message === 'threshold')
            display();
    }
);