<template>
    <Page>
        <view class="merger_message_container">
            <CustomNavBar :title="mergeTitle.slice(0, -5)" />
            <view
                v-for="v in multiMessage"
                :key="v.clientMsgID"
                class="multi_message_box"
            >
                <MyAvatar
                    size="80rpx"
                    :desc="v.senderNickname"
                    :src="v.senderFaceUrl"
                    class="mr-30"
                />
                <view class="message_box">
                    <view class="message_sender">
                        <text>{{ v.senderNickname }}</text>
                    </view>
                    <MessageContentWrap :message="v" />
                </view>
            </view>
        </view>
    </Page>
</template>

<script>
import CustomNavBar from '@/components/CustomNavBar/index.vue';
import MyAvatar from '@/components/MyAvatar/index.vue';
import MessageContentWrap from '@/pages/conversation/chating/components/MessageItem/MessageContentWrap.vue';
import { MediaRenderTypes } from '@/constant';
export default {
    components: {
        CustomNavBar,
        MyAvatar,
        MessageContentWrap
    },

    data() {
        return {
            message: {}
        };
    },
    computed: {
        mergeElem() {
            return this.message.mergeElem || {};
        },
        mergeTitle() {
            return this.mergeElem.title || '';
        },
        multiMessage() {
            return this.mergeElem.multiMessage || [];
        },
        showMediaRender() {
            return MediaRenderTypes.includes(this.message.contentType);
        }
    },

    onLoad(params) {
        const { message } = params;
        this.message = JSON.parse(decodeURIComponent(message));
        this.getSearchRecordMedia();
    },

    methods: {
        getSearchRecordMedia() {
            const imgList = this.multiMessage.filter(message =>
                MediaRenderTypes.includes(message.contentType)
            );
            uni.$emit('getSearchRecordMedia', imgList);
        }
    }
};
</script>

<style lang="scss" scoped>
.merger_message_container {
    .multi_message_box {
        display: flex;
        padding: 30rpx 30rpx 0;
        .message_box {
            flex: 1;
            overflow: hidden;
            padding: 0 0 30rpx;
            .message_sender {
                margin-bottom: 10rpx;
            }
            border-bottom: 2rpx solid $uni-color-thinGrey;
            /deep/.message_content_wrap {
                .merge_message_container {
                    background-color: $uni-color-thinGrey;
                }
                .text_message_container {
                    padding: 0;
                }
            }
            /deep/.read-content {
                bottom: 0 !important;
            }
        }
    }
}

/deep/ .voice_message_container {
    margin: 10rpx;
    .voice-box {
        // box-shadow: 0px 0px 2px 0px rgba(0, 0, 0, 0.2);
        border: 1px solid #dedede57;
    }
}
/deep/ .file_message_container {
    // box-shadow: 0px 0px 2px 0px rgba(0, 0, 0, 0.2);
    border: 1px solid #dedede57;
    margin: 10rpx;
    width: calc(100% - 10rpx) !important;
}
</style>
