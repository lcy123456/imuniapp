// https://api.giphy.com/v1/gifs/search?api_key=3eFQvabDx69SMoOemSPiYfh9FY0nzO9x&q=keyword&offset=0&limit=100
import store from '@/store';
// 在线状态
export const getGifsSearch = (params) => {
    return uni.$u?.http.get(
        `${store.getters.storeThirdData?.gif?.url}/v1/gifs/search`,
        {
            custom: {
                isGiphy: true,
            },
            data: {
                api_key: store.getters.storeThirdData?.gif?.apiKey,
                ...params
            },
        }
    );
};
// 创建房间
export const bindCid = (params) => uni.$u?.http.post('/account/bind_cid', JSON.stringify({
    ...params,
}), {
    header: {
        token: store.getters.storeBusinessToken,
    }
});
    


// 获取 Url
export const thirdConfig = (params) => uni.$u?.http.get('/third/config', {
    data: {
        ...params
    },
    custom: {
        isIMApi: true,
    },
    header: {
        token: store.getters.storeBusinessToken,
    }
});