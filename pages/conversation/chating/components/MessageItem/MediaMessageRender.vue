<template>
    <view
        class="media_message_container"
        @click="clickMediaItem"
    >
        <!-- <view :style="{height:wrapperHeight}" class="media_message_container"> -->
        <u--image
            :show-loading="true"
            :width="loadingWidth"
            :height="maxHeight"
            mode="heightFix"
            :src="imgUrl"
            @load="onLoaded"
            @click="clickMediaItem"
        >
            <template #loading>
                <u-loading-icon color="red" />
            </template>
        </u--image>
        <image
            v-if="isVideo"
            class="play_icon"
            src="@/static/images/chating_message_video_play.png"
            alt=""
            srcset=""
        />
        <text
            v-if="isVideo"
            class="video_duration"
        >
            {{ getDuration }}
        </text>
    </view>
</template>

<script>
import {
    secFormat
} from "@/util/imCommon";
import { MessageType } from "openim-uniapp-polyfill";
export default {
    name: "",
    props: {
        message: {
            type: Object,
            default: () => ({})
        },
        isSender: {
            type: Boolean,
            default: false
        }
    },
    data () {
        return {
            loadingWidth: '200px',
            imgUrl: ''
        };
    },
    computed: {
        isVideo () {
            return this.message.contentType === MessageType.VideoMessage;
        },
        getDuration () {
            if (!this.isVideo) {
                return 0;
            }
            return secFormat(this.message.videoElem.duration);
        },
        maxHeight () {
            const imageHeight = this.isVideo ? this.message.videoElem.snapshotHeight : this.message.pictureElem
                .sourcePicture.height;
            return (imageHeight || 0) > 240 ? 240 : imageHeight;
        }
    },
    created () {
        let filePath = this.message.pictureElem?.sourcePath;
        if (this.isVideo) {
            filePath = this.message.videoElem?.snapshotPath;
        }
        uni.getFileInfo({
            filePath,
            success: () => {
                this.imgUrl = this.message.pictureElem?.sourcePath;
                if (this.isVideo) {
                    this.imgUrl = this.message.videoElem?.snapshotPath;
                }
            },
            fail: () => {
                this.imgUrl = this.message.pictureElem?.sourcePicture.url;
                if (this.isVideo) {
                    this.imgUrl = this.message.videoElem?.snapshotUrl;
                }
            }
        });
    },
    methods: {
        clickMediaItem () {
            if (this.isVideo) {
                uni.navigateTo({
                    url: `/pages/conversation/previewVideo/index?previewVideoUrl=${this.message.videoElem.videoUrl}`
                });
            } else {
                uni.previewImage({
                    current: 0,
                    urls: [this.imgUrl],
                    fail (err) {
                        console.log(err);
                    }
                });
            }
        },
        onLoaded () {
            this.loadingWidth = 'auto';
        }
    }
};
</script>

<style lang="scss" scoped>
	.media_message_container {
		position: relative;
		border-radius: 16rpx;
		overflow: hidden;

		.play_icon {
			width: 48px;
			height: 48px;
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
		}

		.video_duration {
			position: absolute;
			bottom: 12rpx;
			right: 24rpx;
			color: #fff;
		}
	}
</style>
