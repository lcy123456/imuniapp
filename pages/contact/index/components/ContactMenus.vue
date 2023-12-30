<template>
    <view class="menu_list">
        <view
            v-for="item in getMenus"
            :key="item.idx"
            class="menu_list_item"
            @click="menuClick(item)"
        >
            <image class="w-80 h-80" :src="item.icon" mode="" />
            <view class="item_content">
                <text class="fz-34">
                    {{ item.title }}
                </text>
                <view class="icon">
                    <u-badge max="99" :value="item.badge" />
                    <u-icon name="arrow-right" color="#999" size="18" />
                </view>
                <view class="bottom_line" />
            </view>
        </view>
    </view>
</template>

<script>
import { mapGetters } from 'vuex';
import { ContactMenuTypes } from '@/constant';

export default {
    name: '',
    props: {},
    data() {
        return {};
    },
    computed: {
        ...mapGetters([
            'storeUnHandleFriendApplicationNum',
            'storeUnHandleGroupApplicationNum'
        ]),
        getMenus() {
            return [
                {
                    idx: 0,
                    type: ContactMenuTypes.NewFriend,
                    title: '新的朋友',
                    icon: require('static/images/contact_new_friend.png'),
                    badge: this.storeUnHandleFriendApplicationNum
                },
                {
                    idx: 1,
                    type: ContactMenuTypes.NewGroup,
                    title: '新的群聊',
                    icon: require('static/images/contact_new_group.png'),
                    badge: this.storeUnHandleGroupApplicationNum
                },
                {
                    idx: 2,
                    type: ContactMenuTypes.MyFriend,
                    title: '我的好友',
                    icon: require('static/images/contact_my_friend.png'),
                    badge: 0
                },
                {
                    idx: 3,
                    type: ContactMenuTypes.MyGroup,
                    title: '我的群组',
                    icon: require('static/images/contact_my_group.png'),
                    badge: 0
                }
                // {
                // 	idx: 4,
                // 	type: ContactMenuTypes.Lable,
                // 	title: '标签',
                // 	icon: require("static/images/contact_my_lable.png"),
                // 	badge: 0
                // },
            ];
        }
    },
    methods: {
        menuClick({ type }) {
            switch (type) {
                case ContactMenuTypes.NewFriend:
                case ContactMenuTypes.NewGroup:
                    uni.navigateTo({
                        url: `/pages/contact/applicationList/index?applicationType=${type}`
                    });
                    break;
                case ContactMenuTypes.MyFriend:
                    uni.navigateTo({
                        url: '/pages/contact/friendList/index'
                    });
                    break;
                case ContactMenuTypes.MyGroup:
                    uni.navigateTo({
                        url: '/pages/contact/groupList/index'
                    });
                    break;
                case ContactMenuTypes.Lable:
                    uni.navigateTo({
                        url: '/pages/contact/lableList/index'
                    });
                    break;
                default:
                    break;
            }
        }
    }
};
</script>

<style lang="scss" scoped>
.menu_list {
    margin-bottom: 24rpx;
    background-color: #fff;

    &_item {
        @include vCenterBox();
        padding: 20rpx 30rpx;

        .item_content {
            @include btwBox();
            margin-left: 20rpx;
            flex: 1;
            position: relative;

            .icon {
                display: flex;

                .u-badge {
                    width: fit-content;
                    padding: 8rpx 12rpx;
                }
            }

            .bottom_line {
                height: 1px;
                width: 100%;
                background-color: #f1f1f1;
                position: absolute;
                bottom: -36rpx;
            }
        }

        &:last-child {
            .bottom_line {
                height: 0;
            }
        }
    }
}
</style>
