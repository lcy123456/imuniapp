<template>
    <view>
        <slot />

        <!-- 电话呼入 -->
        <IncomingCall @onDanger="onDanger" @onSuccess="onSuccess" />
        <TipMessage :source="storeLastConversation" />
    </view>
</template>

<script>
import IncomingCall from '@/components/IncomingCall';
import TipMessage from '@/components/TipMessage';
import { mapGetters } from 'vuex';
export default {
    name: 'Page',
    components: {
        IncomingCall,
        TipMessage
    },
    computed: {
        ...mapGetters(['storeLastConversation', 'storeIsShowTip'])
    },
    methods: {
        onDanger() {
            console.log('拒绝电话  Page/index.vue');
        },
        onSuccess() {
            console.log('接通电话 Page/index.vue');
        }
    }
};
</script>

<style lang="scss" scoped></style>
