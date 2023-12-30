<template>
    <Page>
        <view class="application_list_container">
            <CustomNavBar
                :title="isGroupApplication ? '群通知' : '新的朋友'"
                is-bg-color2
            />
            <view class="px-20 pb-20 pt-10">
                <u-search
                    shape="square"
                    :placeholder="`搜索${isGroupApplication ? '群' : '朋友'}`"
                    :show-action="false"
                    input-align="center"
                    bg-color="#fff"
                    height="70rpx"
                />
            </view>

            <view class="bg-color px-30 py-28">
                <MyTabs :list="tabList" @change="tabsChange" />
            </view>
            <view class="pane_row">
                <view
                    class="pane_transform"
                    :style="{
                        transform: `translateX(${isRecv ? '0' : '-100%'})`
                    }"
                >
                    <view class="pane_content">
                        <u-list
                            v-if="getRecvRenderData.length > 0"
                            class="application_list"
                        >
                            <u-list-item
                                v-for="application in getRecvRenderData"
                                :key="
                                    application[
                                        !isGroupApplication
                                            ? 'fromUserID'
                                            : 'userID'
                                    ] + application.groupID
                                "
                            >
                                <ApplicationItem
                                    :is-recv="true"
                                    :application="application"
                                />
                            </u-list-item>
                        </u-list>
                        <u-empty v-else mode="list" />
                    </view>
                    <view class="pane_content">
                        <u-list
                            v-if="getSendRenderData.length > 0"
                            class="application_list"
                        >
                            <u-list-item
                                v-for="application in getSendRenderData"
                                :key="
                                    application[
                                        !isGroupApplication
                                            ? 'toUserID'
                                            : 'groupID'
                                    ]
                                "
                            >
                                <ApplicationItem :application="application" />
                            </u-list-item>
                        </u-list>
                        <u-empty v-else mode="list" />
                    </view>
                </view>

                <!-- <view
                v-if="
                    isRecv
                        ? getRecvRenderData.length > 0
                        : getSendRenderData.length > 0
                "
                class="view_all"
            >
                <u-button
                    type="primary"
                    :plain="true"
                    :text="`查看全部${isGroupApplication ? '群通知' : '好友请求'}`"
                    @click="previewAll"
                />
            </view> -->
            </view>
        </view>
    </Page>
</template>

<script>
import { mapGetters } from 'vuex';
import { ContactMenuTypes } from '@/constant';
import CustomNavBar from '@/components/CustomNavBar/index.vue';
import MyTabs from '@/components/MyTabs/index.vue';
import ApplicationItem from './ApplicationItem.vue';

export default {
    components: {
        MyTabs,
        CustomNavBar,
        ApplicationItem
    },
    data() {
        return {
            keyword: '',
            isRecv: true,
            isGroupApplication: false
        };
    },
    computed: {
        ...mapGetters([
            'storeRecvFriendApplications',
            'storeSentFriendApplications',
            'storeRecvGroupApplications',
            'storeSentGroupApplications',
            'storeUnHandleFriendApplicationNum',
            'storeUnHandleGroupApplicationNum'
        ]),
        getRecvRenderData() {
            const tmpList = this.isGroupApplication
                ? this.storeRecvGroupApplications
                : this.storeRecvFriendApplications;
            tmpList.sort(a => (a.handleResult === 0 ? -1 : 1));
            return [...tmpList];
        },
        getSendRenderData() {
            const tmpList = this.isGroupApplication
                ? this.storeSentGroupApplications
                : this.storeSentFriendApplications;
            tmpList.sort(a => (a.handleResult === 0 ? -1 : 1));
            return [...tmpList];
        },
        tabList() {
            return [
                {
                    label: this.isGroupApplication ? '入群申请' : '好友请求',
                    value: 0
                },
                { label: '我的请求', value: 1 }
            ];
        }
    },
    onLoad(params) {
        const { applicationType } = params;
        this.isGroupApplication = applicationType === ContactMenuTypes.NewGroup;
    },
    methods: {
        tabsChange({ value }) {
            this.isRecv = value === 0;
        },
        // previewAll () {
        //     uni.navigateTo({
        //         url: `/pages/contact/applicationListDetails/index?isGroupApplication=${this.isGroupApplication}&isRecv=${this.isRecv}`,
        //     });
        // },
        toSearch() {
            uni.navigateTo({
                url: `/pages/common/searchUserOrGroup/index?isSearchGroup=${this.isGroupApplication}`
            });
        }
    }
};
</script>

<style lang="scss" scoped>
.application_list_container {
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

                .application_list {
                    height: 100% !important;
                }
                .u-empty {
                    height: 100%;
                }
            }
        }
    }

    .view_all {
        margin-top: 48rpx;

        .u-button {
            border: none;
        }
    }
}
</style>
