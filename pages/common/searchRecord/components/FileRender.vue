<template>
    <view
        class="file_render_container"
        @click="handleClick"
        @longpress="handleLongPress"
    >
        <image
            class="w-66 h-76 flex-shrink mr-30"
            src="/static/images/search_record_file.png"
        />
        <view class="main flex-grow h-full flex flex-column justify-center over-hide">
            <text class="fz-30 ff-bold nomalEllipsis">
                {{ fileElem.fileName }}
            </text>
            <view class="text-grey fz-26 flex align-center my-4">
                <image
                    class="w-20 h-22 mr-10"
                    src="/static/images/search_record_download.png"
                />
                <text>{{ bytesToSize(fileElem.fileSize) }}</text>
                <text class="mx-10">
                    ·
                </text>
                <text>{{ dayjs(message.sendTime).format('YYYY-MM-DD HH:mm') }}</text>
            </view>
            <u-line-progress
                :show-text="false"
                :percentage="percentage"
                height="5"
            />
        </view>
    </view>
</template>

<script>
import { bytesToSize } from '@/util/imCommon';
import dayjs from 'dayjs';

export default {
    props: {
        message: {
            type: Object,
            default: () => ({})
        },
    },

    data () {
        return {
            percentage: 0
        };
    },

    computed: {
        fileElem () {
            return this.message.fileElem;
        }
    },

    mounted () {
        
    },

    methods: {
        dayjs,
        bytesToSize,
        async handleClick () {
            this.$loading('加载中');
            const path = await this.handleDownloadFile();
            this.openDoc(path);
        },
        handleDownloadFile () {
            return new Promise((resolve, reject) => {
                uni.downloadFile({
                    url: this.fileElem.sourceUrl,
                    success: (res) => {
                        resolve(res.tempFilePath);
                    },
                    fail: (err) => {
                        reject(err);
                    }
                });
            });
        },
        openDoc (path) {
            uni.openDocument({
                filePath: path,
                success: () => {
                    this.$hideLoading();
                },
                fail: (err) => {
                    console.log('打开文档失败', err);
                    this.$toast('暂不支持的文件格式，请保存到本地进行预览');
                }
            });
        },
        handleLongPress () {
            console.log('handleLongPress');
            uni.showActionSheet({
                itemList: ['保存到本地'],
                success: ({ tapIndex }) => {
                    if (tapIndex === 0) {
                        this.handleSave();
                    }
                },
                fail: function (res) {
                    console.log(res.errMsg);
                }
            });
        },
        async handleSave () {
            const downloadTask = plus.downloader.createDownload(this.fileElem.sourceUrl, {
                filename: 'file:///storage/emulated/0/Download/MuskIM/' + this.fileElem.fileName,
            }, (d, status) => {
                if (status == 200) {
                    let fileSaveUrl = plus.io.convertLocalFileSystemURL(d.filename);
                    this.$toast(`文件已保存到${fileSaveUrl}`, 3000);
                } else {
                    console.log("下载失败");
                    plus.downloader.clear();
                }
            });
            downloadTask.start();//执行下载
            downloadTask.addEventListener("statechanged", this.onStateChanged, false);
        },
        onStateChanged (download) {
            const { downloadedSize, totalSize, state } = download;
            switch (state) {
            case 3:
                this.percentage = parseInt(100 * downloadedSize / totalSize);
                break;
            }
        },
    },
};
</script>

<style lang="scss" scoped>
.file_render_container {
    height: 110rpx;
    display: flex;
    align-items: center;
    .main {
        border-bottom: 2rpx solid $uni-color-thinGrey;
        .u-line-progress {
            flex: initial !important;
        }
    }
}
</style>