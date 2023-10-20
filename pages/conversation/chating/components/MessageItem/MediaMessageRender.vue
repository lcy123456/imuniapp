<template>
    <view
        class="media_message_container"
        :style="{height: imageHeight + 'px'}"
        @click="clickMediaItem"
    >
        <!-- <view :style="{height:wrapperHeight}" class="media_message_container"> -->
        <u--image
            :show-loading="true"
            :width="loadingWidth"
            :height="imageHeight"
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
import { mapGetters } from "vuex";
export default {
    name: "",
    inject: ['getSearchRecord'],
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
            imgList: [],
            loadingWidth: '200px',
            imageHeight: 240,
            imgUrl: ''
        };
    },
    computed: {
        ...mapGetters([
            "storeConversationMediaList",
        ]),
        isVideo () {
            return this.message.contentType === MessageType.VideoMessage;
        },
        getDuration () {
            if (!this.isVideo) {
                return 0;
            }
            return secFormat(this.message.videoElem.duration);
        },
    },
    created () {
        const { pictureElem, videoElem} = this.message;
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
        const imageHeight = (this.isVideo ? videoElem?.snapshotHeight : pictureElem?.sourcePicture.height) || 0;
        if (imageHeight < this.imageHeight) {
            this.imageHeight = imageHeight;
        }
    },
    methods: {
        async clickMediaItem () {
            await this.getSearchRecord();
            const index = this.storeConversationMediaList.findIndex(item => item.poster.includes(this.imgUrl)) > -1 ? this.storeConversationMediaList.findIndex(item => item.poster.includes(this.imgUrl)) : 0;
            uni.$u.route('/pages/common/previewMedia/index', {
                list: encodeURIComponent(JSON.stringify(this.storeConversationMediaList)),
                current: index,
            });
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
