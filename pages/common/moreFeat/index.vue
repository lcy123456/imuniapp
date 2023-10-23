<template>
    <view class="more-feat">
        <view
            v-show="moreIndex === 1"
            class="select-box moreIndex1"
        >
            <view
                v-for="item of options"
                :key="item.text"
                class="flex li h-80 align-center"
                :style="item.style"
                @click.stop="callBack(item)"
            >
                <text>{{ item.text }}</text>
                <image
                    :class="['w-38', 'h-38']"
                    :src="item.icon"
                />
            </view>
            <view
                class="flex li h-80 align-center"
                @click.stop="moreIndex = 2"
            >
                <text>开启自动删除</text>
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
                    :src="'/static/images/back_time.png'"
                />
                <text class="ml-20">
                    返回
                </text>
            </view>
            <view class="item-box">
                <view
                    v-for="v of timeMenus"
                    :key="v.title"
                    class="flex li h-80 align-center"
                    :style="v.style"
                    @click="setBurnDuration(v)"
                >
                    <text>{{ v.title }}</text>
                </view>
            </view>
            <view
                class="flex word li h-108 align-center"
            >
                <text>在此之后发送的消息将在一段时间后被自动删除。</text>
            </view>
        </view>
        <u-picker
            :show="show"
            :key-name="'label'"
            :columns="columns"
            @confirm="confirm"
            @cancel="show = false;"
        />
    </view>
</template>

<script>
import { mapGetters } from "vuex";
import IMSDK, { IMMethods } from 'openim-uniapp-polyfill';

export default {
    name: 'MoreFeat',
    components: {
    },
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
    data () {
        return {
            show: false,
            moreIndex: 0,
            columns: [[
                {
                    id: 60 * 60 * 24 * 30,
                    label: '一个月'
                },
                {
                    id: 60 * 60 * 24 * 30 * 2,
                    label: '二个月'
                },
                {
                    id: 60 * 60 * 24 * 30 * 3,
                    label: '三个月'
                },
                {
                    id: 60 * 60 * 24 * 30 * 4,
                    label: '四个月'
                },
                {
                    id: 60 * 60 * 24 * 30 * 5,
                    label: '五个月'
                },
                {
                    id: 60 * 60 * 24 * 30 * 6,
                    label: '六个月'
                },
                {
                    id: 60 * 60 * 24 * 30 * 7,
                    label: '七个月'
                },
                {
                    id: 60 * 60 * 24 * 30 * 8,
                    label: '八个月'
                },
                {
                    id: 60 * 60 * 24 * 30 * 9,
                    label: '九个月'
                },
                {
                    id: 60 * 60 * 24 * 30 * 10,
                    label: '十个月'
                },
                {
                    id: 60 * 60 * 24 * 30 * 11,
                    label: '十一个月'
                },
                {
                    id: 60 * 60 * 24 * 30 * 12,
                    label: '十二个月'
                }
            ]],
            timeMenus: [
                {
                    title: '一天',
                    time: 60 * 60 * 24
                },
                {
                    title: '一周',
                    time: 60 * 60 * 24 * 7
                },
                {
                    title: '一个月',
                    time: 60 * 60 * 24 * 30
                },
                {
                    title: '其他',
                    time: 'other'
                },
                {
                    title: '停用',
                    time: 'stop',
                    style: {
                        color: '#EC4B37'
                    }
                },
            ],
            blackLoading: false,
            showConfirm: false,
        };
    },
    computed: {
        ...mapGetters([
            "storeSelfInfo"
        ]),
    },
    methods: {
        callBack (item) {
            this.$emit('callBack', item);
        },
        setMoreIndex (index) {
            this.moreIndex = index;
        },
        getMoreIndex () {
            return this.moreIndex;
        },
        confirm (e) {
            console.log(e);
            this.setConversationBurnDuration(e.value[0].id);
        },
        async setBurnDuration ({ time }) {
            switch (time) {
            case 'other':
                this.show = true;
                this.setMoreIndex(0);
                break;
            default:
                this.setConversationBurnDuration(time);
                break;
            }
        },
        async setConversationBurnDuration (time) {
            try {
                const conversationID = await IMSDK.asyncApi('getConversationIDBySessionType', IMSDK.uuid(), {
                    sourceID: this.sourceID,
                    sessionType: this.sessionType
                });
                console.log('conversationIDconversationIDconversationIDconversationID', conversationID, time, this.sessionType, this.sourceID);
                await IMSDK.asyncApi(IMMethods.SetConversationPrivateChat, IMSDK.uuid(), {
                    conversationID,
                    isPrivate: time !== 'stop',
                    ex: this.storeSelfInfo.nickname
                });
                const data = await IMSDK.asyncApi(IMMethods.SetConversationBurnDuration, IMSDK.uuid(), {
                    conversationID,
                    burnDuration: time,
                    ex: this.storeSelfInfo.nickname
                });
                console.log('datadatadatadatadatadatadatadatadatadatadatadatadata', data);
                if (data) {
                    this.show = false;
                    uni.$u.toast('设置成功');
                    this.moreIndex = 0;
                }
            } catch (err) {
                uni.$u.toast('设置失败，请稍后重试');
                console.log(err);
            }
        }
    },
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
        z-index: 99;
        top: 130rpx;
        margin-top: 10rpx;
        right: 0;
        background: #FFFFFF;
        box-shadow: 0rpx 0rpx 10rpx 0rpx rgba(0,0,0,0.15);
        border-radius: 30rpx 30rpx 30rpx 30rpx;
        .li {
            justify-content: space-between;
            width: 100%;
            padding: 0 33rpx;
            border-bottom: 1px solid #E9E9E9;
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
                border-top: 15rpx solid #E9E9E9;
                border-bottom: 15rpx solid #E9E9E9;
            }
        }
    }
}
</style>
