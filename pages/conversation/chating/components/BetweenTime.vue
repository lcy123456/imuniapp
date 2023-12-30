<template>
    <view v-if="text" class="between-time-box">
        <text>{{ text }}</text>
    </view>
</template>

<script>
export default {
    name: 'BetweenTime',
    components: {},
    props: {
        isReverse: {
            type: Boolean,
            default: true
        },
        type: {
            type: String,
            default: ''
        },
        msgBefore: {
            type: Object,
            default: () => ({})
        },
        msgAfter: {
            type: Object,
            default: () => ({})
        }
    },
    computed: {
        text() {
            return this.getMessageBetweenTime(this.msgBefore, this.msgAfter);
        }
    },
    methods: {
        getMessageBetweenTime(msgBefore, msgAfter) {
            if (this.type === 'first') {
                return this.isReverse
                    ? new Date(msgBefore.sendTime).Format('yyy/MM/dd')
                    : new Date(msgAfter.sendTime).Format('yyy/MM/dd');
            }
            if (!msgAfter || !msgBefore) return '';
            let dayBefore = new Date(msgBefore.sendTime).Format('dd');
            let dayAfter = new Date(msgAfter.sendTime).Format('dd');
            if (dayBefore !== dayAfter) {
                return this.isReverse
                    ? new Date(msgBefore.sendTime).Format('yyy/MM/dd')
                    : new Date(msgAfter.sendTime).Format('yyy/MM/dd');
            }
            return '';
        }
    }
};
</script>

<style lang="scss" scoped>
.between-time-box {
    margin: 0 auto;
    padding: 10rpx 20rpx;
    color: #3981f8;
    background: #f4fbff;
    font-size: 26rpx;
    width: fit-content;
    border-radius: 23rpx;
}
</style>
