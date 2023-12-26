<template>
    <view
        @longpress="longpress"
        @touchstart="touchstart"
        @touchend.prevent="touchend"
    >
        <slot />
    </view>
</template>

<script>
export default {
    name: "EventDom",
    methods: {
        touchstart () {
            this.touchT = new Date().getTime();
            this.$emit('touchstart');
        },
        touchend () {
            this.touchE = new Date().getTime();
            this.$emit('touchend');
            if (this.touchE - this.touchT < 350) {
                console.log('点击');
                this.$emit('click');
            }
        },
        longpress () {
            this.$emit('longpress');
        }
    }
};
</script>