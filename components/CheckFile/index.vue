<template>
    <view>
        <lsj-upload
            ref="lsjUpload"
            child-id="upload1"
            :width="width"
            :height="height"
            :option="option"
            :size="size"
            :formats="formats"
            :debug="debug"
            :instantly="instantly"
            @uploadEnd="onuploadEnd"
            @progress="onprogre"
            @change="change"
        >
            <slot>
                <view :style="`width: ${width};height:${height}`">
                    上传
                </view>
            </slot>
        </lsj-upload>
    </view>
</template>

<script>
export default {
    name: 'CheckFile',

    props: {
        // 必传宽高且宽高应与slot宽高保持一致
        width: {
            type: String,
            default: '180rpx'
        },
        height: {
            type: String,
            default: '180rpx'
        },
    },

    data () {
        return {
            // 上传接口参数
            option: {
                // 上传服务器地址，需要替换为你的接口地址
                url: 'http://hl.j56.com/dropbox/document/upload', // 该地址非真实路径，需替换为你项目自己的接口地址
                // 上传附件的key
                name: 'file',
                // 根据你接口需求自定义请求头,默认不要写content-type,让浏览器自适配
                header: {
                    // 示例参数可删除
                    'Authorization': 'bearer eyJhbGciOiJSUzI1NiIsI',
                    'uid': '99',
                    'client': 'app',
                    'accountid': 'DP',
                },
                // 根据你接口需求自定义body参数
                formData: {
                    // 'orderId': 1000
                }
            },
            // 选择文件后是否立即自动上传，true=选择后立即上传
            instantly: false,
            // 限制允许上传的格式，空串=不限制，默认为空
            formats: '',
            // 文件上传大小限制
            size: 30,
            // 文件数量限制
            count: 9,
            // 文件回显列表
            files: new Map(),
            // 微信小程序Map对象for循环不显示，所以转成普通数组，不要问为什么，我也不知道
            wxFiles: [],
            // 是否打印日志
            debug: true,
        };
    },

    mounted () {
        // setTimeout(()=>{
        //     console.log('----演示动态更新参数-----');
        //     this.$refs['lsjUpload'].setData('formData.orderId', '动态设置的参数'); 

        //     console.log('以下注释内容为-动态更新参数更多演示，放开后可查看演示效果');
        //     // 修改option对象的name属性
        //     // this.$refs.lsjUpload.setData('name','myFile');

        //     // 修改option对象的formData内的属性
        //     // this.$refs.lsjUpload.setData('formData.appid','1111');

        //     // 替换option对象的formData
        //     // this.$refs.lsjUpload.setData('formData',{appid:'222'});

        //     // option对象的formData新增属性
        //     // this.$refs.lsjUpload.setData('formData.newkey','新插入到formData的属性');

        //     // ---------演示初始化值，用于已提交后再次编辑时需带入已上传文件-------
        //     // 方式1=传入数组
        //     // let files1 = [{name: '1.png'},{name: '2.png',}];

        //     // 方式2=传入Map对象
        //     // let files2 = new Map();
        //     // files2.set('1.png',{name: '1.png'})

        //     // 此处调用setFiles设置初始files
        //     // this.$refs.lsjUpload.setFiles(files1);
        // }, 2000);
    },

    onReady () {
    },
    methods: {
        /**
         * 某文件上传结束回调(成功失败都回调)
         * @param {Object} item 当前上传完成的文件
         */
        onuploadEnd (item) {
            console.log(`${item.name}已上传结束，上传状态=${item.type}`);

            // 更新当前窗口状态变化的文件
            this.files.set(item.name, item);

            // ---可删除--演示上传完成后取服务端数据
            if (item['responseText']) {
                console.log('演示服务器返回的字符串JSON转Object对象');
                this.files.get(item.name).responseText = JSON.parse(item.responseText);
            }
            
            // 强制更新视图
            this.$forceUpdate();

            // ---可删除--演示判断是否所有文件均已上传成功
            let isAll = [...this.files.values()].find(item=>item.type !== 'success');
            if (!isAll) {
                console.log('已全部上传完毕');
            } else {
                console.log(isAll.name + '待上传');
            }

        },
        /**
         * 上传进度回调
         * 如果网页上md文档没有渲染出事件名称onprogre，请复制代码的小伙伴自行添加上哈，没有哪个事件是只(item)的
         * @param {Object} item 当前正在上传的文件
         */
        onprogre (item) {
            // 更新当前状态变化的文件
            this.files.set(item.name, item);

            console.log('打印对象', JSON.stringify(this.files.get(item.name)));

            // 强制更新视图
            this.$forceUpdate();

        },
        /**
         * 文件选择回调
         * @param {Object} files 已选择的所有文件Map集合
         */
        async change (files) {
            const fileArr = [...files.values()];
            // console.log('当前选择的文件列表：', JSON.stringify(fileArr));
            // // 更新选择的文件 
            // this.files = files;
            // // 强制更新视图
            // this.$forceUpdate();

            // for (let i = 0; i < fileArr.length; i++) {
            //     const base64 = await this.fileToBase64(fileArr[i].file);
            //     console.log('base64', base64);
            // }
            console.log('当前选择的文件列表：', JSON.stringify(fileArr));
            this.$emit('change', fileArr);

        },
        // 手动上传
        upload () {
            // name=指定文件名，不指定则上传所有type等于waiting和fail的文件
            this.$refs['lsjUpload'].upload();
        },
        /**
         * 指定上传某个文件
         * @param {Object} name 带后缀名的文件名称
         */
        resetUpload (name) {
            this.$refs['lsjUpload'].upload(name);
        },
        /**
         * 移除某个文件
         * @param {Object} name 带后缀名的文件名称
         */
        clear (name) {
            // name=指定文件名，不传name默认移除所有文件
            this.$refs['lsjUpload'].clear(name);
        },
        show () {
            console.log('show');
            this.$nextTick(()=>{
                this.$refs.lsjUpload.show();
            });
        },
        hide () {
            console.log('hide');
            this.$nextTick(()=>{
                this.$refs.lsjUpload.hide();
            });
        },
        fileToBase64 (file) {
            console.log('fileToBase64', file);
            return new Promise((resolve, reject) => {
                let fileReader = new plus.io.FileReader();
                fileReader.onload = function (e) {
                    resolve(e.target.result);
                };
                fileReader.onerror = function (err) {
                    console.log('err', err);
                    reject(err);
                };
                fileReader.readAsDataURL(file);
            });
        }
    }

};
</script>

<style lang="scss" scoped>

</style>