<template>
    <view
        class="file_render_container"
        @click="handleClick"
    >
        <!-- @longpress="handleLongPress" -->
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
                v-show="percentage"
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
            isPreview: false,
            path: '',
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
            !this.path && await this.handleDownloadFile();
            this.openDoc();
        },
        handleDownloadFile () {
            return new Promise((resolve, reject) => {
                const downloadTask = uni.downloadFile({
                    url: this.fileElem.sourceUrl,
                    success: (res) => {
                        const path = this.path = res.tempFilePath;
                        console.log('下载成功', path);
                        resolve(path);
                    },
                    fail: (err) => {
                        reject(err);
                    }
                });
                downloadTask.onProgressUpdate(res => {
                    console.log('下载进度', res.progress);
                    this.percentage = res.progress;
                });
            });
        },
        openDoc () {
            uni.openDocument({
                filePath: this.path,
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
            !this.path && await this.handleDownloadFile();
            uni.saveFile({
                tempFilePath: this.path,
                success: ({savedFilePath}) => {
                    console.log('savedFilePath', savedFilePath);
                    this.path = savedFilePath;
                    this.$toast('保存成功');
                }
            });
        }
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