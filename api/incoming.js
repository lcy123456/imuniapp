import store from '@/store';

// 获取房间token
export const videoGetToken = (params) => uni.$u?.http.post('/video/get_token', JSON.stringify({
    ...params,
}), {
    custom: {
        isIMApi: true,
    },
    header: {
        token: store.getters.storeBusinessToken,
    }
});
// 创建房间
export const videoCreateRoomAndGetToken = (params) => uni.$u?.http.post('/video/create_room_and_get_token', JSON.stringify({
    ...params,
}), {
    custom: {
        isIMApi: true,
    },
    header: {
        token: store.getters.storeBusinessToken,
    }
});