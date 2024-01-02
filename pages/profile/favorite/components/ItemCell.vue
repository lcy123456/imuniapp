<template>
    <view class="item_cell">
        <MessageContentWrap :message="source" :only-message="true" />
        <view class="who_panel">
            <text>{{ source.senderNickname }}</text>
            <text>{{
                new Date(source.sendTime).Format('yyyy-MM-dd hh:mm:ss')
            }}</text>
        </view>
    </view>
</template>

<script>
import MessageContentWrap from '@/pages/conversation/chating/components/MessageItem/MessageContentWrap.vue';
import favoriteFile from '@/static/images/favorite_file.png';
export default {
    name: 'ItemCell',
    components: {
        MessageContentWrap
    },
    props: {
        source: {
            type: Object,
            default: () => {}
        }
    },
    data() {
        return {
            favoriteFile
        };
    }
};
</script>

<style lang="scss" scoped>
.item_cell {
    border-radius: 10rpx;
    padding: 30rpx;
    background-color: #ffffff;
    margin: 20rpx;
}

.unit_cell {
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
}

.video_panel {
    position: relative;
    width: 216rpx;
    height: 216rpx;
}

.log_image {
    width: 216rpx;
    height: 216rpx;
    border-radius: 10rpx;
}

.play_icon {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    margin: auto;
    width: 86rpx;
    height: 80rpx;
    z-index: 2;
}

.who_panel {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 30rpx;
    text {
        font-size: 24rpx;
        color: $uni-text-color-grey;
    }
}

.text_base {
    font-size: 32rpx;
    color: $uni-text-color;
    //   -webkit-user-select: text;
    //   user-select: text;
}

.ellipsisWithLine1 {
    @include ellipsisWithLine(1);
}
.ellipsisWithLine2 {
    @include ellipsisWithLine(2);
}
</style>
