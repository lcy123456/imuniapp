<template>
    <view class="preview_video_container">
        <video
            autoplay
            class="video_player"
            :src="previewVideoUrl"
        />
        <view class="play_action_bar">
            <u-icon
                size="24"
                color="#fff"
                name="close-circle"
                @click="back"
            />
            <u-icon
                size="24"
                color="#fff"
                name="download"
                @click="download"
            />
        </view>
        <u-toast ref="uToast" />
    </view>
</template>

<script>
export default {
    name: "",
    components: {},
    data () {
        return {
            downloading: false,
            previewVideoUrl: "",
        };
    },
    onLoad (options) {
        this.previewVideoUrl = options.previewVideoUrl;
    },
    methods: {
        back () {
            uni.navigateBack();
        },
        download () {
            if (this.downloading) return;
            this.showToast('下载中', "loading");
            this.downloading = true;
            uni.downloadFile({
                url: this.previewVideoUrl,
                success: (res) => {
                    if (res.statusCode === 200) {
                        uni.saveVideoToPhotosAlbum({
                            filePath: res.tempFilePath,
                            success: () => {
                                this.showToast('下载成功,已保存到相册', "success");
                            },
                            fail: () => {
                                this.showToast("保存失败", "error");
                            }
                        });
                    } else {
                        this.showToast("下载失败", "error");
                    }
                },
                fail: () => {
                    this.showToast("下载失败", "error");
                }
            });
        },
        showToast (message, icon) {
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
		background-color: #000;

		.video_player {
			flex: 1;
			// height: 80%;
			width: 100%;
			// margin-top: 50%;
		}

		.play_action_bar {
			padding: 24rpx 48rpx 48rpx;
			// margin-top: 24rpx;
			display: flex;
			justify-content: space-between;
		}
	}
</style>
