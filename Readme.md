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

- 重新获取AppID

  ![image-20221209192155845](./doc/config.png)


### common->config.js

- https+域名形式。若按照官方nginx方式配置。则仅需要修改下方域名为你自己的域名即可，后缀保留。

  ```javascript
  registerUrl: 'https://web.rentsoft.cn/chat'
  apiUrl: 'https://web.rentsoft.cn/api'
  configUrl: 'https://web.rentsoft.cn/complete_admin'
  wsUrl: 'wss://web.rentsoft.cn/msg_gateway'
  ```

- http+IP+端口形式 仅需替换IP即可。**不必更换端口**

  ```javascript
  registerUrl: 'http://121.5.182.23:10008'
  apiUrl: 'http://121.5.182.23:10002'
  configUrl: 'http://121.5.182.23:10009'
  wsUrl: 'ws://121.5.182.23:10001'
  ```


## 云打包自定义调试基座

> 推荐环境：Hbuilder X 3.6.5.20221121
>
> 由于demo是基于原生插件开发的，所以**仅支持 Android、iOS**运行。且根据uniapp官方文档，调试原生插件需要先打包自定义基座，在**自定义基座**上运行。

- 菜单栏->发行->原生App 云打包

  ![image-20221209185322626](./doc/build.png)

- 等待云打包完成后运行自定义调试基座到模拟器或真机。

  > 菜单栏->运行->运行到 App基座

  ![image-20221209185717429](./doc/run.png)

  ![image-20221209185815575](./doc/run2.png)