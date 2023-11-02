let posts = document.querySelectorAll('.timeline-item');
let maxLikes = 0;

for (const post of posts) {
    /**
     * Stats Array Reference
     * 
     * 0: Replies /
     * 1: Retweets /
     * 2: Quotes /
     * 3: Likes
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

for (const post of posts) {
    const likes = post.getAttribute('data-likes');
    const replies = post.getAttribute('data-comment');

    const likeRatio = likes / maxLikes;
    const replyRatio = replies / likes;

    post.style.opacity = replyRatio >= likeRatio ? replyRatio : likeRatio;
}