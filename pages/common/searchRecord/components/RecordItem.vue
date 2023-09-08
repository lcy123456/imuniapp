<template>
    <view class="record_item_container">
        <MyAvatar
            :is-group="isGroup"
            size="76rpx"
            :src="source.faceURL || source.senderFaceUrl"
            :desc="showName"
        />
        <view class="right_box">
            <view class="flex justify-between">
                <view class="name_box">
                    <text v-html="isMessage ? showName : lightTextStr(showName)" />
                    <text>{{ source.memberCount ? `(${source.memberCount})` : '' }}</text>
                </view>
                <text
                    v-if="isMessage"
                    class="fz-26 text-grey"
                >
                    {{ dayjs(source.sendTime).format('MM/DD') }}
                </text>
                <u-icon
                    v-if="showIcon"
                    name="arrow-right"
                    size="20"
                />
            </view>
            <view
                v-if="(source.conversationID || isMessage) && !isContact"
                class="content_box"
            >
                <text
                    v-if="isMessage"
                    v-html="lightTextStr(source.textElem.content)"
                />
                <text
                    v-else-if="source.messageCount === 1"
                    v-html="lightTextStr(source.messageList[0].textElem.content)"
                />
                <text v-else-if="source.messageCount > 1">
                    {{ source.messageCount }}条相关聊天记录
                </text>
            </view>
        </view>
    </view>
</template>

<script>
import MyAvatar from '@/components/MyAvatar/index.vue';
import { SessionType } from 'openim-uniapp-polyfill';
import { lightTextStr } from '@/util/common';
import { RecordTypeMap } from '@/constant';
import dayjs from 'dayjs';

export default {

    components: {
        MyAvatar
    },
    props: {
        source: {
            type: Object,
            default: () => ({})
        },
        keyword: {
            type: String,
            default: ''
        },
        type: {
            type: String,
            default: ''
        },
        showIcon: {
            type: Boolean,
            default: false
        }
    },

    data () {
        return {
            dayjs: Object.freeze(dayjs),
            SessionType: Object.freeze(SessionType),
        };
    },
    computed: {
        isGroup () {
            return this.type === RecordTypeMap.Group || this.source.conversationType === SessionType.WorkingGroup;
        },
        isMessage () {
            return this.type === RecordTypeMap.Message;
        },
        isContact () {
            return this.type === RecordTypeMap.Contact;
        },
        showName () {
            const { remark, nickname, groupName, showName, senderNickname } = this.source;
            return remark || nickname || groupName || showName || senderNickname;
        },
    },

    mounted () {
        
    },

    methods: {
        lightTextStr (text) {
            return lightTextStr(text, this.keyword);
        }
    },
};
</script>

<style lang="scss" scoped>
.record_item_container {
    display: flex;
    align-items: center;
    padding: 20rpx 10rpx;
    border-bottom: 2rpx solid $uni-color-thinGrey;

    .right_box {
        margin-left: 25rpx;
        flex: 1;
        overflow: hidden;

        .name_box {
            @include nomalEllipsis();
        }
        .content_box {
            @include nomalEllipsis();
            font-size: 26rpx;
            color: $uni-text-color-grey;
        }
    }
}
</style>