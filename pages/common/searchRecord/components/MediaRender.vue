<template>
    <view
        class="media_container"
        :style="{
            width: size + 'px',
            height: size + 'px'
        }"
        @click="$emit('click')"
    >
        <MyImage
            :width="size"
            :height="size"
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
import { secFormat, formatFileUrl } from '@/util/imCommon';
import { MessageType } from 'openim-uniapp-polyfill';
import MyImage from '@/components/MyImage';

export default {
    components: {
        MyImage
    },
    props: {
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
        const { pictureElem, videoElem, localEx } = this.message;
        let filePath = pictureElem?.sourcePath;
        if (this.isVideo) {
            filePath = videoElem?.snapshotPath;
        }
        filePath = localEx || filePath;
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
                this.imgUrl = formatFileUrl(this.imgUrl);
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
