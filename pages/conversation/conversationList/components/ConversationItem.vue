<template>
    <u-swipe-action-item
        :index="source.conversationID"
        :name="source.conversationID"
        :options="getSwipeActions || []"
        @click="clickConversationMenu($event, source)"
        @touchmove.stop
    >
        <view
            class="conversation_item"
            :class="{ 'bg-hover': source.isPinned }"
            @tap.prevent="clickConversationItem"
        >
            <view class="left_info">
                <MyAvatar
                    :is-group="isGroup"
                    :is-notify="isNotify"
                    :src="source.faceURL"
                    :desc="source.showName"
                    size="55"
                />
                <view class="details">
                    <text class="conversation_name">
                        {{ source.showName }}
                    </text>
                    <view class="lastest_msg_wrap">
                        <text
                            v-if="messagePrefix"
                            class="lastest_msg_prefix"
                            :class="{
                                lastest_msg_prefix_active: needActivePerfix,
                            }"
                        >
                            {{ messagePrefix }}
                        </text>
                        <text class="lastest_msg_content">
                            {{ latestMessage }}
                        </text>
                    </view>
                </view>
            </view>
            <view class="right_desc">
                <text class="send_time">
                    {{ latestMessageTime }}
                </text>
                <image
                    v-if="notAccept"
                    src="@/static/images/conversation_not_accept.png"
                />
                <u-badge
                    v-else
                    max="99"
                    :value="source.unreadCount"
                />
            </view>
        </view>
    </u-swipe-action-item>
</template>

<script>
import IMSDK, {
    GroupAtType,
    MessageReceiveOptType,
    SessionType,
} from 'openim-uniapp-polyfill';
import MyAvatar from '@/components/MyAvatar/index.vue';
import {
    parseMessageByType,
    formatConversionTime,
    prepareConversationState,
} from '@/util/imCommon';

export default {
    components: {
        MyAvatar,
    },
    props: {
        source: {
            type: Object,
            default: () => {},
        },
    },
    data () {
        return {};
    },
    computed: {
        messagePrefix () {
            if (this.source.draftText !== '') {
                // let text = this.source.draftText;
                return '[草稿]';
            }
            let prefix = '';

            if (this.notAccept && this.source.unreadCount > 0) {
                prefix = `[${this.source.unreadCount}条] `;
            }

            if (this.needActivePerfix) {
                switch (this.source.groupAtType) {
                case GroupAtType.AtAll:
                    prefix = '[所有人]';
                    break;
                case GroupAtType.AtMe:
                    prefix = '[有人@你]';
                    break;
                case GroupAtType.AtAllAtMe:
                    prefix = '[有人@你]';
                    break;
                case GroupAtType.AtGroupNotice:
                    prefix = '[群公告]';
                    break;
                }
            }

            return prefix;
        },
        latestMessage () {
            if (this.source.latestMsg === '') return '';
            let parsedMessage;
            try {
                parsedMessage = JSON.parse(this.source.latestMsg);
            } catch (e) {
                console.log(e);
            }
            if (!parsedMessage) return '';
            return parseMessageByType(parsedMessage);
        },
        needActivePerfix () {
            return this.source.groupAtType !== GroupAtType.AtNormal;
        },
        latestMessageTime () {
            return this.source.latestMsgSendTime
                ? formatConversionTime(this.source.latestMsgSendTime)
                : '';
        },
        notAccept () {
            return this.source.recvMsgOpt !== MessageReceiveOptType.Nomal;
        },
        isGroup () {
            return this.source.conversationType === SessionType.WorkingGroup;
        },
        isNotify () {
            return this.source.conversationType === SessionType.Notification;
        },
        getSwipeActions () {
            let actions = [
                {
                    text: `${this.source.isPinned ? '取消' : ''}置顶`,
                    style: {
                        backgroundColor: '#3c9cff',
                    }
                },
                {
                    text: '移除',
                    style: {
                        backgroundColor: '#f9ae3d',
                    }
                },
            ];
            if (this.source.unreadCount > 0) {
                actions = [
                    {
                        text: '标记已读',
                        style: {
                            backgroundColor: '#f9ae3d',
                        }
                    },
                    ...actions,
                ];
            }
            return actions;
        },
    },
    methods: {
        clickConversationItem () {
            console.log(this.source);
            prepareConversationState(this.source);
        },
        async clickConversationMenu ({ index }, item) {
            const noUnRead = this.getSwipeActions.length === 2;

            if (index === 0 && !noUnRead) {
                IMSDK.asyncApi(
                    IMSDK.IMMethods.MarkConversationMessageAsRead,
                    IMSDK.uuid(),
                    item.conversationID
                ).catch(() => uni.$u.toast('操作失败'));
            }

            if ((index === 0 && noUnRead) || (index === 1 && !noUnRead)) {
                try {
                    await IMSDK.asyncApi(IMSDK.IMMethods.PinConversation, IMSDK.uuid(), {
                        conversationID: item.conversationID,
                        isPinned: !item.isPinned,
                    });
                } catch {
                    uni.$u.toast('置顶失败');
                }
            }

            if (index === 2 || (noUnRead && index === 1)) {
                IMSDK.asyncApi(
                    IMSDK.IMMethods.DeleteConversationAndDeleteAllMsg,
                    IMSDK.uuid(),
                    item.conversationID
                )
                    .then(() =>
                        this.$store.dispatch(
                            'conversation/delConversationByCID',
                            item.conversationID
                        )
                    )
                    .catch(() => uni.$u.toast('移除失败'));
            }
            this.$emit('closeAllSwipe');
        },
    },
};
</script>

<style lang="scss" scoped>
.conversation_item {
    @include btwBox();
    padding: 20rpx;
    position: relative;

    .left_info {
        @include btwBox();
        
        /deep/.u-avatar {
            border-radius: 30rpx;
            overflow: hidden;
        }

        .details {
            @include colBox(true);
            margin-left: 24rpx;
            color: $uni-text-color;

            .conversation_name {
                @include nomalEllipsis();
                max-width: 40vw;
                font-size: 32rpx;
                font-family: MiSans-Medium;
            }

            .lastest_msg_wrap {
                display: flex;
                font-size: 28rpx;
                margin-top: 10rpx;
                color: $uni-text-color-grey;

                .lastest_msg_prefix {
                    margin-right: 6rpx;

                    &_active {
                        color: $u-primary;
                    }
                }

                .lastest_msg_content {
                    flex: 1;
                    margin-right: 160rpx;
                    // /deep/uni-view {
                    @include ellipsisWithLine(1);
                    // }
                }
            }
        }
    }

    .right_desc {
        @include colBox(true);
        align-items: flex-end;
        position: absolute;
        right: 44rpx;
        top: 16rpx;

        .send_time {
            font-size: 24rpx;
            color: #999;
            margin-bottom: 16rpx;
        }

        .u-badge {
            width: fit-content;
        }

        image {
            width: 20px;
            height: 20px;
        }
    }
}
</style>
