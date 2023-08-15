// 提示框
export const showToast = ({title, duration = 2000, icon = "none", mask = true}) => {
    uni.showToast({
        title,
        icon,
        duration,
        mask
    });
};
export const showLoading = ({title, mask = true}) => {
    uni.showLoading({
        title,
        mask
    });
};

export const chooseImage = (params = {}) => {
    return new Promise((resolve, reject) => {
        uni.chooseImage({
            count: 1,
            ...params,
            success: async ({ tempFilePaths }) => {
                resolve(tempFilePaths);
            },
            fail: reject
        });
    });
};