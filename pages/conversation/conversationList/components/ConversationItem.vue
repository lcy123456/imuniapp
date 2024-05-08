<template>
    <uni-swipe-action-item
        :right-options="getSwipeActions || []"
        :disabled="isDisabled"
        :threshold="50"
        @click="clickConversationMenu"
    >
        <!-- @touchmove.stop -->
        <view
            class="conversation_item"
            :class="{ 'bg-hover': source.isPinned }"
            @click="clickConversationItem"
        >
            <view class="left_info">
                <MyAvatar
                    :is-group="isGroup"
                    :is-notify="isNotify"
                    :src="source.faceURL"
                    :desc="source.showName"
                    size="55"
                    :font-size="18"
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
                                lastest_msg_prefix_active:
                                    needActivePerfix || source.draftText
                            }"
                        >
                            {{ messagePrefix }}
                        </text>
                        <text
                            class="lastest_msg_content"
                            v-html="latestMessage"
                        >
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
                    v-if="!notAccept"
                    max="99"
                    :value="source.unreadCount"
                />
            </view>
            <view class="burn_wrap" v-if="source.isPrivateChat">
                {{ burnToText }}
            </view>
        </view>
    </uni-swipe-action-item>
</template>

<script>
import IMSDK, {
    GroupAtType,
    MessageReceiveOptType,
    SessionType
} from 'openim-uniapp-polyfill';
import MyAvatar from '@/components/MyAvatar/index.vue';
import { html2Text, draftText2Text } from '@/util/common';
import { mapGetters } from 'vuex';
import {
    parseMessageByType,
    formatConversionTime,
    prepareConversationState,
    getName,
    burnMenuList
} from '@/util/imCommon';
import { setConversations } from '@/api/conversation';

