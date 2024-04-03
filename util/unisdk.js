// import fileSelect from '@/uni_modules/lemon-filePicker';
const lemonjkFileSelect = uni.requireNativePlugin('lemonjk-FileSelect');

// 提示框
export const showToast = ({
    title,
    duration = 2000,
    icon = 'none',
    mask = true
}) => {
    uni.showToast({
        title,
        icon,
        duration,
        mask
    });
};
export const showLoading = ({ title, mask = true }) => {
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
        lemonjkFileSelect[
            uni.$u.os() === 'ios' ? 'showPicker' : 'showNativePicker'
        ](
            {
                pathScope: '/Download',
                mimeType: '*/*',
                utisType: 'public.data'
            },
            result => {
                console.log('result----result', result);
                if (['0', 0].includes(result.code)) {
                    result.files.forEach(item => {
                        resolve({
                            ...item
                        });
                    });
                } else if (result.code === '1001') {
                    uni.showModal({
                        title: '需要文件访问权限',
                        content:
                            '您还未授权本应用读取文件。为保证您可以正常上传文件，请在权限设置页面打开文件访问权限（不同手机厂商表述可能略有差异）请根据自己手机品牌设置',
                        confirmText: '去授权',
                        cancelText: '算了',
                        success(e) {
                            if (e.confirm) {
                                // 跳转到应用设置页
                                lemonjkFileSelect.gotoSetting();
                            }
                        }
                    });
                } else {
                    // uni.$emit('toast', '访问错误');
                    reject(result.errMsg);
                }
            }
        );
    });
};

let recorderManager = null;
let innerAudioContext = null;
let recordVoiceResolve = null;
let recordVoiceReject = null;
export const recordVoiceManager = () => {
    if (!recorderManager) {
        recorderManager = uni.getRecorderManager();
        innerAudioContext = uni.createInnerAudioContext();
        recorderManager.onStop(function (res) {
            // console.log('recorder stop' + JSON.stringify(res));
            if (recordVoiceResolve) {
                innerAudioContext.src = res.tempFilePath;
            }
        });
        recorderManager.onError(function (err) {
            // console.log('recorder error' + JSON.stringify(err));
            recordVoiceReject && recordVoiceReject(err);
        });
        innerAudioContext.onCanplay(function () {
            console.log('recorder canplay');
            recordVoiceResolve({
                path: innerAudioContext.src,
                duration: innerAudioContext.duration
            });
        });
    }
    const start = () => {
        recorderManager.start();
        recordVoiceResolve = null;
        recordVoiceReject = null;
    };
    const stop = () => {
        recorderManager.stop();
    };
    const getPath = () => {
        return new Promise((resolve, reject) => {
            recorderManager.stop();
            recordVoiceResolve = resolve;
            recordVoiceReject = reject;
        });
    };

    return {
        start,
        stop,
        getPath
    };
};
