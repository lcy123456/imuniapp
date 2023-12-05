<template>
    <view :class="['quote_message_container', showDetail && 'quote_detail']">
        <TextMessageRender
            v-if="showTextRender"
            :message="message"
            :is-show-time="false"
            :show-nickname="showDetail"
        />
        <view
            v-else-if="showDetail"
            class="flex"
        >
            <view class="name_box">
                {{ message.senderNickname }}：
                <template v-if="!(showMediaRender || showFileRender)">
                    {{ getQuoteText }}
                </template>
            </view>
            <MediaMessageRender
                v-if="showMediaRender"
                :message="message"
            />
            <FileMessageRender
                v-else-if="showFileRender"
                :message="message"
            />
        </view>
        <view v-else>
            {{ getQuoteText }}
        </view>
    </view>
</template>

<script>
import { MessageType } from 'openim-uniapp-polyfill';
import { 
    TextRenderTypes,
    MediaRenderTypes,
    FileRenderTypes,
} from '@/constant';
import TextMessageRender from '@/pages/conversation/chating/components/MessageItem/TextMessageRender.vue';
import MediaMessageRender from '@/pages/conversation/chating/components/MessageItem/MediaMessageRender.vue';
import FileMessageRender from '@/pages/conversation/chating/components/MessageItem/FileMessageRender.vue';

export default {
    components: {
        TextMessageRender,
        MediaMessageRender,
        FileMessageRender
    },

    props: {
        message: {
            type: Object,
            default: () => ({})
        },
        showDetail: {
            type: Boolean,
            default: false
        },
        originType: {
            type: String,
            default: ''
        }
    },
    data () {
        return {
            MessageType: Object.freeze(MessageType)
        };
    },
    
    computed: {
        contentType () {
            return this.message.contentType;
        },
        showTextRender () {
            return TextRenderTypes.includes(this.contentType);
        },
        showMediaRender () {
            return MediaRenderTypes.includes(this.contentType);
        },
        showFileRender () {
            return FileRenderTypes.includes(this.contentType);
        },
        getQuoteText () {
            switch (this.contentType) {
            case MessageType.PictureMessage:
                return '[图片]';
            case MessageType.VideoMessage:
                return '[视频]';
            case MessageType.FileMessage:
                return '[文件]';
            case MessageType.MergeMessage:
                if (this.originType === 'merge_record') {
                    return '[聊天记录]';
                }
                return `[聊天记录]${this.message.mergeElem.title}`;
            case MessageType.RevokeMessage:
                return '[引用内容已撤回]';
            default:
                return '';
            }
        }
    },

    methods: {
        
    },
};
</script>

<style lang="scss" scoped>
.quote_message_container {

    /deep/.text_message_container {
        padding: 0;
        & > view {
            @include ellipsisWithLine(1);
        }
    }
    .name_box {
        @include ellipsisWithLine(2);
    }
}
.quote_detail {
    width: fit-content;
    max-width: 100%;
    padding: 16rpx;
    margin-top: 10rpx;
    background-color: $uni-bg-color-grey;
    border-radius: 16rpx;
    width: fit-content;
    /deep/.text_message_container > view {
        @include ellipsisWithLine(2);
    }
    /deep/.media_message_container {
        width: 80rpx !important;
        height: 80rpx !important;
        .u-image {
            height: 80rpx !important;
            align-items: center;
        }
        .play_icon {
            width: 30rpx;
            height: 30rpx;
        }
        .video_duration {
            display: none;
        }
    }
    /deep/.file_message_container {
        flex: 1;
        overflow: hidden;
        padding: 0;
        align-items: flex-start;
        flex-direction: row-reverse;
        image {
            width: 70rpx;
            height: 70rpx;
            margin: 0 0 0 20rpx;
        }
        .right {
            width: auto;
            .file_size {
                display: none;
            }
        }
    }
}
</style>