<template>
    <Page>
        <view class="search_container">
            <custom-nav-bar :route="false">
                <view slot="left" />
                <view slot="center" class="search_bar">
                    <u-search
                        v-model="keyword"
                        :action-text="$t('Cancel')"
                        shape="square"
                        :placeholder="getPlaceholder"
                        @change="keywordChange"
                        @custom="cancel"
                        @search="startSearch"
                    />
                </view>
            </custom-nav-bar>

            <view
                v-show="!empty && !searching"
                class="result_row"
                @click="startSearch"
            >
                <image class="icon" :src="getIcon" alt="" />
                <view class="">
                    <text>{{ $t('Search') }}：</text>
                    <text>{{ keyword }}</text>
                </view>
            </view>

            <view
                v-show="searching && !empty"
                class="result_row result_row_empty"
            >
                <u-loading-icon />
            </view>

            <view v-show="empty" class="result_row result_row_empty">
                <text>{{ $t('No_search_results') }}</text>
            </view>
        </view>
    </Page>
</template>

<script>
import IMSDK from 'openim-uniapp-polyfill';
import CustomNavBar from '@/components/CustomNavBar/index.vue';

import searchGroup from 'static/images/contact_add_join_group.png';
import { businessSearchUserInfo } from '@/api/login';
const searchUser = '/static/images/contact_add_search_user.svg';

export default {
    components: {
        CustomNavBar
    },
    data() {
        return {
            keyword: '',
            searching: false,
            empty: false,
            isSearchGroup: false
        };
    },
    computed: {
        getIcon() {
            return this.isSearchGroup ? searchGroup : searchUser;
        },
        getPlaceholder() {
            return this.isSearchGroup
                ? this.$t('Please_enter_group_chat_ID')
                : this.$t('Please_enter_user_ID_or_mobile_phone_number');
        }
    },
    onLoad(options) {
        const { isSearchGroup } = options;
        this.isSearchGroup = JSON.parse(isSearchGroup);
    },
    methods: {
        cancel() {
            console.log('cancel');
            uni.navigateBack();
        },
        keywordChange() {
            if (this.empty) {
                this.empty = !this.empty;
            }
        },
        async startSearch() {
            if (!this.keyword) return;
            this.searching = true;
            try {
                if (this.isSearchGroup) {
                    let info = this.$store.getters.storeGroupList.find(
                        item => item.groupID === this.keyword
                    );
                    if (!info) {
                        const { data } = await IMSDK.asyncApi(
                            IMSDK.IMMethods.GetSpecifiedGroupsInfo,
                            IMSDK.uuid(),
                            [this.keyword]
                        );
                        info = data[0];
                    }
                    if (info) {
                        uni.navigateTo({
                            url: `/pages/common/groupCard/index?sourceInfo=${JSON.stringify(
                                info
                            )}`
                        });
                    } else {
                        this.empty = true;
                    }
                } else {
                    let info = this.$store.getters.storeFriendList.find(
                        item => item.userID === this.keyword
                    );
                    if (!info) {
                        const { total, users } = await businessSearchUserInfo(
                            this.keyword
                        );
                        if (total > 0) {
                            const { data } = await IMSDK.asyncApi(
                                IMSDK.IMMethods.GetUsersInfo,
                                IMSDK.uuid(),
                                [users[0].userID]
                            );
                            const imData =
                                data[0]?.friendInfo ??
                                data[0]?.publicInfo ??
                                {};

                            info = {
                                ...imData,
                                ...users[0]
                            };
                        }
                    }
                    if (info) {
                        uni.navigateTo({
                            url: `/pages/common/userCard/index?sourceInfo=${JSON.stringify(
                                info
                            )}`
                        });
                    } else {
                        this.empty = true;
                    }
                }
            } catch (e) {
                //TODO handle the exception
            }
            this.searching = false;
        }
    }
};
</script>

<style lang="scss" scoped>
.search_container {
    height: 100vh;
    background-color: #f8f8f8;

    .search_bar {
        width: 100%;
        padding: 0 44rpx;
    }

    .result_row {
        @include vCenterBox();
        padding: 24rpx 44rpx;
        font-size: 28rpx;
        color: $uni-text-color;
        background-color: #fff;

        .icon {
            width: 20px;
            height: 20px;
            margin-right: 24rpx;
        }

        &_empty {
            display: flex;
            justify-content: center;
            color: #999;
        }
    }
}
</style>
