<template>
    <view
        :class="[
            'text_message_container',
            'bg_container',
            'text_message_container_' + message.clientMsgID,
            message.contentType === 117 ? 'isNoEditMsg' : ''
        ]"
        :message="message"
        :change:message="getMessage"
        :text="text"
        :change:text="getText"
    >
        <!-- <mp-html
            :selectable="true"
            :preview-img="false"
            :show-img-menu="false"
            :lazy-load="false"
            :content="getContent"
        /> -->
        <view v-html="getContent" />
        <view
            v-if="giveLike && giveLike.length && isShowLike"
            class="give-like-box"
        >
            <MessageGiveLikeState :message="message" :is-sender="isSender" />
            <view v-html="baseText"></view>
        </view>
        <MessageReadState
            v-if="isShowTime && !onlyMessage"
            :id="`MessageReadState-${message.clientMsgID}`"
            class="read-content"
            :message="message"
            :is-sender="isSender"
        />
    </view>
</template>

<script>
import { parseAt, parseEmoji, parseLink } from '@/util/imCommon';
import { MessageType } from 'openim-uniapp-polyfill';
import { DecryptoAES } from '@/util/crypto';
import MessageReadState from './MessageReadState.vue';
import MessageGiveLikeState from './MessageGiveLikeState.vue';
import { SessionType } from 'openim-uniapp-polyfill';

export default {
    name: 'TextMessageRender',
    components: {
        MessageReadState,
        MessageGiveLikeState
    },
    props: {
        message: {
            type: Object,
            default: () => ({})
        },
        showNickname: {
            type: Boolean,
            default: false
        },
        isSender: {
            type: Boolean,
            default: false
        },
        isSuccessMessage: {
            type: Boolean,
            default: false
        },
        isShowTime: {
            type: Boolean,
            default: true
        },
        isQuote: {
            type: Boolean,
            default: false
        },
        onlyMessage: {
            type: Boolean,
            default: false
        },
        isShowLike: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {};
    },
    computed: {
        giveLike() {
            try {
                const ex = JSON.parse(this.message.ex);
                return ex.giveLike;
            } catch (err) {
                // console.log(err);
            }
            return [];
        },
        clientMsgID() {
            return this.message.clientMsgID;
        },
        isEdit() {
            try {
                const ex = JSON.parse(this.message.ex);
                return ex.type === 'edit';
            } catch (err) {
                return false;
            }
        },
        isGroupRead() {
            try {
                return (
                    this.message.sessionType !== SessionType.Single &&
                    this.message.attachedInfoElem.groupHasReadInfo.hasReadCount
                );
            } catch (err) {
                return false;
            }
        },
        text() {
            const {
                contentType,
                quoteElem,
                atTextElem,
                textElem,
                advancedTextElem
            } = this.message;
            let text = '';
            // TODO：解密文本
            if (contentType === MessageType.QuoteMessage) {
                text = parseLink(parseEmoji(DecryptoAES(quoteElem?.text)));
            } else if (contentType === MessageType.AtTextMessage) {
                text = parseLink(parseEmoji(parseAt(atTextElem)));
            } else if (contentType === 117) {
                text = parseLink(
                    parseEmoji(DecryptoAES(advancedTextElem?.text))
                );
            } else {
                text = parseLink(parseEmoji(DecryptoAES(textElem?.content)));
            }
            text = text.replace(/\n/g, '<br>');
            return text;
        },
        baseText() {
            return !this.isQuote
                ? `
            <view class="base-box hide-css">
                <img
                    style="display: ${this.message.pinMap ? 'inherit' : 'none'}"
                    class="pined"
                    src="/static/images/pin2.png"
                />
                <div class="text read_state ${
                    this.isSender ? 'isSender' : 'notisSender'
                } ${this.message.pinMap ? 'isPin' : ''}">
                    <text
                        style="display: ${this.isEdit ? 'inline' : 'none'}"
                        class="edit"
                    >
                        ${'已编辑 '}
                    </text>
                    00:00
                </div>
                <img
                    style="display: ${this.isSender ? 'inherit' : 'none'}"
                    class="read"
                    src="/static/images/message_issend.png"
                />
            </view>
            `
                : ``;
        },
        getContent() {
            const { senderNickname } = this.message;
            let text = this.text;
            if (this.showNickname) {
                text = senderNickname + '：' + text;
            }
            return `${text}${this.baseText}`;
        }
    },
    mounted() {},
    methods: {}
};
</script>

<style lang="scss" scoped>
/deep/.hide-css {
    visibility: hidden;
}
.text_message_container {
    max-width: 100%;
    overflow: hidden;
    word-break: break-all;
    align-items: flex-end;
    user-select: none;
    -webkit-user-select: none;
    position: relative;
    &.isNoEditMsg {
        background: #ffeb95 !important;
    }
}
.give-like-box {
    max-width: 100%;
    display: flex;
    overflow: hidden;
}
/deep/.read-content {
    position: absolute;
    right: 20rpx;
    bottom: 20rpx;
}

/deep/.base-box {
    width: max-content;
    display: inline-flex;
    align-items: center;
    .read_state {
        // font-size: 26rpx;
        font-size: 12px;
        color: #43d100 !important;
        margin-left: 20rpx;
        min-width: 50rpx;
        &.notisSender {
            color: #ccc !important;
        }
        &.isPin {
            margin-left: 0;
        }
    }
    .text {
        width: max-content;
        font-size: 12px;
        color: #43d100 !important;
    }
    .read {
        width: 26rpx;
        height: 18rpx;
        margin: 0 10rpx;
        width: 30rpx;
    }
    .pined {
        width: 27rpx;
        height: 27rpx;
        margin: 0 5px;
        margin-left: 20rpx;
    }
}
</style>
