<template>
    <view class="page_container">
        <slot />
      
        <!-- 电话呼入 -->
        <IncomingCall
            @onDanger="onDanger"
            @onSuccess="onSuccess"
        />
    </view>
</template>

<script>
import IncomingCall from '@/components/IncomingCall';
export default {
    name: "Page",
    components: {
        IncomingCall
    },
    methods: {
        onDanger () {
            console.log('拒绝电话  Page/index.vue');
        },
        onSuccess () {
            console.log('接通电话 Page/index.vue');
        },
    }
};
</script>

<style lang="scss" scoped>
</style>