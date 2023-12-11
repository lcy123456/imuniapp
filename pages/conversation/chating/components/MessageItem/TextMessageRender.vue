<template>
    <view
        :class="['text_message_container', 'bg_container' , 'text_message_container_' + message.clientMsgID]"
        :message="message"
        :change:message="getMessage"
    >
        <!-- <mp-html
            :selectable="true"
            :preview-img="false"
            :show-img-menu="false"
            :lazy-load="false"
            :content="getContent"
        /> -->
        <view v-html="getContent" />
        <MessageReadState
            v-if="isShowTime"
            :id="`MessageReadState-${message.clientMsgID}`"
            class="read-content"
            :message="message"
            :is-sender="isSender"
        />
    </view>
</template>

<script>
import { parseAt, parseEmoji } from "@/util/imCommon";
import { MessageType } from "openim-uniapp-polyfill";
import { DecryptoAES } from '@/util/crypto';
import MessageReadState from './MessageReadState.vue';
import { SessionType } from 'openim-uniapp-polyfill';

export default {
    name: "TextMessageRender",
    components: {
        MessageReadState
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
        }
    },
    data () {
        return {
        };
    },
    computed: {
        clientMsgID () {
            return this.message.clientMsgID;
        },
        isEdit () {
            try {
                const ex = JSON.parse(this.message.ex);
                return ex.type === 'edit';
            } catch (err) {
                return false;
            }
        },
        isGroupRead () {
            try {
                return this.message.sessionType !== SessionType.Single && this.message.attachedInfoElem.groupHasReadInfo.hasReadCount;
            } catch (err) {
                return false;
            }
        },
        getContent () {
            const { contentType, quoteElem, atTextElem, textElem, senderNickname } = this.message;
            const baseText = !this.isQuote ? `
            <view class="base-box hide-css">
                <img
                    style="display: ${this.message.pinMap ? 'inherit' : 'none'}"
                    class="pined"
                    src="/static/images/pin2.png"
                />
                <div class="text read_state ${this.isSender ? 'isSender' : 'notisSender'} ${this.message.pinMap ? 'isPin' : ''}">
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
                <div
                    style="display: ${this.isSender && this.isGroupRead ? 'inherit' : 'none'}"
                    class="text"
                >
                    0人
                </div>
            </view>
            ` : ``;
            let text = '';
            // TODO：解密文本
            if (contentType === MessageType.QuoteMessage) {
                text = parseEmoji(DecryptoAES(quoteElem?.text));
            } else if (contentType === MessageType.AtTextMessage) {
                text = parseEmoji(parseAt(atTextElem));
            } else {
                text = parseEmoji(DecryptoAES(textElem?.content));
            }
            text = text.replace(/\n/g, '<br>');
            if (this.showNickname) {
                text = senderNickname + '：' + text;
            }
            return `${text}${baseText}`;
        },
    },
    created () {
    },
    methods: {
        goPerson ({ id }) {
            uni.$u.route(
                `/pages/common/userCard/index?sourceID=${id}`
            );
        }
    }
};
</script>

<script module="textMessageRender" lang="renderjs">
	export default {
        data () {
            return {
                message: {}
            }
        },
		mounted () {
            this.setClick();
        },
        methods: {
            getMessage (message) {
                this.message = message;
            },
            setClick () {
                const { contentType, atTextElem, clientMsgID} = this.message;
                if (contentType !== 106) return;
                atTextElem.atUserList.forEach(id => {
                    if (id === '999999999') return;
                    let atMember = document.querySelector(`.text_message_container_${clientMsgID} #at_member_${id}`);
                    if (atMember) {
                        atMember.addEventListener('click', () => {
                            this.$ownerInstance.callMethod('goPerson', {
                                id: atMember.id.match(/\d+/)[0]
                            })
                        })  
                    }
                });
            }
        }
	}
</script>

<style lang="scss" scoped>
/deep/.hide-css {
    visibility: hidden;
}
.text_message_container {
    overflow: hidden;
    word-break: break-all;
    display: flex;
    align-items: flex-end;
    user-select: none;
    -webkit-user-select: none;
    position: relative;
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
        color: #43D100!important;
        margin-left: 20rpx;
        min-width: 50rpx;
        &.notisSender {
            color: #ccc!important;
        }
        &.isPin {
            margin-left: 0;
        }
    }
    .text {
        width: max-content;
        font-size: 12px;
        color: #43D100!important;
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
