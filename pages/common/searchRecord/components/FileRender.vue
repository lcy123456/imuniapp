<template>
    <view
        class="file_render_container"
        @click="handleClick"
        @longpress="handleLongPress"
    >
        <image
            class="flex-shrink w-66 h-76 mr-30"
            src="/static/images/search_record_file.png"
        />
        <view
            class="flex justify-center flex-grow h-full main flex-column over-hide"
        >
            <text class="fz-30 ff-bold nomalEllipsis">
                {{ fileElem.fileName }}
            </text>
            <view class="flex my-4 text-grey fz-26 align-center">
                <image
                    class="w-20 mr-10 h-22"
                    src="/static/images/search_record_download.png"
                />
                <text>{{ bytesToSize(fileElem.fileSize) }}</text>
                <text class="mx-10"> · </text>
                <text>{{
                    dayjs(message.sendTime).format('YYYY-MM-DD HH:mm')
                }}</text>
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
        }
    },

    data() {
        return {
            percentage: 0
        };
    },

    computed: {
        fileElem() {
            return this.message.fileElem;
        }
    },

    mounted() {},

    methods: {
        dayjs,
        bytesToSize,
        async handleClick() {
            this.$loading('加载中');
            let path = this.path;
            if (!path) {
                this.path = path = await this.handleDownloadFile();
            }
            this.openDoc(path);
        },
        handleDownloadFile() {
            return new Promise((resolve, reject) => {
                const downloadTask = uni.downloadFile({
                    url: this.fileElem.sourceUrl,
                    success: res => {
                        resolve(res.tempFilePath);
                    },
                    fail: err => {
                        reject(err);
                    }
                });
                if (plus.os.name === 'iOS') {
                    downloadTask.onProgressUpdate(res => {
                        this.percentage = res.progress;
                    });
                }
            });
        },
        openDoc(path) {
            uni.openDocument({
                filePath: path,
                success: () => {
                    this.$hideLoading();
                },
                fail: err => {
                    console.log('打开文档失败', err);
                    this.$toast('暂不支持的文件格式，请保存到本地进行预览');
                }
            });
        },
        handleLongPress() {
            if (plus.os.name === 'iOS') return;
            uni.showActionSheet({
                itemList: ['保存到本地'],
                success: async ({ tapIndex }) => {
                    if (tapIndex === 0) {
                        this.handleSave();
                    }
                },
                fail: function (res) {
                    console.log(res.errMsg);
                }
            });
        },
        async handleSave() {
            let options = {};
            if (plus.os.name === 'Android') {
                options = {
                    filename:
                        'file:///storage/emulated/0/Download/MuskIM/' +
                        this.fileElem.fileName
                };
            }
            const downloadTask = plus.downloader.createDownload(
                this.fileElem.sourceUrl,
                options,
                (d, status) => {
                    if (status == 200) {
                        let fileSaveUrl = plus.io.convertLocalFileSystemURL(
                            d.filename
                        );
                        this.$toast(`文件已保存到${fileSaveUrl}`, 3000);
                    } else {
                        this.$toast(`文件下载失败`, 3000);
                        plus.downloader.clear();
                    }
                }
            );
            downloadTask.start();
            downloadTask.addEventListener(
                'statechanged',
                this.onStateChanged,
                false
            );
        },
        onStateChanged(download) {
            const { downloadedSize, totalSize, state } = download;
            switch (state) {
                case 3:
                    this.percentage = parseInt(
                        (100 * downloadedSize) / totalSize
                    );
                    break;
            }
        }
    }
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
