<template>
    <Page>
        <view class="application_list_container">
            <custom-nav-bar :title="getTitle" />

            <u-list class="application_list">
                <u-list-item
                    v-for="application in getRenderData"
                    :key="getKey(application)"
                >
                    <application-item
                        :is-recv="isRecv"
                        :application="application"
                    />
                </u-list-item>
            </u-list>
        </view>
    </Page>
</template>

<script>
import CustomNavBar from '@/components/CustomNavBar/index.vue';
import ApplicationItem from '../applicationList/ApplicationItem.vue';
export default {
    components: {
        CustomNavBar,
        ApplicationItem
    },
    data() {
        return {
            isGroupApplication: false,
            isRecv: false
        };
    },
    computed: {
        getRenderData() {
            let getterKey = this.isRecv
                ? 'storeRecvFriendApplications'
                : 'storeSentFriendApplications';
            if (this.isGroupApplication) {
                getterKey = this.isRecv
                    ? 'storeRecvGroupApplications'
                    : 'storeSentGroupApplications';
            }
            return [...this.$store.getters[getterKey]].sort((a, b) =>
                a.handleResult === 0 ? -1 : 1
            );
        },
        getKey() {
            return application => {
                if (this.isGroupApplication) {
                    return this.isRecv
                        ? application.userID + application.groupID
                        : application.groupID;
                }
                return application[this.isRecv ? 'fromUserID' : 'toUserID'];
            };
        },
        getTitle() {
            if (!this.isRecv) {
                return this.$t('My_application');
            }
            return this.isGroupApplication
                ? this.$t('Group_notification')
                : this.$t('Friend_request');
        }
    },
    onLoad(options) {
        const { isGroupApplication, isRecv } = options;
        this.isGroupApplication = JSON.parse(isGroupApplication);
        this.isRecv = JSON.parse(isRecv);
    },
    methods: {}
};
</script>

<style lang="scss" scoped>
.application_list_container {
    @include colBox(false);
    height: 100vh;
    background-color: #f8f8f8;

    .application_list {
        margin-top: 24rpx;
        flex: 1;
    }
}
</style>
