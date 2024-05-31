import { appVersion } from '@/api/';

// const updateUseModal = packageInfo => {
//     const {
//         title, // 标题
//         contents, // 升级内容
//         is_mandatory, // 是否强制更新
//         url // 安装包下载地址
//     } = packageInfo;

//     const confirmText = 'update';

//     return uni.showModal({
//         title,
//         content:
//             contents ||
//             'The current version has content updates, do you choose to update?',
//         showCancel: !is_mandatory,
//         cancelText: 'cancel',
//         confirmText,
//         success: res => {
//             if (res.cancel) return;
//             const waiting = plus.nativeUI.showWaiting('Downloading now - 0%');
//             const downloadTask = uni.downloadFile({
//                 url,
//                 success: res => {
//                     if (res.statusCode !== 200) {
//                         uni.showModal({
//                             title: 'Update prompt',
//                             content:
//                                 'Failed to download the installation package',
//                             confirmText: 'confirm',
//                             cancelText: 'cancel'
//                         });
//                         return;
//                     }
//                     // 下载好直接安装，下次启动生效
//                     plus.runtime.install(
//                         res.tempFilePath,
//                         {
//                             force: false
//                         },
//                         () => {
//                             uni.hideLoading();
//                             plus.runtime.restart();
//                         },
//                         err => {
//                             uni.hideLoading();
//                             uni.showModal({
//                                 title: 'Update prompt',
//                                 confirmText: 'confirm',
//                                 cancelText: 'cancel',
//                                 content: 'Update failed ' + err.message,
//                                 showCancel: false
//                             });
//                         }
//                     );
//                 },
//                 //接口调用结束
//                 complete: () => {
//                     uni.hideLoading();
//                     downloadTask.offProgressUpdate(); //取消监听加载进度
//                     plus.nativeUI.closeWaiting();
//                 }
//             });
//             //监听下载进度
//             downloadTask.onProgressUpdate(res => {
//                 waiting.setTitle('Downloading now - ' + res.progress + '%');
//                 // console.log('下载进度百分比:' + res.progress); // 下载进度百分比
//                 // console.log('已经下载的数据长度:' + res.totalBytesWritten); // 已经下载的数据长度，单位 Bytes
//                 // console.log('预期需要下载的数据总长度:' + res.totalBytesExpectedToWrite); // 预期需要下载的数据总长度，单位 Bytes
//             });
//         }
//     });
// };
function compareVersion(version1, version2) {
    const v1 = version1.split('.');
    const v2 = version2.split('.');

    const minLength = Math.min(v1.length, v2.length);

    for (let i = 0; i < minLength; i++) {
        const num1 = parseInt(v1[i]);
        const num2 = parseInt(v2[i]);

        if (num1 > num2) {
            return 1; // version1 大于 version2
        } else if (num1 < num2) {
            return -1; // version1 小于 version2
        }
    }
    if (v1.length > v2.length) {
        return 1; // version1 大于 version2
    } else if (v1.length < v2.length) {
        return -1; // version1 小于 version2
    }

    // 版本号完全相同
    return 0; // version1 等于 version2
}

const showModal = map => {
    const { fileUrl, updateLog, forceUpdate, version } = map;
    uni.setStorageSync('noForceUpdate', 0);
    uni.showModal({
        content: updateLog,
        showCancel: !forceUpdate,
        confirmText: '更新',
        cancelText: '取消',
        title: '版本更新',
        success: res => {
            if (res.confirm) {
                plus.runtime.openURL(fileUrl);
            } else {
                uni.setStorageSync('noForceUpdate', version);
            }
        }
    });
};

const fCheckVersion = cb => {
    plus.runtime.getProperty(plus.runtime.appid || '', async () => {
        try {
            const versionLocal = plus.runtime.version;
            const {
                fileUrl,
                version,
                updateLog,
                forceUpdate,
                tipUpdate,
                platform
            } = await appVersion({
                platform: uni.$u.os() === 'ios' ? 1 : 2 // ios：1 安卓：8 谷歌：2
            });
            const localForceUpdate = uni.getStorageSync('noForceUpdate');
            const result = compareVersion(version, versionLocal);
            if (
                !tipUpdate ||
                result <= 0 ||
                (localForceUpdate === version && !forceUpdate)
            )
                return;
            showModal({
                fileUrl,
                version,
                updateLog,
                forceUpdate,
                tipUpdate,
                platform
            });
            cb && cb();
        } catch (err) {
            console.log('fCheckVersion---err', err);
        }
    });
};

export default fCheckVersion;
