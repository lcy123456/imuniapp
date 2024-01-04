<template>
    <view class="like-list">
        <view
            v-for="item in likeList"
            :key="item.key"
            class="item"
            @touchstart.stop
            @click.stop="like(item)"
        >
            <image :src="`/static/like/${item.key}.png`" />
        </view>
    </view>
</template>
<script>
export default {
    name: 'Like',
    props: {
        likeList: {
            type: Array,
            default: () => []
        }
    },
    methods: {
        like(item) {
            this.$emit('like', item.key);
        }
    }
};
</script>
<style lang="scss" scoped>
.like-list {
    border-radius: 45rpx;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    height: 100rpx;
    align-items: center;
    .item {
        margin: 0 10rpx;
        uni-image {
            width: 70rpx;
            height: 70rpx;
        }
    }
}
</style>
