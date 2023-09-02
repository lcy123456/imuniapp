<template>
    <view
        v-if="!getNoticeContent"
        :id="`auchor${source.clientMsgID}`"
        class="message_item"
        :class="{ message_item_self: isSender }"
    >
        <MyAvatar
            v-if="!(isSingle || isSender)"
            size="80rpx"
            :desc="source.senderNickname"
            :src="source.senderFaceUrl"
            shape="circle"
            class="my_avatar"
            @click="showInfo"
        />
        <view class="message_container">
            <view 
                v-if="!(isSingle || isSender)"
                class="message_sender"
            >
                <text>{{ source.senderNickname }}</text>
            </view>
            <MessageContentWrap
                :message="source"
                @longpress.prevent.native="showMenu"
            />
            <MessageReadState
                v-if="isSender && isSuccessMessage"
                :message="source"
            />

            <transition name="fade">
                <MessageMenu
                    v-if="menuState.visible"
                    :message="source"
                    :is-sender="isSender"
                    :is-bottom="menuState.isBottom"
                    :pater-width="menuState.paterWidth"
                    @close="menuState.visible = false"
                />
            </transition>
        </view>
        <view class="message_send_state">
            <u-loading-icon v-if="showSending" />
            <image
                v-if="isFailedMessage"
                src="@/static/images/chating_message_failed.png"
                @click="reSendMessage"
            />
        </view>
    </view>

    <view
        v-else
        :id="`auchor${source.clientMsgID}`"
        class="notice_message_container"
    >
        <text>{{ getNoticeContent }}</text>
    </view>
</template>

<script>
import IMSDK, {
    IMMethods,
    MessageStatus,
    MessageType,
    SessionType,
} from 'openim-uniapp-polyfill';
import MyAvatar from '@/components/MyAvatar/index.vue';
import ChatingList from '../ChatingList.vue';
import MessageContentWrap from './MessageContentWrap.vue';
import MessageMenu from './MessageMenu.vue';
import MessageReadState from './MessageReadState.vue';
import { noticeMessageTypes, UpdateMessageTypes } from '@/constant';
import { tipMessaggeFormat, offlinePushInfo } from '@/util/imCommon';

const textRenderTypes = [
    MessageType.TextMessage,
    MessageType.AtTextMessage,
    MessageType.QuoteMessage,
];

const mediaRenderTypes = [MessageType.VideoMessage, MessageType.PictureMessage];
const FileRenderTypes = [MessageType.FileMessage];

