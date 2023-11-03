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

function main() {
    let posts = document.querySelectorAll('[data-testid="cellInnerDiv"]');

    for (const post of posts) {
        /**
         * Stats Array Reference
         * 
         * 0: Replies /
         * 1: Retweets /
         * 2: Quotes /
         * 3: Likes
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

    for (const post of posts) {
        const likes = post.getAttribute('data-likes');
        const replies = post.getAttribute('data-replies');

        const likeRatio = likes / maxLikes;
        const replyRatio = replies / likes;

        post.style.opacity = replyRatio >= likeRatio ? replyRatio : likeRatio;
    }
}



const callback = function(mutations) {
    mutations.forEach(mutation => {
        if (mutation.type === 'childList') {
            console.log("Holly!");
        }
    });
}

const target = document.querySelector('main');
let maxLikes = 0;

const config = {
    attributes: true, 
    childList: true, 
    characterData: true
};
const observer = new MutationObserver(callback);
observer.observe(target, config);