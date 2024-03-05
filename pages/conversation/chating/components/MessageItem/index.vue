<template>
    <view>
        <view
            v-if="!isNoticeMessage"
            class="message_item"
            :class="{
                message_item_self: isSender,
                positionActive: positionMsgID === source.clientMsgID
            }"
            @click="handleMultiple"
        >
            <view
                v-show="isMultipleMsg"
                class="check_wrap"
                :class="{ check_wrap_active: isChecked }"
            >
                <u-icon
                    v-show="isChecked"
                    name="checkbox-mark"
                    size="12"
                    color="#fff"
                />
            </view>
            <view class="item_right">
                <EventDom
                    class="avatar-box"
                    @click="showInfo"
                    @longpress="avatarLongpress"
                >
                    <MyAvatar
                        v-if="!(isSingle || isSender)"
                        :key="`auchor${source.clientMsgID}-MyAvatar`"
                        size="80rpx"
                        :font-size="14"
                        :desc="getName(source)"
                        :src="source.senderFaceUrl"
                        shape="circle"
                        class="my_avatar"
                    />
                </EventDom>
                <view class="message_container">
                    <view v-if="!(isSingle || isSender)" class="message_sender">
                        <text>{{ getName(source) }}</text>
                    </view>
                    <MessageContentWrap
                        :message="source"
                        :is-multiple-msg="isMultipleMsg"
                        :is-success-message="isSuccessMessage"
                        :is-sender="isSender"
                        :show-sending="showSending"
                        :is-failed-message="isFailedMessage"
                        :is-show-like="true"
                        @longpress.prevent.native="handleLongPress"
                    />
                </view>
                <view class="message_send_state">
                    <image
                        v-if="isFailedMessage"
                        src="@/static/images/chating_message_failed.png"
                        @click="reSendMessage"
                    />
                </view>
            </view>
        </view>

        <view
            v-if="isNoticeMessage"
            :id="`auchor${source.clientMsgID}`"
            class="notice_message_container"
        >
            <text>{{ getNoticeContent }}</text>
        </view>
    </view>
</template>

<script>
import IMSDK, {
    IMMethods,
    MessageStatus,
    SessionType
} from 'openim-uniapp-polyfill';
import MyAvatar from '@/components/MyAvatar/index.vue';
import ChatingList from '../ChatingList.vue';
import { mapGetters } from 'vuex';
import MessageContentWrap from './MessageContentWrap.vue';
// import MessageReadState from './MessageReadState.vue';
import {
    noticeMessageTypes,
    UpdateMessageTypes,
    MessageMenuTypes
} from '@/constant';
import { tipMessaggeFormat, offlinePushInfo, getName } from '@/util/imCommon';

