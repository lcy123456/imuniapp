<template>
    <view
        class="file_message_container bg_container flex align-center"
        @click="clickFileItem"
    >
        <image
            class="flex-shrink w-84 h-84 mr-20"
            src="@/static/images/chating_message_file.png"
        />
        <view class="right flex flex-column">
            <text class="mb-10">
                {{ fileElem.fileName }}
            </text>
            <text class="primary">
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
        return {};
    },
    computed: {
        fileElem () {
            return this.message.fileElem;
        }
    },
    methods: {
        bytesToSize,
        clickFileItem () {
            uni.downloadFile({
                url: this.fileElem.sourceUrl,
                success: function (res) {
                    const path = res.tempFilePath;
                    uni.openDocument({
                        filePath: path,
                        fail: function (err) {
                            console.log('打开文档失败', err);
                            this.$toast('暂不支持的文件格式，请保存到本地进行预览');
                        }
                    });
                }
            });
        },
    },
};
</script>

<style lang="scss" scoped>
.file_message_container {
    width: 100%;
    padding: 24rpx;
    .right {
        width: 100vw;
    }
}
</style>
