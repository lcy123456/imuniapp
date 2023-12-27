import store from "@/store";

// 编辑消息
export const updateMsg = (params) => uni.$u?.http.post('/msg/update_msg', JSON.stringify(params), {
    custom: {
        isIMApi: true,
    },
    header: {
        token: store.getters.storeIMToken,
    }
});

// 未读消息数
export const getUnreadMsgCount = (params) => uni.$u?.http.post('/msg/get_unread_msg_count', JSON.stringify(params), {
    custom: {
        isIMApi: true,
    },
    header: {
        token: store.getters.storeIMToken,
    }
});

// 获取消息详情
export const getMsgID = (params) => uni.$u?.http.post('/msg/get_msg_id', JSON.stringify(params), {
    custom: {
        isIMApi: true,
    },
    header: {
        token: store.getters.storeIMToken,
    }
});
