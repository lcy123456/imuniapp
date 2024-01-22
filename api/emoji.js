import store from '@/store';

// 取消收藏
export const emojiCollectCancel = params =>
    uni.$u?.http.post('/msg/emoji_collect/cancel', JSON.stringify(params), {
        header: {
            token: store.getters.storeBusinessToken
        }
    });
// 收藏
export const emojiCollect = params =>
    uni.$u?.http.post('/msg/emoji_collect', JSON.stringify(params), {
        header: {
            token: store.getters.storeBusinessToken
        }
    });
// 收藏列表
export const emojiCollectList = params =>
    uni.$u?.http.post('/msg/emoji_collect/list', JSON.stringify(params), {
        header: {
            token: store.getters.storeBusinessToken
        }
    });
