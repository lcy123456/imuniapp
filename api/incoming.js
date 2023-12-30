import store from '@/store';

// 获取房间token
export const videoGetToken = params =>
    uni.$u?.http.post(
        '/video/get_token',
        JSON.stringify({
            ...params
        }),
        {
            custom: {
                isIMApi: true
            },
            header: {
                token: store.getters.storeBusinessToken
            }
        }
    );
// 创建房间
export const videoCreateRoomAndGetToken = params =>
    uni.$u?.http.post(
        '/video/create_room_and_get_token',
        JSON.stringify({
            ...params
        }),
        {
            custom: {
                isIMApi: true
            },
            header: {
                token: store.getters.storeBusinessToken
            }
        }
    );
// 群通话人数与自己的token
export const videoGetRoomMember = params =>
    uni.$u?.http.post(
        '/video/get_room_member',
        JSON.stringify({
            ...params
        }),
        {
            custom: {
                isIMApi: true
            },
            header: {
                token: store.getters.storeBusinessToken
            }
        }
    );

// 获取当前语音回话
export const videoGetOfflineInfo = params =>
    uni.$u?.http.post(
        '/video/get_offline_info',
        JSON.stringify({
            ...params
        }),
        {
            custom: {
                isIMApi: true
            },
            header: {
                token: store.getters.storeBusinessToken
            }
        }
    );

// 拒绝接听
export const videoSingleChatRefused = params =>
    uni.$u?.http.post(
        '/video/single_chat_refused',
        JSON.stringify({
            ...params
        }),
        {
            custom: {
                isIMApi: true
            },
            header: {
                token: store.getters.storeBusinessToken
            }
        }
    );

// 获取 wsUrl
export const videoGetLivekitUrl = params =>
    uni.$u?.http.get('/video/get_livekit_url', {
        data: {
            ...params
        },
        custom: {
            isIMApi: true
        },
        header: {
            token: store.getters.storeBusinessToken
        }
    });
