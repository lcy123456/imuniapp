<template>
    <view
        :key="updateKey"
        class="media_message_container"
        :style="{
            height: imageHeight === 'auto' ? imageHeight : imageHeight + 'px'
        }"
        @click="clickMediaItem"
    >
        <!-- <view :style="{height:wrapperHeight}" class="media_message_container"> -->
        <u--image
            :show-loading="true"
            :width="systemInfo.windowWidth * 0.5 + 'px'"
            :height="imageHeight"
            mode="widthFix"
            :src="imgUrl"
            @load="onLoaded"
            @error="onErrored"
            @click="clickMediaItem"
        >
            <template #loading>
                <u-loading-icon color="red" />
            </template>
            <template #error>
                <image class="err_img" src="/static/images/reload.svg" />
            </template>
        </u--image>
        <image
            v-if="isVideo"
            class="play_icon"
            mode="widthFix"
            src="@/static/images/chating_message_video_play.png"
            alt=""
            srcset=""
        />
        <text v-if="isVideo" class="video_duration">
            {{ getDuration }}
        </text>
    </view>
</template>

<script>
import { secFormat, formatFileUrl } from '@/util/imCommon';
import { getPurePath, getPageRoute } from '@/util/common';
import IMSDK, { MessageType } from 'openim-uniapp-polyfill';
import { mapGetters } from 'vuex';
export default {
    name: '',
    props: {
        message: {
            type: Object,
            default: () => ({})
        },
        isSender: {
            type: Boolean,
            default: false
        },
        isQuote: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            imgList: [],
            updateKey: '',
            isError: true,
            imageWidth: '300px',
            imageHeight: 240,
            imgUrl: null,
            systemInfo: uni.getSystemInfoSync()
        };
    },
    computed: {
        ...mapGetters([
            'storeConversationMediaList',
            'storeCurrentConversation'
        ]),
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
    methods: {
        async clickMediaItem() {
            if (this.isError) {
                this.updateKey = +new Date();
                return;
            }
            const page = getPageRoute();
            if ([`pages/conversation/chating/index`].includes(page)) {
                await uni.$emit('getSearchRecordMedia');
                setTimeout(() => {
                    this.goPreviewMedia();
                }, 200);
                return;
            }
            this.goPreviewMedia();
        },
        goPreviewMedia() {
            const i = this.storeConversationMediaList.findIndex(
                item => item.clientMsgID === this.message.clientMsgID
            );
            const index = i > -1 ? i : 0;
            uni.$u.route('/pages/common/previewMedia/index', {
                list: encodeURIComponent(
                    JSON.stringify(this.storeConversationMediaList)
                ),
                current: index
            });
        },
        onLoaded() {
            const { conversationID } = this.storeCurrentConversation;
            const { clientMsgID } = this.message;
            this.imageHeight = 'auto';
            this.isError = false;
            if (
                !this.imgUrl.includes('https://') &&
                !this.imgUrl.includes('http://')
            )
                return;
            if (this.isQuote) return;
            uni.downloadFile({
                url: this.imgUrl,
                success: res => {
                    if (res.statusCode === 200) {
                        IMSDK.asyncApi(
                            IMSDK.IMMethods.SetMessageLocalEx,
                            IMSDK.uuid(),
                            {
                                conversationID,
                                clientMsgID,
                                localEx: getPurePath(res.tempFilePath)
                            }
                        );
                    }
                },
                fail: () => {}
            });
        },
        onErrored() {
            console.log('c u哦。。。。。。错。。。');
            this.isError = true;
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
        max-width: 20%;
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
    .err_img {
        width: 40rpx !important;
        height: 40rpx !important;
    }
}
</style>
