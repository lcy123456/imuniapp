<template>
    <view class="read-user-list">
        <view
            v-for="user in userList"
            :key="user.userID"
            @touchstart.stop
            @click.stop="showInfo(user)"
        >
            <view class="user_item">
                <my-avatar
                    :key="user.userID"
                    :desc="user.nickname"
                    :src="user.faceURL"
                    :font-size="12"
                    size="36"
                    shape="circle"
                    :class="['avatar']"
                />
                <text>{{ user.nickname }}</text>
            </view>
        </view>
    </view>
</template>
<script>
import MyAvatar from "@/components/MyAvatar/index.vue";
export default {
    name: "ReadUserList",
    components: {
        MyAvatar
    },
    props: {
        userList: {
            type: Array,
            default: () => ([])
        }
    },
    methods: {
        showInfo (user) {
            const sourceInfo = {
                nickname: user.nickname,
                faceURL: user.faceURL
            };
            uni.$u.route(
                `/pages/common/userCard/index?sourceID=${user.userID}&sourceInfo=${JSON.stringify(sourceInfo)}`
            );
            uni.hideKeyboard();
        },
    }
};
</script>
<style lang="scss" scoped>
.read-user-list {
    max-height: 500px;
    overflow: scroll;
    border-radius: 15px;
    .user_item {
        padding: 10px 15px;
        display: flex;
        align-items: center;
        border-bottom: 1px solid #fff;
        uni-text {
            margin-left: 10rpx;
            @include ellipsisWithLine(1);
        }
    }
}
</style>