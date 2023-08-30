
import fileSelect from "@/uni_modules/lemon-filePicker";

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

export const chooseFile = () => {
    return new Promise((resolve, reject) => {
        fileSelect({
            permission: false,
            success (res) {
                console.log(res);                    
                uni.getSystemInfo({
                    success (info) {
                        if (info.osName == 'ios') {
                            uni.downloadFile({
                                url: res.filePath,
                                success (e) {
                                    console.log(e);
                                    // ios请使用该路径（e.tempFilePath）
                                    resolve({
                                        ...res,
                                        filePath: e.tempFilePath
                                    });
                                }
                            });
                        } else {
                            resolve({...res});
                        }
                    }
                });
            },
            fail (err) {
                console.log(err);
                uni.showModal({
                    title: "需要文件访问权限",
                    content: "您还未授权本应用读取文件。为保证您可以正常上传文件，请在权限设置页面打开文件访问权限（不同手机厂商表述可能略有差异）请根据自己手机品牌设置",
                    confirmText: "去授权",
                    cancelText: "算了",
                    success (e) {
                        if (e.confirm) {
                            fileSelect({permission: true});
                        }
                    }
                });
                reject(err);
            }
        });
    });
};