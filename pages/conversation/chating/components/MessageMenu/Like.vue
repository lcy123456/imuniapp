<template>
    <view
        class="like-list"
        :style="{ height: expand === 2 ? '100rpx' : '200rpx' }"
    >
        <view
            v-for="item in showList"
            :key="item.key"
            class="item"
            @touchstart.stop
            @touchend.prevent.stop="like(item)"
        >
            <image
                v-if="item.key === 'arrow'"
                :src="`/static/like/arrow_${expand === 2 ? 'down' : 'up'}.svg`"
            />
            <image v-else :src="`/static/like/${item.key}.svg`" />
        </view>
    </view>
</template>
<script>
export default {
    name: 'Like',
    data() {
        return {
            likeList: [
                {
                    key: 'ok'
                },
                {
                    key: 'support'
                },
                {
                    key: 'love'
                },
                {
                    key: 'face_1'
                },
                {
                    key: 'face_2'
                },
                {
                    key: 'face_3'
                },
                {
                    key: 'arrow'
                },
                {
                    key: 'face_4'
                },
                {
                    key: 'face_5'
                },
                {
                    key: 'face_6'
                },
                {
                    key: 'face_7'
                },
                {
                    key: 'face_8'
                },
                {
                    key: 'face_9'
                },
                {
                    key: 'face_10'
                }
            ],
            expand: 2
        };
    },
    computed: {
        showList() {
            const a = this.likeList.filter((_, i) =>
                this.expand === 2 ? i < 7 : true
            );
            return a;
        }
    },
    methods: {
        like(item) {
            if (item.key === 'arrow') {
                this.expand = this.expand === 2 ? 1 : 2;
                return;
            }
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
    justify-content: space-evenly;
    flex-wrap: wrap;
    .item {
        margin: 0 10rpx;
        uni-image {
            width: 70rpx;
            height: 70rpx;
        }
    }
}
</style>
