<template>
    <view
        @longpress="longpress"
        @touchstart="touchstart"
        @touchmove="touchmove"
        @touchend.prevent="touchend"
    >
        <slot />
    </view>
</template>

<script>
export default {
    name: 'EventDom',
    data() {
        return {
            isTouchmove: false,
            touchT: '',
            touchE: ''
        };
    },
    methods: {
        touchmove() {
            this.isTouchmove = true;
        },
        touchstart() {
            this.isTouchmove = false;
            this.touchT = new Date().getTime();
            this.$emit('touchstart');
        },
        touchend() {
            this.touchE = new Date().getTime();
            this.$emit('touchend');
            if (this.touchE - this.touchT < 350 && !this.isTouchmove) {
                this.$emit('click');
            }
            this.isTouchmove = false;
        },
        longpress() {
            if (!this.isTouchmove) {
                this.$emit('longpress');
            }
        }
    }
};
</script>
