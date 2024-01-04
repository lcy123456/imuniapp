<template>
    <view class="give-like-css">
        <view class="like-list">
            <view
                v-for="(item, key) in giveLikeMap"
                :key="key"
                class="like-box"
                @click="like(key)"
            >
                <image class="pined" :src="`/static/like/${key}.png`" />
                <text>{{ item.num }}</text>
            </view>
        </view>
    </view>
</template>

<script>
import { SessionType } from 'openim-uniapp-polyfill';
import { giveLikeEmoji } from '@/api/message';
export default {
    name: 'MessageGiveLikeState',
    components: {},
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
    data() {
        return {};
    },
    computed: {
        isGroup() {
            return this.message.sessionType !== SessionType.Single;
        },
        giveLike() {
            try {
                const ex = JSON.parse(this.message.ex);
                return ex.giveLike;
            } catch (err) {
                console.log(err);
            }
            return [];
        },
        giveLikeMap() {
            const map = {};
            this.giveLike.forEach(item => {
                if (!map[item.key]) {
                    map[item.key] = {
                        num: 0,
                        uid: '',
                        time: ''
                    };
                }
                map[item.key].num++;
                map[item.key].uid = item.uid;
                map[item.key].time = item.time;
            });
            return map;
        }
    },
    methods: {
        async like(emoji) {
            try {
                const { clientMsgID, serverMsgID, sendID, recvID, groupID } =
                    this.message;
                await giveLikeEmoji({
                    clientMsgID,
                    serverMsgID,
                    sendID,
                    recvID,
                    groupID,
                    emoji
                });
            } catch (err) {
                uni.$u.toast('点赞失败');
            }
        }
    }
};
</script>

<style lang="scss" scoped>
.give-like-css {
    display: block;
    margin-top: 10rpx;
    .like-list {
        width: max-content;
        display: flex;
        align-items: center;
    }
    .like-box {
        height: 58rpx;
        border-radius: 29rpx;
        opacity: 1;
        display: flex;
        align-items: center;
        margin-right: 10rpx;
        padding: 8rpx 25rpx 8rpx 8rpx;
        background: #008dff;
        uni-image {
            width: 50rpx;
            height: 50rpx;
        }
        uni-text {
            margin-left: 16rpx;
            color: #fff;
            font-size: 34rpx;
        }
    }
}
</style>
