<template>
    <view
        class="media_container"
        :style="{ height: size + 'px' }"
        @click="$emit('click')"
    >
        <u--image
            :width="size"
            :height="size"
            :mode="mode"
            :src="imgUrl"
            @click="$emit('click')"
        />
        <template v-if="isVideo">
            <image
                class="play_icon"
                src="@/static/images/chating_message_video_play.png"
            />
            <text class="video_duration">
                {{ getDuration }}
            </text>
        </template>
    </view>
</template>

<script>
import { secFormat } from '@/util/imCommon';
import { MessageType } from 'openim-uniapp-polyfill';

export default {
    props: {
        mode: {
            type: String,
            default: undefined
        },
        message: {
            type: Object,
            default: () => ({})
        },
        size: {
            type: Number,
            default: 120 // px
        }
    },
    data() {
        return {
            imgUrl: ''
        };
    },
    computed: {
        isVideo() {
            return this.message.contentType === MessageType.VideoMessage;
        },
        getDuration() {
            if (!this.isVideo) {
                return 0;
            }
            return secFormat(this.message.videoElem.duration);
        }
    },
    created() {
        const { pictureElem, videoElem } = this.message;
        let filePath = pictureElem?.sourcePath;
        if (this.isVideo) {
            filePath = videoElem?.snapshotPath;
        }
        uni.getFileInfo({
            filePath,
            success: () => {
                this.imgUrl = filePath;
            },
            fail: () => {
                this.imgUrl = pictureElem?.sourcePicture.url;
                if (this.isVideo) {
                    this.imgUrl = videoElem?.snapshotUrl;
                }
            }
        });
    },
    methods: {}
};
</script>

<style lang="scss" scoped>
.media_container {
    position: relative;
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
