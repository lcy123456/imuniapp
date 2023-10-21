<template>
    <view class="incoming_call_container">
        <!-- 顶部来电弹出层 -->
        <TopDialog
            @onDanger="onDanger"
            @onSuccess="onSuccess"
        />
      
        <IncomingCallMain
            @onHandle="onHandle"
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
    data () {
        return {
        };
    },
    methods: {
        onHandle ({key, value}) {
            this.$emit('onHandle', {key, value});
        },
        onDanger () {
            console.log('拒绝电话');
        },
        onSuccess () {
            console.log('接听电话');
            this.wsurl = `ws://192.168.2.20:7880`;
            this.token = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3MDAzNzY2ODAsImlzcyI6IkFQSVZWQ3BETGtaTHZSViIsIm5iZiI6MTY5Nzc4NDY4MCwic3ViIjoicGFydGljaXBhbnRJZGVudGl0eTMiLCJ2aWRlbyI6eyJyb29tIjoiTVVTSyIsInJvb21Kb2luIjp0cnVlfX0.Ca0sYNhNTdOHkwNk1mJeDQq9XWhjC0ska1j-rX1y9QA`;
        },
    }
};
</script>


<style lang="scss" scoped>
</style>