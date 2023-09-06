<template>
    <view
        class="merge_message_container bg_container"
        @click="clickMergeItem"
    >
        <view class="ff-bold">
            {{ message.mergeElem.title }}
        </view>
        <view
            v-for="v in multiMessage.slice(0, 3)"
            :key="v.clientMsgID"
            class="flex fz-28"
        >
            <text class="name_box">
                {{ v.senderNickname }}：
            </text>
            <ChatQuote
                :message="v"
                origin-type="merge_record"
            />
        </view>
        <view class="record_box">
            聊天记录
        </view>
    </view> 
</template>

<script>
import ChatQuote from '@/components/ChatQuote';

export default {
    components: {
        ChatQuote,
    },

    props: {
        message: {
            type: Object,
            default: () => ({})
        }
    },
    data () {
        return {
            
        };
    },
    computed: {
        multiMessage () {
            return this.message.mergeElem.multiMessage;
        }
    },

    mounted () {
    },

    methods: {
        clickMergeItem () {
            uni.$u.route('/pages/conversation/previewMerge/index', {
                message: encodeURIComponent(JSON.stringify(this.message))
            });
        }
    },
};
</script>

<style lang="scss" scoped>
.merge_message_container {
    max-width: 100%;
    width: 100vw;

    .name_box {
        flex-shrink: 0;
        max-width: 200rpx;
        @include nomalEllipsis();
    }
    
    .record_box {
        font-size: 24rpx;
        margin: 10rpx 0 -10rpx 0;
        padding-top: 10rpx;
        border-top: 2rpx solid $uni-color-thinGrey;
    }
}
</style>