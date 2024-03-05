<template>
    <view
        :class="['tip_message_container', storeIsShowTip ? 'show' : 'hide']"
        @touchstart="onTouchstart($event)"
        @touchend="onTouchend($event)"
    >
        <view class="content" @click="clickConversationItem">
            <MyAvatar
                :is-group="isGroup"
                :is-notify="isNotify"
                :src="source.faceURL"
                :desc="getName()"
                size="44"
            />
            <view class="details">
                <text class="conversation_name">
                    {{ getName() }}
                </text>
                <view class="lastest_msg_wrap">
                    <text
                        v-if="messagePrefix"
                        class="lastest_msg_prefix"
                        :class="{
                            lastest_msg_prefix_active: needActivePerfix
                        }"
                    >
                        {{ messagePrefix }}
                    </text>
                    <text class="lastest_msg_content">
                        {{ html2Text(latestMessage) }}
                    </text>
                </view>
            </view>
        </view>
    </view>
</template>

<script>
import MyAvatar from '@/components/MyAvatar/index.vue';
import IMSDK, {
    GroupAtType,
    MessageType,
    MessageReceiveOptType,
    SessionType
} from 'openim-uniapp-polyfill';
import { html2Text } from '@/util/common';
import {
    parseMessageByType,
    formatConversionTime,
    prepareConversationState,
    getName
} from '@/util/imCommon';
import { TextRenderTypes, MediaRenderTypes, FileRenderTypes } from '@/constant';
import { mapGetters } from 'vuex';

export default {
    components: {
        MyAvatar
    },

    props: {
        source: {
            type: Object,
            default: () => ({})
        }
    },
    data() {
        return {
            MessageType: Object.freeze(MessageType),
            startPageY: 0
        };
    },

    computed: {
        ...mapGetters(['storeIsShowTip']),
        messagePrefix() {
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
        latestMessage() {
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
        }
    },
    watch: {
        storeIsShowTip() {
            if (this.storeIsShowTip) {
                clearTimeout(this.timer);
                this.timer = setTimeout(() => {
                    this.hide();
                }, 4000);
            }
        }
    },
    methods: {
        html2Text,
        getName() {
            const { latestMsg } = this.source;
            let parsedMessage;
            try {
                parsedMessage = JSON.parse(latestMsg);
            } catch (e) {
                console.log(e);
            }
            if (!parsedMessage) return '';
            return getName(parsedMessage);
        },
        hide() {
            this.$store.commit('base/SET_TIP_STATUS', false);
        },
        clickConversationItem() {
            this.hide();
            prepareConversationState(this.source);
        },
        onTouchstart(event) {
            const [touches] = event.touches;
            const { pageY } = touches;
            this.startPageY = pageY;
        },
        onTouchend(event) {
            const [touches] = event.changedTouches;
            const { pageY } = touches;
            const moveY = this.startPageY - pageY;
            if (moveY > 45) {
                this.hide();
            }
        }
    }
};
</script>

<style lang="scss" scoped>
.tip_message_container {
    position: fixed;
    left: 50%;
    transform: translate(-50%);
    width: 80%;
    background: rgba(255, 255, 255, 1);
    border-radius: 10px;
    padding: 10px;
    transition: all 0.5s ease;
    z-index: 999999;
    box-shadow: 5px 2px 2px 0px rgba(0, 0, 0, 0.2);
    &.show {
        top: 150rpx !important;
    }
    &.hide {
        top: -300rpx !important;
    }
    .content {
        display: flex;
        align-items: center;

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
}
</style>
