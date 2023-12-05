<template>
    <view class="read-state-css">
        <image
            v-if="message.pinMap"
            class="pined"
            src="/static/images/pin2.png"
        />
        <text :class="['read_state', isSender ? 'isSender' : 'notisSender', message.pinMap ? 'isPin' : '']">
            <text
                v-if="isEdit"
                class="edit"
            >
                {{ '已编辑 ' }}
            </text>
            {{ new Date(message.createTime).Format('hh:mm') }}
        </text>
        <image
            v-if="isSender"
            :class="getClass"
            :src="getImg"
        />
        <text v-if="isSender && isGroupRead">
            {{ message.attachedInfoElem.groupHasReadInfo.hasReadCount }}人
        </text>
    </view>
</template>

<script>
import { SessionType, MessageStatus } from 'openim-uniapp-polyfill';

export default {
    name: "",
    components: {},
    props: {
        message: {
            type: Object,
            default: () => ({})
        },
        isSender: {
            type: Boolean,
            default: false
        }
    },
    data () {
        return {
            SessionType
        };
    },
    computed: {
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
        getReadStateStr () {
            if (this.message && this.message.sessionType === SessionType.Single) {
                return this.message.isRead ? '已读' : '未读';
            }
            return ' ';
        },
        getClass () {
            if (this.message.status === MessageStatus.Sending) {
                return `issending`;
            }
            return this.message.isRead ? `read` : `unread`;
        },
        getImg () {
            if (this.message.status === MessageStatus.Sending) {
                return `/static/images/message_issend.png`;
            }
            return this.message.isRead || this.isGroupRead ? `/static/images/read.png` : `/static/images/unread.png`;
        }
    },
};
</script>

<style lang="scss" scoped>
    .read-state-css {
        width: max-content;
        display: flex;
        align-items: center;
    }
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
    uni-text {
        width: max-content;
		font-size: 12px;
        color: #43D100!important;
    }
    uni-image {
        width: 26rpx;
        height: 18rpx;
        margin: 0 10rpx;
        &.read {
            width: 30rpx;
        }
        &.issending {
            height: 26rpx;
        }
    }
    .pined {
        width: 27rpx;
        height: 27rpx;
        margin: 0 5px;
        margin-left: 20rpx;
    }
</style>
