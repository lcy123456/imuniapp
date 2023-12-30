<template>
    <view class="preview_video_container">
        <view class="status-bar-height" />
        <video autoplay class="video_player" :src="previewVideoUrl" />
        <view class="play_action_bar">
            <u-icon size="24" color="#fff" name="close-circle" @click="back" />
            <u-icon size="24" color="#fff" name="download" @click="download" />
        </view>
    </view>
</template>

<script>
export default {
    name: '',
    components: {},
    data() {
        return {
            downloading: false,
            previewVideoUrl: ''
        };
    },
    onLoad(options) {
        this.previewVideoUrl = options.previewVideoUrl;
    },
    methods: {
        back() {
            uni.navigateBack();
        },
        download() {
            if (this.downloading) return;
            this.showToast('下载中', 'loading');
            this.downloading = true;
            uni.downloadFile({
                url: this.previewVideoUrl,
                success: res => {
                    if (res.statusCode === 200) {
                        uni.saveVideoToPhotosAlbum({
                            filePath: res.tempFilePath,
                            success: () => {
                                this.showToast(
                                    '下载成功,已保存到相册',
                                    'success'
                                );
                            },
                            fail: () => {
                                this.showToast('保存失败', 'error');
                            }
                        });
                    } else {
                        this.showToast('下载失败', 'error');
                    }
                },
                fail: () => {
                    this.showToast('下载失败', 'error');
                }
            });
        },
        showToast(message, icon) {
            uni.hideToast();

            uni.showToast({
                title: message,
                duration: 1500,
                icon
            });
        }
    }
};
</script>

<style lang="scss">
.preview_video_container {
    @include colBox(false);
    height: 100vh;

    .video_player {
        flex: 1;
        width: 100%;
    }

    .play_action_bar {
        background-color: #000;
        padding: 24rpx 48rpx 48rpx;
        display: flex;
        justify-content: space-between;
    }
}
</style>
