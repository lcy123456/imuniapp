<template>
    <view class="err_message_container bg_container">
        <view>
            [暂未支持的消息类型]
        </view>
        <MessageReadState
            :message="message"
            :is-sender="isSender"
        />
    </view>
</template>

<script>
import MessageReadState from './MessageReadState.vue';
export default {
    name: 'ErrorMessagegRender',
    components: {
        MessageReadState
    },
    props: {
        message: {
            type: Object,
            default: () => ({})
        },
        isSender: {
            type: Boolean,
            default: false
        }
    },
    data () {
        return {

        };
    }
};
</script>

<style lang="scss" scoped>
.err_message_container {
    display: flex;
    align-items: baseline;
}
</style>
