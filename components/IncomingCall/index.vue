<template>
    <view>
        <!-- 顶部来电弹出层 -->
        <TopDialog />

        <!-- 通话中，悬浮拖动弹出层 -->
        <SmallPopup />
    </view>
</template>

<script>
import TopDialog from './TopDialog.vue';
import SmallPopup from './SmallPopup.vue';
export default {
    name: 'IncomingCall',
    components: {
        TopDialog,
        SmallPopup,
    },
    data () {
        return {
        };
    },
    methods: {
    }
};
</script>


<style lang="scss" scoped>
</style>