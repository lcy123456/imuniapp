<template>
    <view class="incoming_call_container">
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
    }
};
</script>

<style lang="scss" scoped>
</style>