<template>
    <view
        class="file_message_container bg_container"
        @click="clickFileItem"
    >
        <image
            class="flex-shrink w-84 h-84 mr-20"
            src="@/static/images/chating_message_file.png"
        />
        <view class="right flex flex-column">
            <text class="nomalEllipsis">
                {{ fileElem.fileName }}
            </text>
            <text class="primary file_size mt-10">
                {{ bytesToSize(fileElem.fileSize) }}
            </text>
        </view>
    </view>
</template>

<script>
import { bytesToSize } from '@/util/imCommon';

export default {
    name: '',
    props: {
        message: Object,
    },
    data () {
        return {
            path: ''
        };
    },
    computed: {
        fileElem () {
            return this.message.fileElem;
        }
    },
    methods: {
        bytesToSize,
        clickFileItem () {
            this.$loading('加载中');
            if (this.path) {
                this.openDoc(this.path);
            } else {
                uni.downloadFile({
                    url: this.fileElem.sourceUrl,
                    success: (res) => {
                        const path = this.path = res.tempFilePath;
                        this.openDoc(path);
                    },
                    complete: () => {
                        this.$hideLoading();
                    }
                });
            }
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
        }
    },
};
</script>

<style lang="scss" scoped>
.file_message_container {
    width: 100%;
    padding: 24rpx;
    display: flex;
    align-items: center;
    .right {
        width: 100vw;
        overflow: hidden;
    }
}
</style>
