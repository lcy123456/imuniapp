<template>
    <view class="user_item" @click="clickItem">
        <view
            v-if="checkVisible"
            class="check_wrap"
            :class="{
                check_wrap_active: checked,
                check_wrap_disabled: disabled
            }"
        >
            <u-icon
                v-show="checked"
                name="checkbox-mark"
                size="12"
                color="#fff"
            />
        </view>

        <MyAvatar
            :src="item.faceURL"
            :desc="item.remark || item.nickname || item.showName"
            :is-group="item.groupName !== undefined || isGroupConversation"
            size="78rpx"
        />
        <view class="user_item_details">
            <text
                :class="[
                    'user_name',
                    lightSelf &&
                        storeCurrentUserID === item.userID &&
                        'self_name'
                ]"
            >
                {{
                    item.remark ||
                    item.nickname ||
                    item.groupName ||
                    item.showName
                }}
            </text>
            <view>
                <text v-if="item.roleLevel === 100" class="user_role">
                    {{ $t('Group_owner') }}
                </text>
                <text v-else-if="item.roleLevel === 60" class="user_role">
                    {{ $t('Administrator') }}
                </text>
            </view>
        </view>

        <slot name="action" />
    </view>
</template>

<script>
import { mapGetters } from 'vuex';
import MyAvatar from '@/components/MyAvatar/index.vue';
import { SessionType } from 'openim-uniapp-polyfill';

export default {
    name: 'UserItem',
    components: {
        MyAvatar
    },
    props: {
        checkVisible: {
            type: Boolean,
            default: false
        },
        checked: {
            type: Boolean,
            default: false
        },
        disabled: {
            type: Boolean,
            default: false
        },
        item: {
            type: Object,
            default: () => ({})
        },
        lightSelf: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {};
    },
    computed: {
        ...mapGetters(['storeCurrentUserID']),
        isGroupConversation() {
            return this.item.conversationType === SessionType.WorkingGroup;
        }
    },
    methods: {
        clickItem() {
            if (!this.disabled) {
                this.$emit(
                    this.checkVisible ? 'updateCheck' : 'itemClick',
                    this.item
                );
            }
        }
    }
};
</script>

<style lang="scss" scoped>
.user_item {
    height: 108rpx;
    padding: 0 20rpx;
    @include vCenterBox();

    .check_wrap {
        flex: 0 0 46rpx;
        height: 46rpx;
        border: 2px solid #979797;
        border-radius: 50%;
        margin-right: 30rpx;
        @include centerBox();

        &_active {
            background-color: #1d6bed;
            border: none;
        }

        &_disabled {
            background-color: #c8c9cc;
        }
    }

    .u-avatar {
        border-radius: 30rpx;
        overflow: hidden;
    }

    &_details {
        width: 100%;
        height: 100%;
        margin-left: 20rpx;
        border-bottom: 2rpx solid $uni-color-thinGrey;
        @include btwBox();

        .user_name {
            @include nomalEllipsis();
            max-width: 60%;
            color: $uni-text-color;
            &.self_name {
                color: $uni-color-primary;
            }
        }

        .user_role {
            font-size: 28rpx;
            color: $uni-text-color-grey;
        }
    }
}
</style>
