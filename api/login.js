import store from "@/store";

// 登录
export const businessLogin = (params) => uni.$u?.http.post('/account/login', JSON.stringify(params));
export const businessSendSms = (params) => uni.$u?.http.post('/account/code/send', JSON.stringify(params));
export const businessVerifyCode = (params) => uni.$u?.http.post('/account/code/verify', JSON.stringify(params));
export const businessRegister = (params) => uni.$u?.http.post('/account/register', JSON.stringify(params));
export const businessReset = (params) => uni.$u?.http.post('/account/password/reset', JSON.stringify(params));
export const businessModify = (params) => uni.$u?.http.post('/account/password/change', JSON.stringify(params));
export const businessCancellation = (params) => uni.$u?.http.post('/account/cancellation', JSON.stringify(params));




// 用户信息
export const businessInfoUpdate = (params) => uni.$u?.http.post('/user/update', JSON.stringify({
    ...params,
}), {
    header: {
        token: store.getters.storeBusinessToken
    }
});
export const businessGetUserInfo = (userID) => uni.$u?.http.post('/user/find/full', JSON.stringify({
    userIDs: [userID],
}), {
    header: {
        token: store.getters.storeBusinessToken
    }
});

export const businessSearchUserInfo = (keyword) => uni.$u?.http.post('/user/search/full', JSON.stringify({
    keyword,
    pagination: {
        pageNumber: 1,
        showNumber: 10,
    }
}), {
    header: {
        token: store.getters.storeBusinessToken
    }
});

export const accountScan = (params) => uni.$u?.http.post('/account/scan', JSON.stringify(params), {
    header: {
        token: store.getters.storeBusinessToken
    }
});

// app config
export const getAppConfigFromSvr = (content) => uni.$u?.http.post('/client_config/get');