export default {
    components: {
        MyAvatar
    },
    props: {
        source: {
            type: Object,
            default: () => {}
        },
        isDisabled: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {};
    },
    computed: {
        ...mapGetters(['storeCurrentUserID', 'storeCurrentConversation']),
        messagePrefix() {
            if (html2Text(draftText2Text(this.source.draftText))) {
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
        latestMessage() {
            const { conversationType, draftText, latestMsg } = this.source;
            let text = '';
            if (draftText2Text(draftText)) {
                text = draftText2Text(draftText);
            } else if (latestMsg) {
                let parsedMessage = JSON.parse(latestMsg || '{}');
                let showName = '';
                if (conversationType === 3 && parsedMessage.senderNickname) {
                    showName = `${getName(parsedMessage)}：`;
                }
                text = `${showName}${parseMessageByType(parsedMessage)}`;
            }
            return text.replace(/<([^>]*>)/g, '');
        },
        burnToText() {
            const { burnDuration } = this.source;
            const item = burnMenuList.find(v => v.id === burnDuration);
            return item?.text || '';
        },
        needActivePerfix() {
            return this.source.groupAtType !== GroupAtType.AtNormal;
        },
        latestMessageTime() {
            return this.source.latestMsgSendTime
                ? formatConversionTime(this.source.latestMsgSendTime)
                : '';
        },
        notAccept() {
            return this.source.recvMsgOpt !== MessageReceiveOptType.Nomal;
        },
        isGroup() {
            return this.source.conversationType === SessionType.WorkingGroup;
        },
        isNotify() {
            return this.source.conversationType === SessionType.Notification;
        },
        isArchvist() {
            try {
                const attachedInfo = JSON.parse(this.source.attachedInfo);
                return attachedInfo.archivist === 1;
            } catch (err) {
                return false;
            }
        },
        getSwipeActions() {
            const notAccept =
                this.source.recvMsgOpt !== MessageReceiveOptType.Nomal;
            let actions = [
                {
                    text: `${notAccept ? '打开' : '关闭'}通知`,
                    icon: `/static/images/conversation_${
                        notAccept ? 'accept' : 'not_accept_white'
                    }.png`,
                    style: {
                        backgroundColor: '#e39f4e'
                    }
                },
                {
                    text: `${this.source.isPinned ? '取消' : ''}置顶`,
                    icon: `/static/images/conversation${
                        this.source.isPinned ? '_not' : ''
                    }_pinned.png`,
                    style: {
                        backgroundColor: '#4ee36f'
                    }
                },
                {
                    text: '删除',
                    icon: `/static/images/conversation_del.png`,
                    style: {
                        backgroundColor: '#ec4b37'
                    }
                },
                {
                    text: `${this.isArchvist ? '取消归档' : '归档'}`,
                    icon: `/static/images/archive${
                        this.isArchvist ? '_not' : ''
                    }.svg`,
                    style: {
                        backgroundColor: '#37A0EC'
                    }
                }
            ];
            if (this.source.unreadCount > 0) {
                actions.unshift({
                    text: '标记已读',
                    icon: `/static/images/conversation_read.png`,
                    style: {
                        backgroundColor: '#3478f5'
                    }
                });
            }
            return actions;
        }
    },
    methods: {
        html2Text,
        clickConversationItem() {
            if (this.source.isArchvistItem) {
                uni.$u.route(
                    'pages/conversation/conversationList/conversationArchvist'
                );
            } else {
                prepareConversationState(this.source);
            }
        },
        async clickConversationMenu({ index }) {
            this.$loading('加载中');
            const noUnRead = this.getSwipeActions.length === 4;

            let tempIndex = index;
            if (noUnRead) tempIndex += 1;

            switch (tempIndex) {
                case 0:
                    await this.handleAsRead();
                    break;
                case 1:
                    await this.handleAccept();
                    break;
                case 2:
                    await this.handlePin();
                    break;
                case 3:
                    await this.handleDel();
                    break;
                case 4:
                    await this.handleArchive();
            }
            this.$hideLoading();
            this.$emit('closeAllSwipe');
        },
        async handleArchive() {
            try {
                const archivist =
                    this.source.attachedInfo &&
                    JSON.parse(this.source.attachedInfo).archivist === 1
                        ? 2
                        : 1;
                await setConversations({
                    userIDs: [this.storeCurrentUserID],
                    conversation: {
                        conversationID: this.source.conversationID,
                        conversationType: this.source.conversationType,
                        groupID: this.source.groupID,
                        attachedInfo: JSON.stringify({
                            archivist: archivist
                        })
                    }
                });
                uni.$u.toast(archivist === 1 ? '设置归档成功' : '取消归档成功');
            } catch (err) {
                console.log(err);
            }
        },
        async handleAsRead() {
            try {
                return await IMSDK.asyncApi(
                    IMSDK.IMMethods.MarkConversationMessageAsRead,
                    IMSDK.uuid(),
                    this.source.conversationID
                );
            } catch (err) {
                uni.$u.toast('已读失败');
            }
        },
        async handleAccept() {
            try {
                return await IMSDK.asyncApi(
                    IMSDK.IMMethods.SetConversationRecvMessageOpt,
                    IMSDK.uuid(),
                    {
                        conversationID: this.source.conversationID,
                        opt: this.notAccept
                            ? MessageReceiveOptType.Nomal
                            : MessageReceiveOptType.NotNotify
                    }
                );
            } catch {
                uni.$u.toast('通知失败');
            }
        },
        async handleDel() {
            try {
                const res = await IMSDK.asyncApi(
                    IMSDK.IMMethods.DeleteConversationAndDeleteAllMsg,
                    IMSDK.uuid(),
                    this.source.conversationID
                );
                this.$store.dispatch(
                    'conversation/delConversationByCID',
                    this.source.conversationID
                );
                return res;
            } catch {
                uni.$u.toast('删除失败');
            }
        },
        async handlePin() {
            try {
                return await IMSDK.asyncApi(
                    IMSDK.IMMethods.PinConversation,
                    IMSDK.uuid(),
                    {
                        conversationID: this.source.conversationID,
                        isPinned: !this.source.isPinned
                    }
                );
            } catch {
                uni.$u.toast('置顶失败');
            }
        }
    }
};
</script>

<style lang="scss" scoped>
.conversation_item {
    @include btwBox();
    padding: 20rpx;
    position: relative;
    transform: translateZ(1px);

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
                        color: red;
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
    .burn_wrap {
        width: 50rpx;
        height: 50rpx;
        position: absolute;
        left: 8rpx;
        top: 10rpx;
        z-index: 10;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 100%;
        border: 4rpx solid #5b21b6;
        background-color: #fff;
        font-size: 20rpx;
        color: #5b21b6;
    }
}
/deep/.uni-swipe_button-group {
    .uni-swipe_button {
        width: 140rpx;
        padding: 0 20rpx !important;
        display: flex;
        flex-direction: column !important;
        justify-content: space-evenly;
        .u-icon {
            width: 50rpx;
            height: 50rpx;
            .u-icon__img {
                width: 100% !important;
                height: 100% !important;
            }
        }
        .uni-swipe_button-text {
            font-size: 26rpx !important;
        }
    }
}
</style>
