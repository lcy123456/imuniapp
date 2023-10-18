<template>
    <view class="incoming_call_container">
        <!-- 顶部来电弹出层 -->
        <TopDialog
            @onDanger="onDanger"
            @onSuccess="onSuccess"
        />
      
        <IncomingCallMain
            @onDanger="onDanger"
            @onSuccess="onSuccess"
        />

        <!-- 通话中，悬浮拖动弹出层 -->
        <SmallPopup />
    </view>
</template>

<script>
import TopDialog from './TopDialog.vue';
import SmallPopup from './SmallPopup.vue';
import IncomingCallMain from './IncomingCallMain.vue';
export default {
    name: 'IncomingCall',
    components: {
        TopDialog,
        SmallPopup,
        IncomingCallMain
    },
    methods: {
        onDanger () {
            console.log('拒绝电话');
        },
        onSuccess () {
            console.log('接听电话');
        },
    }
};
</script>

<style lang="scss" scoped>
</style>