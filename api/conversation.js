import store from '@/store';

// 获取房间token
export const setConversations = (params) => uni.$u?.http.post('/conversation/set_conversations', JSON.stringify({
    ...params,
}), {
    custom: {
        isIMApi: true,
    },
    header: {
        token: store.getters.storeIMToken,
    }
});