// https://api.giphy.com/v1/gifs/search?api_key=3eFQvabDx69SMoOemSPiYfh9FY0nzO9x&q=keyword&offset=0&limit=100

// 在线状态
export const getGifsSearch = (params) => {
    return uni.$u?.http.get(
        'v1/gifs/search',
        {
            custom: {
                isGiphy: true,
            },
            data: {
                api_key: "3eFQvabDx69SMoOemSPiYfh9FY0nzO9x",
                ...params
            },
        }
    );
};
    