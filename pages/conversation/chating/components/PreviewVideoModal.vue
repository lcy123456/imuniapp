<template>
    <u-overlay :show="true" opacity="1">
        <view class="preview_video_container">
            <video class="video_player" :src="previewVideoUrl" />
            <view class="play_action_bar">
                <u-icon
                    size="24"
                    color="#fff"
                    name="close-circle"
                    @click="closeModal"
                />
                <u-icon
                    size="24"
                    color="#fff"
                    name="download"
                    @click="download"
                />
            </view>
        </view>
        <u-toast ref="uToast" />
    </u-overlay>
</template>

<script>
export default {
    name: '',
    components: {},
    props: {
        previewVideoUrl: String
    },
    data() {
        return {
            downloading: false
        };
    },
    methods: {
        closeModal() {
            this.$emit('closeModal');
        },
        download() {
            if (this.downloading) return;
            this.showToast(this.$t('Downloading'), true);
            this.downloading = true;
            uni.downloadFile({
                url: this.previewVideoUrl,
                success: res => {
                    if (res.statusCode === 200) {
                        uni.saveVideoToPhotosAlbum({
                            filePath: res.tempFilePath,
                            success: () => {
                                this.showToast(this.$t('Download_successful'));
                            },
                            fail: () => {
                                this.showToast(
                                    this.$t(
                                        'Save_failed_please_try_again_later'
                                    )
                                );
                            }
                        });
                    } else {
                        this.showToast(this.$t('Download_failed'));
                    }
                },
                fail: () => {
                    this.showToast(this.$t('Download_failed'));
                }
            });
        },
        showToast(message, isLoading = false) {
            if (this.$refs.uToast.isShow) {
                this.$refs.uToast.hide();
            }

            this.$refs.uToast.show({
                message,
                position: 'bottom',
                loading: isLoading,
                type: isLoading ? 'loading' : 'default',
                duration: isLoading ? 6000 : 2000
            });
        }
    }
};
</script>

<style lang="scss">
.preview_video_container {
    height: 100%;

    .video_player {
        height: 50%;
        width: 100%;
        margin-top: 50%;
    }

    .play_action_bar {
        padding: 0 48rpx;
        margin-top: 24rpx;
        display: flex;
        justify-content: space-between;
    }
}
</style>
