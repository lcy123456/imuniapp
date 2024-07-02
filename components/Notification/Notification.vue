<template>
    <view :class="['notification-box', value ? 'show' : 'hide']">
        <image v-if="icon" :src="icon" />
        <text>{{ text }}</text>
    </view>
</template>

<script>
export default {
    model: {
        prop: 'value',
        event: 'change'
    },
    props: {
        text: {
            type: String,
            default: ''
        },
        icon: {
            type: String,
            default: ''
        },
        value: {
            type: Boolean,
            default: false
        }
    },
    watch: {
        value() {
            if (this.value) {
                clearTimeout(this.timer);
                this.timer = setTimeout(() => {
                    this.hide();
                }, 2000);
            }
        }
    },
    methods: {
        hide() {
            this.$emit('change', false);
        }
    }
};
</script>

<style lang="scss" scoped>
.notification-box {
    position: fixed;
    left: 50%;
    transform: translateX(-50%);
    bottom: 200rpx;
    margin: 0 auto;
    width: fit-content;
    padding: 28rpx 24rpx;
    background: rgba(0, 0, 0, 0.6);
    border-radius: 20rpx;
    transition: all 0.5s ease;
    color: #fff;
    display: flex;
    uni-image {
        margin-right: 10rpx;
        width: 38rpx;
        height: 38rpx;
    }
    &.show {
        bottom: 200rpx !important;
    }
    &.hide {
        bottom: -200rpx !important;
    }
}
</style>
