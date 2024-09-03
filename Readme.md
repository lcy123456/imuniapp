## 安装依赖

项目根目录命令行执行:

```bash
npm install
```

或

```bash
yarn
```

## 修改配置

### manifest.json

-   重新获取AppID

    ![image-20221209192155845](./doc/config.png)

### common->config.js

-   https+域名形式。若按照官方nginx方式配置。则仅需要修改下方域名为你自己的域名即可，后缀保留。

    ```javascript
    registerUrl: 'https://web.rentsoft.cn/chat';
    apiUrl: 'https://web.rentsoft.cn/api';
    configUrl: 'https://web.rentsoft.cn/complete_admin';
    wsUrl: 'wss://web.rentsoft.cn/msg_gateway';
    ```

-   http+IP+端口形式 仅需替换IP即可。**不必更换端口**

    ```javascript
    registerUrl: 'http://121.5.182.23:10008';
    apiUrl: 'http://121.5.182.23:10002';
    configUrl: 'http://121.5.182.23:10009';
    wsUrl: 'ws://121.5.182.23:10001';
    ```

## 云打包自定义调试基座

> 推荐环境：Hbuilder X 3.6.5.20221121
>
> 由于demo是基于原生插件开发的，所以**仅支持 Android、iOS**运行。且根据uniapp官方文档，调试原生插件需要先打包自定义基座，在**自定义基座**上运行。

-   菜单栏->发行->原生App 云打包

    ![image-20221209185322626](./doc/build.png)

-   等待云打包完成后运行自定义调试基座到模拟器或真机。

    > 菜单栏->运行->运行到 App基座

    ![image-20221209185717429](./doc/run.png)

    ![image-20221209185815575](./doc/run2.png)

## 安卓apk和谷歌abb打包注意事项：

    由于普通apk和谷歌abb的下载地址差异，打包时候需要修改 util/fCheckVersion.js中 appVersion 方法下的platform（abb为2，apk为3）

"NSPhotoLibraryUsageDescription" : "请求获取读取相册权限，用于上传头像图片服",
"NSPhotoLibraryAddUsageDescription" : "请求获取存入相册权",
"NSCameraUsageDescription" : "请求获取摄像头权限，用于视频通话服",
"NSMicrophoneUsageDescription" : "请求获取麦克风权限，用于语音通话服",
"NSLocationWhenInUseUsageDescription" : "请求获取位置权限，用于分享位置信息服",
"NSLocationAlwaysAndWhenInUseUsageDescription" : "请求获取位置权限，用于分享位置信息服",
"NSLocationAlwaysUsageDescription" : "请求获取位置权限，用于分享位置信息服",
"NSBluetoothAlwaysUsageDescription" : "请求获取蓝牙权限",
"NSUserTrackingUsageDescription" : "请放心，开启权限不会获取您在其他站点的隐私信息，该权限仅用于标识设备并保障服务安全与提示浏览体",
"NSRemindersUsageDescription" : "通知可能包括提醒、声音和图标标记。这些可在“设置”中配",
"NSLocalNetworkUsageDescription" : "关闭无限数据时，部分功能可能无法使用。"
