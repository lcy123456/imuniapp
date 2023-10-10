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
import {
    MediaRenderTypes
} from '@/constant';
import IMSDK, { IMMethods, MessageType } from "openim-uniapp-polyfill";
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
            imgList: [],
            loadingWidth: '200px',
            imageHeight: 240,
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
        this.getSearchRecord();
    },
    methods: {
        async getSearchRecord () {
            let conversationID = this.$store.getters.storeCurrentConversation.conversationID;
            const params = {
                conversationID: conversationID,
                keywordList: [],
                messageTypeList: MediaRenderTypes,
                searchTimePosition: 0,
                searchTimePeriod: 0,
                pageIndex: 1,
                count: 999,
            };
            const { data } = await IMSDK.asyncApi(
                IMMethods.SearchLocalMessages,
                IMSDK.uuid(),
                params
            );
            let imgList = data.searchResultItems?.[0]?.messageList || [];
            console.log('xxx', data);
            this.imgList = imgList.map((v) => {
                const { contentType, pictureElem, videoElem } = v;
                const isVideo = contentType === MessageType.VideoMessage;
                let map = {
                    url: pictureElem?.sourcePicture.url,
                    poster: pictureElem?.sourcePicture.url,
                    type: 'image',
                };
                if (isVideo) {
                    map = {
                        url: videoElem.videoUrl,
                        poster: videoElem.snapshotUrl,
                        type: 'video',
                    };
                }
                return map;
            });
            this.imgList.reverse();
        },
        clickMediaItem () {
            // if (this.isVideo) {
            //     uni.navigateTo({
            //         url: `/pages/conversation/previewVideo/index?previewVideoUrl=${this.message.videoElem.videoUrl}`
            //     });
            // } else {
            //     uni.previewImage({
            //         current: 0,
            //         urls: [this.imgUrl],
            //         fail (err) {
            //             console.log(err);
            //         }
            //     });
            // }
            console.log(this.imgUrl, this.imgList, '----');
            const index = this.imgList.findIndex(item => item.poster === this.imgUrl) > -1 ? this.imgList.findIndex(item => item.poster === this.imgUrl) : 0;
            uni.$u.route('/pages/common/previewMedia/index', {
                list: encodeURIComponent(JSON.stringify(this.imgList)),
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
