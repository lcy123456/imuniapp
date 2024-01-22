import store from '@/store';

// 编辑消息
export const updateMsg = params =>
    uni.$u?.http.post('/msg/update_msg', JSON.stringify(params), {
        custom: {
            isIMApi: true
        },
        header: {
            token: store.getters.storeIMToken
        }
    });

// 未读消息数
export const getUnreadMsgCount = params =>
    uni.$u?.http.post('/msg/get_unread_msg_count', JSON.stringify(params), {
        custom: {
            isIMApi: true
        },
        header: {
            token: store.getters.storeIMToken
        }
    });

// 获取消息详情
export const getMsgID = params =>
    uni.$u?.http.post('/msg/get_msg_id', JSON.stringify(params), {
        custom: {
            isIMApi: true
        },
        header: {
            token: store.getters.storeIMToken
        }
    });
// 设置收藏
export const collect = params =>
    uni.$u?.http.post('/msg/collect', JSON.stringify(params), {
        custom: {
            isIMApi: false
        },
        header: {
            token: store.getters.storeBusinessToken
        }
    });
// 获取收藏列表
export const collectList = params =>
    uni.$u?.http.post('/msg/collect/list', JSON.stringify(params), {
        custom: {
            isIMApi: false
        },
        header: {
            token: store.getters.storeBusinessToken
        }
    });
// 删除收藏
export const collectCancel = params =>
    uni.$u?.http.post('/msg/collect/cancel', JSON.stringify(params), {
        custom: {
            isIMApi: false
        },
        header: {
            token: store.getters.storeBusinessToken
        }
    });

// 点赞
export const giveLikeEmoji = params =>
    uni.$u?.http.post(
        '/msg/give_like_emoji',
        JSON.stringify({
            ...params
        }),
        {
            custom: {
                isIMApi: true
            },
            header: {
                token: store.getters.storeIMToken
            }
        }
    );
