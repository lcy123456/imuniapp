<template>
    <Page>
        <view class="group_members_container page_container">
            <CustomNavBar :title="$t('Group_Members')" />
            <view class="px-20 pb-20 pt-10">
                <uni-search-bar
                    v-model="keyword"
                    bg-color="#fff"
                    class="h-70"
                    focus
                    :placeholder="$t('Search')"
                    @cancel="handleCancel"
                />
            </view>

            <u-list
                class="member_list"
                lower-threshold="100"
                @scrolltolower="scrolltolower"
            >
                <u-list-item
                    v-for="member in groupMemberList"
                    :key="member.userID"
                >
                    <UserItem
                        :item="member"
                        light-self
                        @itemClick="userClick"
                    />
                </u-list-item>
                <view v-show="loadState.loading" class="member_loading">
                    <u-loading-icon />
                </view>
            </u-list>
        </view>
    </Page>
</template>

<script>
import { mapGetters } from 'vuex';
import IMSDK, { IMMethods, GroupMemberRole } from 'openim-uniapp-polyfill';
import CustomNavBar from '@/components/CustomNavBar/index.vue';
import UserItem from '@/components/UserItem/index.vue';

export default {
    components: {
        CustomNavBar,
        UserItem
    },
    data() {
        return {
            groupID: '',
            selfInfo: {},
            keyword: '',
            groupMemberList: [],
            loadState: {
                hasMore: true,
                loading: false
            }
        };
    },
    computed: {
        ...mapGetters(['storeCurrentUserID']),
        isOwner() {
            return this.selfInfo.roleLevel === GroupMemberRole.Owner;
        },
        isAdmin() {
            return this.selfInfo.roleLevel === GroupMemberRole.Admin;
        }
    },
    onLoad(options) {
        const { groupID } = options;
        this.groupID = groupID;
        this.handleGetData(groupID);
    },
    methods: {
        handleGetData() {
            this.getSelfInfoInGroup();
            this.getMemberList();
        },
        async getSelfInfoInGroup() {
            const { data } = await IMSDK.asyncApi(
                IMMethods.GetSpecifiedGroupsInfo,
                IMSDK.uuid(),
                [this.storeCurrentUserID]
            );
            this.selfInfo = data[0];
        },
        async getMemberList() {
            try {
                this.loadState.loading = true;
                const { data } = await IMSDK.asyncApi(
                    IMSDK.IMMethods.GetGroupMemberList,
                    IMSDK.uuid(),
                    {
                        groupID: this.groupID,
                        filter: 0,
                        offset: this.groupMemberList.length,
                        count: 20
                    }
                );
                this.groupMemberList = [...this.groupMemberList, ...data];
                this.loadState.hasMore = data.length === 20;
            } catch (err) {
                console.log(err);
            }

            this.loadState.loading = false;
        },
        handleCancel() {
            uni.navigateBack();
        },
        userClick(member) {
            let url = '/pages/common/userCard/index';
            if (this.storeCurrentUserID === member.userID) {
                url = '/pages/profile/selfInfo/index';
            }
            uni.$u.route(url, {
                sourceID: member.userID
            });
        },
        scrolltolower() {
            if (this.loadState.hasMore && !this.loadState.loading) {
                this.getMemberList();
            }
        }
    }
};
</script>

<style lang="scss" scoped>
.group_members_container {
    .member_list {
        flex: 1;
    }
}
</style>
