# lemon-filePicker


# 一、使用
### 1.在页面引入
```js
1.重要（安卓）：使用前先勾选文件读取权限，具体步骤：打开manifest.json,选择App权限配置,在Android权限配置中勾选<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE"/>
2.若HBuilderX中没有uts编译运行插件，在第一次运行时会自动下载.
3.如果使用出错,请优先检查HBuilderX是否成功安装了uts编译运行插件,并检查HBuilderX是否更新到了最新版
4.本插件已做权限检查（安卓），支持自动跳转到APP权限设置页
5.支持设置Mime类型（安卓），实现限制文件类型选取(ios后续支持)

import fileSelect from "@/uni_modules/lemon-filePicker"
```
### 2.唤起文件选择
```js
	fileSelect({
		scope:"/Download/WeiXin",     //访问指定目录(仅安卓，不需要则不要声明该属性，默认显示根目录) 例：/Download/WeiXin 某信保存的文件    /DCIM/Camera 相机  /Download 下载     （部分目录由于安全策略无法访问,如Android/data，请自行测试，可以参考自己手机的目录进行设置）
		permission: false, //当读取文件的权限被用户拒绝，是否自动跳转到当前APP的权限设置页面，默认为false(不跳转)，
		//实践：
		//1.用户点击选择文件，调用本选取文件插件，
		//2.插件会自动检查是否有文件读取权限（没有会弹窗让用户选择）
		//3.已有权限（或用户点击了同意），直接弹出文件选择
		//4.没有权限（或用户点击了拒绝），配置了permission:true，会自动跳转到当前APP的权限设置页面，如果需要更好的用户体验（跳转前给用户一个帮助说明或图文操作步骤），请配置permission:false，并在fail回调中处理提示用户的逻辑，用户确认后再次调用本插件,这次请permission:true
		mimetype: "application/vnd.android.package-archive", //限制选取的文件类型（安卓），更多类型请参照Mime类型,暂时仅支持设置单个类型
		// mimetype:"text/plain",  
		// mimetype:"image/*",  
		// mimetype:"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
		success(res) {
			console.log(res);
			//res返回值说明
			//  res.code       //状态码  0 成功  1001 未授权文件读取权限（仅安卓）   1002 文件不存在  1003 AppContext不存在（仅安卓） 1004 取消选择(仅ios)
			//  res.filePath   //见下方说明 
			//  res.fileName   //选取的文件的名称
			//  res.fileSize   //选取的文件的大小（仅安卓，单位：字节）
			//  res.fileType   //选取的文件的后缀名 （仅安卓）
			//  res.errMsg      //选择完成后状态信息
			//  res.detail      //详细说明
			

			// filePath: 选取的文件绝对路径,可以直接提供给uniapp的上传、下载等api使用。（使用该路径时,请确认自己的项目有读取访问文件的权限）					
			uni.getSystemInfo({
				success(info) {
					if (info.osName == 'ios') {
						console.log("我是ios")
						// 由于ios文件沙盒机制，需要使用uni.downloadFile下载后，获取到的文件临时路径（_doc/xxx）后使用该路径去上传
						uni.downloadFile({
							url: res.filePath,
							success(e) {
								console.log(e);
								// ios请使用该路径（e.tempFilePath）
								
							}
						})
					} else {
						console.log("我是安卓")
						//安卓可以直接使用
					}
				}
			})
		},
		fail(err) {
			console.log(err);
			// err.code=1001  未授权文件读取权限,可以提示用户未打开读取文件权限
			uni.showModal({
				title:"需要文件访问权限",
				content:"您还未授权本应用读取文件。为保证您可以正常上传文件，请在权限设置页面打开文件访问权限（不同手机厂商表述可能略有差异）请根据自己手机品牌设置",
				confirmText:"去授权",
				cancelText:"算了",
				success(e) {
					if(e.confirm){
						fileSelect({permission: true})
					}
				}
			})
		}
	})
```
# 兼容性说明
目前仅测试了 安卓13.0 、ios13  ，其他系统版本兼容性未知，请自行测试 
# 问题反馈与收集
```js
感谢使用，本插件已停止维护，若遇到问题请加qq群4668502060讨论交流。

由于最近收到的反馈和问题较多且难以排查，本人能力有限，已无力维护（后期将使用原生插件形式重新开发文件选择插件，上线时间未知。。。）

目前收集的问题（Q&A）：
1.文件查找失败：'@/uni_modules/lemon-filePicker' 
2.（已解决，ios,应该？）Error: undefined class: UTSSDKModulesLemonFilePickerIndexSwift
遇到问题2，大概率是你用的window电脑，直接用基本调试基座运行的。
   一、官方文档说明如下：
	  运行到ios平台，uts插件编译需要XCode环境，因此在mac电脑安装了XCode工具时支持直接使用标准基座真机运行。 
	  在windows电脑或者mac电脑没有安装XCode工具时，需要提交云端打包生成自定义基座后才能调用uts插件
   二、简单来说：
    1.你是windows电脑？请点击 运行->原生APP-云打包->选择ios(ipa),填写相关苹果证书配置，选择打自定义基座调试包。打包完成后，运行时选择使用自定义基座运行
	2.你是mac电脑？
	  2.1 有xcode环境？参考这个[xcode配置](https://uniapp.dcloud.net.cn/tutorial/run/uts-development-ios.html)配置后，直接标准基座运行
	  2.2 没有xcode环境？安装完成后参考2.1，不想安装参考1

2.（已解决，安卓）u盘文件无法选择
3.（已解决，安卓）文件类型筛选
4.（已解决，安卓）权限检查
```