export default {
    components: {
        MyAvatar,
        MessageContentWrap
        // MessageReadState,
    },
    props: {
        source: {
            type: Object,
            default: () => ({})
        },
        isSender: {
            type: Boolean,
            default: false
        },
        isShowMenuFlag: {
            type: Boolean,
            default: false
        },
        isMultipleMsg: {
            type: Boolean,
            default: false
        },
        isChecked: {
            type: Boolean,
            default: false
        },
        positionMsgID: {
            type: String,
            default: ''
        }
    },
    data() {
        return {
            islongPress: false,
            conversationID: ''
        };
    },
    computed: {
        ...mapGetters(['storeFriendList']),
        isSingle() {
            return this.source.sessionType === SessionType.Single;
        },
        isSuccessMessage() {
            return this.source.status === MessageStatus.Succeed;
        },
        isFailedMessage() {
            return this.source.status === MessageStatus.Failed;
        },
        showSending() {
            return (
                this.source.status === MessageStatus.Sending &&
                !this.sendingDelay
            );
        },
        isNoticeMessage() {
            return noticeMessageTypes.includes(this.source.contentType);
        },
        getNoticeContent() {
            return tipMessaggeFormat(
                this.source,
                this.$store.getters.storeCurrentUserID
            );
        }
    },
    mounted() {
        this.isReadObserver();
        this.setSendingDelay();
        this.conversationID =
            this.$store.getters.storeCurrentConversation.conversationID;
    },
    methods: {
        getName,
        avatarLongpress() {
            const atUsersInfo = {
                atUserID: this.source.sendID,
                groupNickname: this.source.senderNickname
            };
            uni.$emit('setAtMember', atUsersInfo);
        },
        reSendMessage() {
            this.$store.dispatch('message/updateOneMessage', {
                message: this.source,
                type: UpdateMessageTypes.KeyWords,
                keyWords: [
                    {
                        key: 'status',
                        value: MessageStatus.Sending
                    }
                ]
            });
            IMSDK.asyncApi(IMMethods.SendMessage, IMSDK.uuid(), {
                recvID: this.source.recvID,
                groupID: this.source.groupID,
                message: this.source,
                offlinePushInfo
            })
                .then(({ data }) => {
                    this.$store.dispatch('message/updateOneMessage', {
                        message: data,
                        isSuccess: true
                    });
                })
                .catch(({ data, errCode }) => {
                    console.log('发送失败', data, errCode);
                    this.$store.dispatch('message/updateOneMessage', {
                        message: data,
                        type: UpdateMessageTypes.KeyWords,
                        keyWords: [
                            {
                                key: 'status',
                                value: MessageStatus.Failed
                            },
                            {
                                key: 'errCode',
                                value: errCode
                            }
                        ]
                    });
                });
        },
        setSendingDelay() {
            if (this.source.status === MessageStatus.Sending) {
                setTimeout(() => {
                    this.sendingDelay = false;
                }, 2000);
            }
        },
        isReadObserver() {
            if (
                this.isSender ||
                this.source.isRead === true ||
                this.source.sessionType !== SessionType.Single
            )
                return;

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
                                            this.source.clientMsgID
                                        ]
                                    }
                                    // eslint-disable-next-line vue/no-mutating-props
                                ).then(() => (this.source.isRead = true));
                            }

                            observer.disconnect();
                        }
                    }
                );
        },
        showInfo() {
            if (this.isSender) return;
            const sourceInfo = {
                nickname: this.source.senderNickname,
                faceURL: this.source.senderFaceUrl
            };
            uni.$u.route(
                `/pages/common/userCard/index?sourceID=${
                    this.source.sendID
                }&sourceInfo=${JSON.stringify(sourceInfo)}`
            );
            uni.hideKeyboard();
        },
        async handleLongPress() {
            if (!this.isShowMenuFlag) return;
            this.getMsgRect();
        },
        getMsgRect() {
            uni.createSelectorQuery()
                .in(this)
                .select('.message_content_wrap')
                .boundingClientRect(res => {
                    this.$emit('menuRect', {
                        ...res,
                        message: this.source
                    });
                })
                .exec();
        },
        handleMultiple() {
            if (!this.isMultipleMsg) return;
            uni.$emit('multiple_message', {
                show: true,
                message: this.source,
                type: MessageMenuTypes.Checked
            });
        }
    }
};
</script>

<style scoped lang="scss">
.message_item {
    display: flex;
    padding: 16rpx 30rpx;

    &.positionActive {
        animation: bgBlink 2s 0.3s;
    }

    .check_wrap {
        flex: 0 0 46rpx;
        height: 46rpx;
        border: 2px solid #979797;
        border-radius: 50%;
        margin: 10rpx 30rpx 0 0;
        @include centerBox();

        &_active {
            background-color: #1d6bed;
            border: none;
        }
    }

    .item_right {
        flex: 1;
        overflow: hidden;
        display: flex;
        .avatar-box {
            height: 80rpx;
        }
        .my_avatar {
            margin-right: 24rpx;
        }

        .message_container {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            max-width: 80%;

            /deep/.message_content_wrap .message_content_container {
                display: flex;
                flex-direction: column;
                align-items: flex-start;
            }
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
    }

    &_self {
        justify-content: space-between;
        .item_right {
            flex-direction: row-reverse;
            .message_container {
                align-items: flex-end;

                /deep/ .message_content_wrap .message_content_container {
                    align-items: flex-end;
                    // .bg_container {
                    //     background-color: #c5e3ff !important;
                    // }
                }
            }

            .message_send_state {
                margin-left: 0rpx;
                margin-right: 12rpx;
            }
        }
    }
}
@keyframes bgBlink {
    from {
        background-color: rgba($uni-color-primary, 1);
    }
    20% {
        background-color: rgba($uni-color-primary, 0.8);
    }
    40% {
        background-color: rgba($uni-color-primary, 0.6);
    }
    60% {
        background-color: rgba($uni-color-primary, 0.4);
    }
    80% {
        background-color: rgba($uni-color-primary, 0.2);
    }
    to {
        background-color: rgba($uni-color-primary, 0);
    }
}

.notice_message_container {
    @include ellipsisWithLine(2);
    text-align: center;
    margin: 24rpx auto;
    // font-size: 24rpx;
    font-size: 0.85rem;
    color: #999;
    border-radius: 43rpx;
    // background: rgba(0, 0, 0, 0.25);
    padding: 4rpx 33rpx;
    width: max-content;
}
</style>
