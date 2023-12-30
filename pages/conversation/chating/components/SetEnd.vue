<template>
    <view
        class="set-end"
        @click="setPositionMsgID('')"
    >
        <view
            v-if="conversationUnread"
            class="unread"
        >
            {{ conversationUnread < 100 ? conversationUnread : '99+' }}
        </view>
        <image
            src="/static/images/set-end.png"
        />
    </view>
</template>
<script>
import { mapGetters } from 'vuex';
export default {
    data () {
        return {
        };
    },
    computed: {
        ...mapGetters([
            'conversationUnread'
        ])
    },
    methods: {
        setPositionMsgID () {
            uni.$emit('setPositionMsgID', '');
        }
    }
};
</script>
<style lang="scss" scoped>
.set-end {
    position: fixed;
    bottom: 130px;
    right: 20px;
            uni-image {
        width: 100rpx;
        height: 100rpx;
    }
    .unread {
        width: 60rpx;
        height: 60rpx;
        line-height: 60rpx;
        text-align: center;
        background: rgba(0, 141, 255, 1);
        color: #fff;
        border-radius: 50%;
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
        top: -40rpx;
        z-index: 9;
        font-size: 12px;
    }
}
</style>