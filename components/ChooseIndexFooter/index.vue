<template>
    <view class="member_checked_desc bg-grey">
        <view class="flex justify-between">
            <view class="left_info" @click="showSelected = true">
                <text class="text">
                    {{ `${$t('Selected')}：${choosedData.length}` }}
                </text>
                <u-icon name="arrow-up" size="14" color="#007aff" />
            </view>
            <view>
                <u-button
                    :loading="comfirmLoading"
                    :disabled="choosedData.length === 0"
                    type="primary"
                    :text="isRemove ? $t('Remove') : $t('Sure')"
                    @click="clickComfirm"
                />
            </view>
        </view>
        <u-popup round="24" :show="showSelected" mode="bottom" @close="close">
            <view class="selected_container">
                <view class="top_desc">
                    <text>{{
                        `${$t('Selected')}：${choosedData.length}`
                    }}</text>
                    <text class="comfirm_text" @click="close">
                        {{ $t('Sure') }}
                    </text>
                </view>
                <u-list class="selected_list">
                    <u-list-item
                        v-for="item in choosedData"
                        :key="item.userID || item.groupID"
                    >
                        <selected-member
                            :source="item"
                            @removeItem="removeItem(item)"
                        />
                    </u-list-item>
                </u-list>
            </view>
        </u-popup>
    </view>
</template>

<script>
import SelectedMember from './SelectedMember.vue';
export default {
    name: 'ChooseIndexFooter',
    components: {
        SelectedMember
    },
    props: {
        isRemove: Boolean,
        choosedData: Array,
        comfirmLoading: Boolean
    },
    data() {
        return {
            showSelected: false,
            showConfirmModal: false
        };
    },
    methods: {
        close() {
            this.showSelected = false;
        },
        removeItem(item) {
            this.$emit('removeItem', item);
        },
        clickComfirm() {
            this.$emit('confirm');
        }
    }
};
</script>

<style lang="scss" scoped>
.member_checked_desc {
    padding: 20rpx;

    .left_info {
        @include vCenterBox();
        color: $uni-color-primary;

        .text {
            font-size: 30rpx;
            margin-right: 24rpx;
        }
    }

    .u-button {
        // width: 72px;
        height: 32px;
        margin: 0;
    }
}

.selected_container {
    padding: 44rpx;

    .top_desc {
        @include btwBox();
        margin-bottom: 20rpx;

        .comfirm_text {
            color: $uni-color-primary;
            margin-right: 24rpx;
        }
    }

    .selected_list {
        height: 60vh !important;
        overflow-y: auto;
    }
}
</style>
