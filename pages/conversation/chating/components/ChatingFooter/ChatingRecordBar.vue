<template>
    <div class="chating_record_bar">
        <image class="w-150 h-150" src="/static/images/recording.gif" />
        <image
            class="chating_record_cancel w-80 h-80"
            src="/static/images/close.svg"
        />
    </div>
</template>

<script>
export default {
    name: 'ChatingRecordBar',

    data() {
        return {};
    },

    mounted() {},

    methods: {}
};
</script>

<style lang="scss" scoped>
.chating_record_bar {
    width: 100%;
    height: 400rpx;
    position: absolute;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: space-evenly;
    background-color: rgba(0, 0, 0, 0.6);
    border-start-start-radius: 50% 25%;
    border-start-end-radius: 50% 25%;
    uni-image {
        margin-top: -40rpx;
    }
}
</style>