export default {
    components: {
        MyAvatar,
        MessageContentWrap,
        MessageMenu,
        MessageReadState,
    },
    props: {
        source: {
            required: true,
            type: Object,
        },
        isSender: {
            type: Boolean,
            default: false,
        },
        menuOutsideFlag: {
            required: true,
            type: Number,
        },
    },
    data () {
        return {
            menuState: {
                visible: false,
                isBottom: false,
                paterWidth: false,
                sendingDelay: true,
            },
            conversationID: '',
        };
    },
    computed: {
        isSingle () {
            return this.source.sessionType === SessionType.Single;
        },
        showTextRender () {
            return textRenderTypes.includes(this.source.contentType);
        },
        showMediaRender () {
            return mediaRenderTypes.includes(this.source.contentType);
        },
        showFileRender () {
            return FileRenderTypes.includes(this.source.contentType);
        },
        isSuccessMessage () {
            return this.source.status === MessageStatus.Succeed;
        },
        isFailedMessage () {
            return this.source.status === MessageStatus.Failed;
        },
        showSending () {
            return (
                this.source.status === MessageStatus.Sending &&
                !this.sendingDelay
            );
        },
        getNoticeContent () {
            const isNoticeMessage = noticeMessageTypes.includes(
                this.source.contentType
            );
            return !isNoticeMessage
                ? ''
                : tipMessaggeFormat(
                    this.source,
                    this.$store.getters.storeCurrentUserID
                );
        },
    },
    watch: {
        menuOutsideFlag () {
            if (this.menuState.visible) {
                this.menuState.visible = false;
            }
        },
    },
    mounted () {
        this.$emit('messageItemRender', this.source.clientMsgID);
        this.isReadObserver();
        this.setSendingDelay();
        this.conversationID =
            this.$store.getters.storeCurrentConversation.conversationID;
    },
    methods: {
        reSendMessage () {
            this.$store.dispatch('message/updateOneMessage', {
                message: this.source,
                type: UpdateMessageTypes.KeyWords,
                keyWords: [
                    {
                        key: 'status',
                        value: MessageStatus.Sending,
                    },
                ],
            });
            IMSDK.asyncApi(IMMethods.SendMessage, IMSDK.uuid(), {
                recvID: this.source.recvID,
                groupID: this.source.groupID,
                message: this.source,
                offlinePushInfo,
            })
                .then(({ data }) => {
                    this.$store.dispatch('message/updateOneMessage', {
                        message: data,
                        isSuccess: true,
                    });
                })
                .catch(({ data, errCode }) => {
                    this.$store.dispatch('message/updateOneMessage', {
                        message: data,
                        type: UpdateMessageTypes.KeyWords,
                        keyWords: [
                            {
                                key: 'status',
                                value: MessageStatus.Failed,
                            },
                            {
                                key: 'errCode',
                                value: errCode,
                            },
                        ],
                    });
                });
        },
        async showMenu () {
            uni.createSelectorQuery()
                .in(this)
                .select('.message_content_wrap')
                .boundingClientRect((res) => {
                    this.menuState.paterWidth = res.width;
                    this.menuState.isBottom = res.top < 250;
                    this.menuState.visible = true;
                })
                .exec();
        },
        setSendingDelay () {
            if (this.source.status === MessageStatus.Sending) {
                setTimeout(() => {
                    this.sendingDelay = false;
                }, 2000);
            }
        },
        isReadObserver () {
            if (
                this.isSender ||
                this.source.isRead === true ||
                this.source.sessionType !== SessionType.Single
            ) return;

            const observer = uni.createIntersectionObserver(ChatingList);
            observer
                .relativeTo('#scroll_view')
                .observe(
                    `#auchor${this.source.clientMsgID}`,
                    ({ intersectionRatio }) => {
                        if (intersectionRatio > 0) {
                            if (
                                !noticeMessageTypes.includes(
                                    this.source.contentType
                                )
                            ) {
                                IMSDK.asyncApi(
                                    IMSDK.IMMethods.MarkMessagesAsReadByMsgID,
                                    IMSDK.uuid(),
                                    {
                                        conversationID:
                                            this.$store.getters
                                                .storeCurrentConversation
                                                .conversationID,
                                        clientMsgIDList: [
                                            this.source.clientMsgID,
                                        ],
                                    }
                                // eslint-disable-next-line vue/no-mutating-props
                                ).then(() => (this.source.isRead = true));
                            }

                            observer.disconnect();
                        }
                    }
                );
        },
        showInfo () {
            if (this.isSender) return;
            uni.$u.route(
                `/pages/common/userCard/index?sourceID=${this.source.sendID}`
            );
        },
    },
};
</script>

<style scoped lang="scss">
.message_item {
    display: flex;
    padding: 16rpx 0;

    .my_avatar {
        margin-right: 24rpx;
    }

    .message_container {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        max-width: 80%;
        position: relative;

        .message_sender {
            @include nomalEllipsis();
            max-width: 480rpx;
            font-size: 24rpx;
            color: #666;
            margin-bottom: 6rpx;
        }
    }

    .message_send_state {
        align-self: center;
        @include centerBox();
        margin-left: 12rpx;
        width: 48rpx;
        height: 48rpx;

        image {
            width: 16px;
            height: 16px;
        }
    }

    /deep/.emoji_display {
        width: 24px;
        height: 18px;
        vertical-align: sub;
    }

    &_self {
        flex-direction: row-reverse;

        .message_container {
            align-items: flex-end;

            .message_content_wrap {
                .bg_container {
                    background-color: #c5e3ff !important;
                }
            }
        }

        .message_send_state {
            margin-left: 0rpx;
            margin-right: 12rpx;
        }
    }
}

.notice_message_container {
    @include ellipsisWithLine(2);
    text-align: center;
    margin: 24rpx 48rpx;
    // font-size: 24rpx;
    font-size: 0.85rem;
    color: #999;
}

.fade-leave,
.fade-enter-to {
    opacity: 1;
}

.fade-leave-active,
.fade-enter-active {
    transition: all 0.5s;
}

.fade-leave-to,
.fade-enter {
    opacity: 0;
}
</style>
