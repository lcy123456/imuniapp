<template>
    <view class="more-feat">
        <view v-show="moreIndex === 1" class="select-box moreIndex1">
            <view
                v-for="item of options"
                :key="item.text"
                class="flex li h-80 align-center"
                :style="item.style"
                @click.stop="callBack(item)"
            >
                <text>{{ item.text }}</text>
                <image :class="['w-38', 'h-38']" :src="item.icon" />
            </view>
            <view class="flex li h-80 align-center" @click.stop="moreIndex = 2">
                <text>{{ $t('Turn_on_automatic_deletion') }}</text>
                <image
                    :class="['w-38', 'h-38']"
                    :src="'/static/images/automatic_del.png'"
                />
            </view>
        </view>
        <view
            v-show="moreIndex === 2"
            class="select-box moreIndex2"
            @click.stop="() => {}"
        >
            <view
                class="flex back li h-80 align-center"
                @click.stop="moreIndex = 1"
            >
                <image
                    :class="['w-38', 'h-35']"
                    :src="'/static/images/back_time.svg'"
                />
                <text class="ml-20"> {{ $t('Return') }} </text>
            </view>
            <view class="item-box">
                <view
                    v-for="v of timeMenus"
                    :key="v.id"
                    class="flex li h-80 align-center"
                    :style="v.style"
                    @click="setBurnDuration(v)"
                >
                    <text>{{ v.label }}</text>
                </view>
            </view>
            <view class="flex word li h-108 align-center">
                <text>{{
                    $t(
                        'Messages_sent_after_this_will_be_automatically_deleted_after_a_period_of_time'
                    )
                }}</text>
            </view>
        </view>
        <u-picker
            :show="show"
            :key-name="'label'"
            :confirm-text="$t('Sure')"
            :cancel-text="$t('Cancel')"
            :columns="columns"
            @confirm="confirm"
            @cancel="show = false"
        />
    </view>
</template>

<script>
import { mapGetters } from 'vuex';
import IMSDK, { IMMethods } from 'openim-uniapp-polyfill';
import { burnMenuList } from '@/util/imCommon';

export default {
    name: 'MoreFeat',
    components: {},
    props: {
        options: {
            type: Array,
            default: () => []
        },
        sourceID: {
            type: String,
            default: ''
        },
        sessionType: {
            type: Number,
            default: 1
        }
    },
    data() {
        return {
            show: false,
            moreIndex: 0,
            columns: [burnMenuList.slice(2)],
            timeMenus: [
                ...burnMenuList.slice(0, 3),
                {
                    label: this.$t('Others'),
                    id: 'other'
                },
                {
                    label: this.$t('Deactivate'),
                    id: 'stop',
                    style: {
                        color: '#EC4B37'
                    }
                }
            ],
            blackLoading: false,
            showConfirm: false
        };
    },
    computed: {
        ...mapGetters(['storeSelfInfo'])
    },
    methods: {
        callBack(item) {
            this.$emit('callBack', item);
        },
        setMoreIndex(index) {
            this.moreIndex = index;
        },
        getMoreIndex() {
            return this.moreIndex;
        },
        confirm(e) {
            console.log(e);
            this.setConversationBurnDuration(e.value[0].id);
        },
        async setBurnDuration({ id }) {
            switch (id) {
                case 'other':
                    this.show = true;
                    this.setMoreIndex(0);
                    break;
                default:
                    this.setConversationBurnDuration(id);
                    break;
            }
        },
        async setConversationBurnDuration(time) {
            try {
                const conversationID = await IMSDK.asyncApi(
                    'getConversationIDBySessionType',
                    IMSDK.uuid(),
                    {
                        sourceID: this.sourceID,
                        sessionType: this.sessionType
                    }
                );
                console.log(
                    'conversationIDconversationIDconversationIDconversationID',
                    conversationID,
                    time,
                    this.sessionType,
                    this.sourceID
                );
                const privateChatData = await IMSDK.asyncApi(
                    IMMethods.SetConversationPrivateChat,
                    IMSDK.uuid(),
                    {
                        conversationID,
                        isPrivate: time !== 'stop',
                        ex: this.storeSelfInfo.nickname
                    }
                );
                if (privateChatData && time === 'stop') {
                    this.show = false;
                    uni.$u.toast(this.$t('Set_up_successfully'));
                    this.moreIndex = 0;
                    return;
                }
                const data = await IMSDK.asyncApi(
                    IMMethods.SetConversationBurnDuration,
                    IMSDK.uuid(),
                    {
                        conversationID,
                        burnDuration: time,
                        ex: this.storeSelfInfo.nickname
                    }
                );
                if (data) {
                    this.show = false;
                    uni.$u.toast(this.$t('Set_up_successfully'));
                    this.moreIndex = 0;
                }
            } catch (err) {
                uni.$u.toast(this.$t('Setup_failed_please_try_again_later'));
                console.log(err);
            }
        }
    }
};
</script>

<style lang="scss" scoped>
.more-feat {
    .feat-item {
        position: relative;
    }
    .select-box {
        position: absolute;
        width: 420rpx;
        z-index: 99999;
        top: 130rpx;
        margin-top: 10rpx;
        right: 0;
        background: #ffffff;
        box-shadow: 0rpx 0rpx 10rpx 0rpx rgba(0, 0, 0, 0.15);
        border-radius: 30rpx 30rpx 30rpx 30rpx;
        .li {
            justify-content: space-between;
            width: 100%;
            padding: 0 33rpx;
            border-bottom: 1px solid #e9e9e9;
            &:last-child {
                border: none;
            }
            uni-text {
                font-size: 32rpx;
            }
        }
        &.moreIndex2 {
            .li {
                border: none;
                &.back {
                    justify-content: flex-start;
                }
            }
            .item-box {
                border-top: 15rpx solid #e9e9e9;
                border-bottom: 15rpx solid #e9e9e9;
            }
        }
    }
}
</style>
