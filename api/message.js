import store from "@/store";

// 编辑消息
export const updateMsg = (params) => uni.$u?.http.post('http://192.168.2.216:10002/msg/update_msg', JSON.stringify(params), {
    custom: {
        isIMApi: true,
    },
    header: {
        token: store.getters.storeIMToken,
        // storeBusinessToken
    }
});