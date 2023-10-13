// import store from "@/store";

// 取消置顶
export const pinCancel = (params) => uni.$u?.http.post('/msg/pin/cancel', JSON.stringify(params));
// 置顶
export const pin = (params) => uni.$u?.http.post('/msg/pin', JSON.stringify(params));
// 置顶列表
export const pinList = (params) => uni.$u?.http.post('/msg/pin/list', JSON.stringify(params));