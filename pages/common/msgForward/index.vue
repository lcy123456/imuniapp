<template>
    <view class="forward_container">
        <CustomNavBar
            title="转发"
            is-bg-color2
        >
            <template slot="more">
                <text class="primary mr-32 fz-32">
                    选择联系人
                </text>
            </template>
        </CustomNavBar>
        <view class="px-20">
            <uni-search-bar
                v-model="keyword"
                class="h-70"
                placeholder="搜索"
            />
        </view>
        <view class="px-32">
            <MyTabs
                :list="tabList"
                type="square"
                class="fz-28"
                :height="86"
            />
        </view>
        <view class="conversation_box bg-color px-32">
            <view
                v-for="item in showConversationList" 
                :key="item.conversationID"
                class="li h-108 flex align-center"
                @click="chooseConversation(item)"
            >
                <MyAvatar
                    :is-group="item.conversationType === SessionType.WorkingGroup"
                    :src="item.faceURL"
                    :desc="item.showName"
                    size="78rpx"
                />
                <view class="name_box flex-grow ml-20 ">
                    {{ item.showName }}
                </view>
            </view>
        </view>
        <view>
            <u-modal
                :show="showModal"
                show-cancel-button
                confirm-text="发送"
                @confirm="handleConfirm"
                @cancel="showModal = false"
            >
                <view class="flex-grow">
                    <view class="ff-bold fz-36 mb-20">
                        发送给:
                    </view>
                    <view
                        v-for="item in sendConversationArr"
                        :key="item.conversationID"
                        class="flex align-center"
                    >
                        <MyAvatar
                            :is-group="item.conversationType === SessionType.WorkingGroup"
                            :src="item.faceURL"
                            :desc="item.showName"
                            size="78rpx"
                        />
                        <view class="name_box flex-grow ml-20 ">
                            {{ item.showName }}
                        </view>
                    </view>
                    <view class="flex justify-center">
                        <MessageContentWrap :message="message" />
                    </view>
                </view>
            </u-modal>
        </view>
    </view>
</template>

<script>
import { mapGetters } from 'vuex';
import IMSDK, {
    IMMethods,
    SessionType,
} from 'openim-uniapp-polyfill';
import CustomNavBar from '@/components/CustomNavBar/index.vue';
import MyTabs from '@/components/MyTabs/index.vue';
import MyAvatar from '@/components/MyAvatar/index.vue';
import MessageContentWrap from '../../conversation/chating/components/MessageItem/MessageContentWrap.vue';
import { offlinePushInfo } from '@/util/imCommon';

export default {
    components: {
        CustomNavBar,
        MyTabs,
        MyAvatar,
        MessageContentWrap
    },

    data () {
        return {
            SessionType: Object.freeze(SessionType),
            keyword: '',
            tabList: [
                { label: '全部对话', value: 0 },
            ],
            showModal: false,
            message: {},
            sendConversationArr: []
        };
    },
    computed: {
        ...mapGetters(['storeConversationList']),
        showConversationList () {
            return this.storeConversationList.filter(v => {
                return v.showName.includes(this.keyword);
            });
        }
    },
    onLoad (params) {
        const { message } = params;
        this.message = JSON.parse(decodeURIComponent(message));
    },

    methods: {
        chooseConversation (item) {
            // 单选
            this.sendConversationArr = [item];
            this.showModal = true;
        },
        async handleConfirm () {
            console.log('xxx', this.message, this.sendConversationArr);
            const conversation = this.sendConversationArr[0];
            this.$loading('转发中');
            const message = await IMSDK.asyncApi(IMMethods.CreateForwardMessage, IMSDK.uuid(), this.message);
            console.log('创建消息成功', message);
            IMSDK.asyncApi(IMMethods.SendMessage, IMSDK.uuid(), {
                recvID: conversation.userID,
                groupID: conversation.groupID,
                data: message,
                offlinePushInfo,
            }).then(({data}) => {
                console.log('发送消息成功', data);
                this.$toast('转发成功');
                setTimeout(() => {
                    uni.navigateBack();
                }, 1000);
            }).catch(() => {
                this.$toast('转发失败');
            }); 
            this.showModal = false;
        }
    },
};
</script>

<style lang="scss" scoped>
.forward_container {
    height: 100vh;
    @include colBox(false);
    background-color: $uni-bg-color-grey;
    .conversation_box {
        flex: 1;
        overflow: auto;
        border-radius: 30rpx 30rpx 0 0;
        /deep/.u-avatar {
            border-radius: 30rpx;
            overflow: hidden;
        }
        .name_box {
            height: 100%;
            @include vCenterBox();
            border-bottom: 2rpx solid $uni-border-color-grey;
        }
    }
}
</style>