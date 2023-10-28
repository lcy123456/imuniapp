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
// 群通话人数与自己的token
export const videoGetRoomMember = (params) => uni.$u?.http.post('/video/get_room_member', JSON.stringify({
    ...params,
}), {
    custom: {
        isIMApi: true,
    },
    header: {
        token: store.getters.storeBusinessToken,
    }
});

// 群通话人数与自己的token
export const videoGetOfflineInfo = (params) => uni.$u?.http.post('/video/get_offline_info', JSON.stringify({
    ...params,
}), {
    custom: {
        isIMApi: true,
    },
    header: {
        token: store.getters.storeBusinessToken,
    }
});