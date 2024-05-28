import store from '@/store';

// 设置会话
export const setConversations = params =>
    uni.$u?.http.post(
        '/conversation/set_conversations',
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

export const apiConversationFolderCreate = async params => {
    return uni.$u?.http.post('/conversation/folder', params, {
        header: {
            token: store.getters.storeBusinessToken
        }
    });
};
export const apiConversationFolderUpdate = async params => {
    return uni.$u?.http.post('/conversation/folder/update', params, {
        header: {
            token: store.getters.storeBusinessToken
        }
    });
};

export const apiConversationFolder = async params => {
    return uni.$u?.http.post('/conversation/folder/list', params, {
        header: {
            token: store.getters.storeBusinessToken
        }
    });
};
