<template>
    <Page>
        <view class="page_container">
            <CustomNavBar :title="$t('Address_book_blacklist')" />

            <u-list v-if="blockList.length > 0" class="block_list" height="1">
                <u-list-item v-for="item in blockList" :key="item.userID">
                    <UserItem :item="item">
                        <view
                            slot="action"
                            class="user_action"
                            @click="tryRemove(item)"
                            >{{ $t('Remove') }}</view
                        >
                    </UserItem>
                </u-list-item>
            </u-list>

            <u-empty v-else mode="list" />

            <u-modal
                width="500rpx"
                show-cancel-button
                :show="showComfirm"
                :content="
                    $t('Are_you_sure_to_remove_the_user_from_the_blacklist')
                "
                :confirm-text="$t('Sure')"
                :cancel-text="$t('Cancel')"
                :async-close="true"
                @confirm="confirm"
                @cancel="closeModal"
            />
        </view>
    </Page>
</template>

<script>
import IMSDK from 'openim-uniapp-polyfill';
import CustomNavBar from '@/components/CustomNavBar/index.vue';
import MyAvatar from '@/components/MyAvatar/index.vue';
import UserItem from '@/components/UserItem/index.vue';
export default {
    components: {
        CustomNavBar,
        MyAvatar,
        UserItem
    },
    data() {
        return {
            showComfirm: false,
            selectedUser: {}
        };
    },
    computed: {
        blockList() {
            return this.$store.getters.storeBlackList;
        }
    },
    methods: {
        tryRemove(item) {
            this.selectedUser = {
                ...item
            };
            this.showComfirm = true;
        },
        confirm() {
            IMSDK.asyncApi(
                IMSDK.IMMethods.RemoveBlack,
                IMSDK.uuid(),
                this.selectedUser.userID
            )
                .then(() => uni.$u.toast(this.$t('Remove_successfully')))
                .catch(() => uni.$u.toast(this.$t('Remove_failed')))
                .finally(() => (this.showComfirm = false));
        },
        closeModal() {
            this.showComfirm = false;
        }
    }
};
</script>

<style lang="scss" scoped>
.page_container {
    @include colBox(false);
    height: 100vh;
    background-color: $uni-bg-color-grey;

    .block_list {
        flex: 1;
        margin-top: 24rpx;

        .user_item {
            background-color: #fff;
        }

        .user_action {
            position: absolute;
            right: 44rpx;
            font-size: 28rpx;
            color: $uni-color-primary;
        }
    }

    .u-empty {
        margin-top: 25vh !important;
    }
}
</style>
