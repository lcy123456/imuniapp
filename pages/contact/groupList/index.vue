<template>
    <view class="group_list_container">
        <CustomNavBar
            title="我的群组"
            is-bg-color2
        >
            <view
                slot="more"
                class="mr-30 primary ff-medium fz-30"
                @click="toCreateGroup"
            >
                <text>发起群聊</text>
            </view>
        </CustomNavBar>
        <view class="px-20 pb-20 pt-10">
            <u-search
                v-model="keyword"
                shape="square"
                placeholder="搜索群组"
                :show-action="false"
                input-align="center"
                bg-color="#fff"
                height="70rpx"
            />
        </view>

        <view class="bg-color px-30 py-28">
            <MyTabs
                :list="tabList"
                @change="tabsChange"
            />
        </view>
        <view class="pane_row">
            <view
                class="pane_transform"
                :style="{
                    transform: `translateX(${isMyCreate ? '0' : '-100%'})`,
                }"
            >
                <view class="pane_content">
                    <u-list
                        v-if="getMyCreateGroupList.length > 0"
                        class="group_list"
                    >
                        <u-list-item
                            v-for="group in getMyCreateGroupList"
                            :key="group.groupID"
                        >
                            <GroupItem :group-info="group" />
                        </u-list-item>
                    </u-list>
                    <u-empty
                        v-else
                        mode="list"
                    />
                </view>
                <view class="pane_content">
                    <u-list
                        v-if="getMyJoinedGroupList.length > 0"
                        class="application_list"
                    >
                        <u-list-item
                            v-for="group in getMyJoinedGroupList"
                            :key="group.groupID"
                        >
                            <GroupItem :group-info="group" />
                        </u-list-item>
                    </u-list>
                    <u-empty
                        v-else
                        mode="list"
                    />
                </view>
            </view>
        </view>
    </view>
</template>

<script>
import { mapGetters } from 'vuex';
import CustomNavBar from '@/components/CustomNavBar/index.vue';
import MyTabs from '@/components/MyTabs/index.vue';
import GroupItem from './GroupItem.vue';

export default {
    components: {
        CustomNavBar,
        MyTabs,
        GroupItem,
    },
    data () {
        return {
            keyword: '',
            tabList: [
                { label: '我创建的', value: 0 },
                { label: '我加入的', value: 1 },
            ],
            isMyCreate: true,
        };
    },
    computed: {
        ...mapGetters(['storeGroupList', 'storeCurrentUserID']),
        getMyCreateGroupList () {
            return this.storeGroupList.filter(
                (group) => group.ownerUserID === this.storeCurrentUserID
            );
        },
        // getListHeight () {
        //     const statusBar = uni.getWindowInfo().statusBarHeight;
        //     const searchBar = 58;
        //     const tabAndNavBar = 44 * 2;
        //     const titleBar = 32;
        //     return uni.getWindowInfo().safeArea.height - statusBar - searchBar - tabAndNavBar - titleBar;
        // },
        getMyJoinedGroupList () {
            // console.log(this.storeGroupList.filter(group => group.ownerUserID !== this.storeCurrentUserID));
            return this.storeGroupList.filter(
                (group) => group.ownerUserID !== this.storeCurrentUserID
            );
        },
    },
    mounted () {},
    methods: {
        tabsChange ({ value }) {
            this.isMyCreate = value === 0;
        },
        toCreateGroup () {
            uni.navigateTo({
                url: `/pages/common/createGroup/index`,
            });
        },
    },
};
</script>

<style lang="scss" scoped>
.group_list_container {
    @include colBox(false);
    height: 100vh;
    background-color: $uni-bg-color-grey;

    .pane_row {
        flex: 1;
        overflow: hidden;

        .pane_transform {
            transition: all 0.3s ease 0s !important;
            height: 100%;
            display: flex;

            .pane_content {
                flex: 0 0 100%;
                background-color: #fff;

                .group_list,
                .u-empty {
                    height: 100% !important;
                }
            }
        }
    }
}
</style>
