<template>
    <view class="read-user-list">
        <view
            v-for="user in userList"
            :key="user.userID"
            @touchstart.stop
            @click.stop="showInfo(user)"
        >
            <view class="user_item">
                <view class="left">
                    <my-avatar
                        :key="user.userID"
                        :desc="user.nickname"
                        :src="user.faceURL"
                        :font-size="12"
                        size="28"
                        shape="circle"
                        :class="['avatar']"
                    />
                    <text>{{ user.nickname }}</text>
                    <image src="/static/images/read_white.svg" />
                </view>
                <view v-if="getLike(user.userID)" class="right">
                    <image :src="`/static/like/${getLike(user.userID)}.png`" />
                </view>
            </view>
        </view>
    </view>
</template>
<script>
import MyAvatar from '@/components/MyAvatar/index.vue';
export default {
    name: 'ReadUserList',
    components: {
        MyAvatar
    },
    props: {
        message: {
            type: Object,
            default: () => ({})
        },
        userList: {
            type: Array,
            default: () => []
        }
    },
    computed: {
        giveLike() {
            try {
                const ex = JSON.parse(this.message.ex);
                return ex.giveLike;
            } catch (err) {
                // console.log(err);
            }
            return [];
        }
    },
    methods: {
        getLike(userID) {
            const map = this.giveLike.find(item => item.uid === userID);
            if (map) return map.key;
            return '';
        },
        showInfo(user) {
            const sourceInfo = {
                nickname: user.nickname,
                faceURL: user.faceURL
            };
            uni.$u.route(
                `/pages/common/userCard/index?sourceID=${
                    user.userID
                }&sourceInfo=${JSON.stringify(sourceInfo)}`
            );
            uni.hideKeyboard();
        }
    }
};
</script>
<style lang="scss" scoped>
.read-user-list {
    max-height: 160px;
    overflow: scroll;
    border-radius: 15px;
    padding: 0 20rpx;
    background-color: rgba($uni-bg-color-inverse, 0.6);
    margin-top: 20rpx;
    border-radius: 15px;
    .user_item {
        padding: 10px 15px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        .left {
            display: flex;
            align-items: center;
            uni-text {
                font-size: 24rpx;
                margin-left: 10rpx;
                @include ellipsisWithLine(1);
            }
            uni-image {
                width: 38rpx;
                height: 24rpx;
                margin-left: 10rpx;
            }
        }
        .right {
            display: flex;
            align-items: center;
            uni-image {
                width: 54rpx;
                height: 54rpx;
            }
        }
    }
}
</style>
