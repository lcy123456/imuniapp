<template>
    <view class="forward_container">
        <CustomNavBar
            title="转发"
            is-bg-color2
        >
            <template slot="more">
                <text
                    class="primary mr-32 fz-32"
                    @click="chooseContact"
                >
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
        <MyTabs
            :list="tabList"
            type="square"
            class="fz-28 mx-32"
            :height="86"
        />
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
                <view class="flex-grow over-hide">
                    <view class="ff-bold fz-36 mb-20">
                        发送给:
                    </view>
                    <view class="flex align-center">
                        <MyAvatar
                            v-for="item in sendObjectArr"
                            :key="item.userID"
                            :is-group="item.conversationType === SessionType.WorkingGroup"
                            :src="item.faceURL"
                            :desc="item.showName"
                            size="78rpx"
                            class="mr-20"
                        />
                        <view
                            v-if="sendObjectArr.length === 1"
                            class="name_box flex-grow"
                        >
                            {{ sendObjectArr[0].showName }}
                        </view>
                    </view>
                    <view :class="['flex mt-10', (isTextRender && isMergeRender) ? '' : 'justify-center']">
                        <view v-if="isMergeRender">
                            [合并消息]{{ message.mergeElem.title }}
                        </view>
                        <MessageContentWrap
                            v-else
                            :message="message"
                        />
                    </view>
                </view>
            </u-modal>
        </view>
    </view>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import IMSDK, {
    IMMethods,
    SessionType,
    MessageStatus,
} from 'openim-uniapp-polyfill';
import CustomNavBar from '@/components/CustomNavBar/index.vue';
import MyTabs from '@/components/MyTabs/index.vue';
import MyAvatar from '@/components/MyAvatar/index.vue';
import MessageContentWrap from '../../conversation/chating/components/MessageItem/MessageContentWrap.vue';
import { offlinePushInfo } from '@/util/imCommon';
import { 
    ContactChooseTypes, 
    UpdateMessageTypes, 
    TextRenderTypes,
    MergeRenderTypes
} from '@/constant';


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
            sendObjectArr: [],
            isGetCheckUsers: false
        };
    },
    computed: {
        ...mapGetters(['storeConversationList', 'storeCurrentConversation']),
        showConversationList () {
            return this.storeConversationList.filter(v => {
                return v.showName.includes(this.keyword);
            });
        },
        isTextRender () {
            return TextRenderTypes.includes(this.message.contentType);
        },
        isMergeRender () {
            return MergeRenderTypes.includes(this.message.contentType);
        },
    },
    onLoad (params) {
        const { message } = params;
        this.message = JSON.parse(decodeURIComponent(message));
    },
    onShow () {
        if (this.isGetCheckUsers) {
            this.showModal = true;
            this.isGetCheckUsers = false;
        }
    },
    methods: {
        ...mapActions('message', ['pushNewMessage', 'updateOneMessage']),
        chooseConversation (item) {
            // 单选
            this.sendObjectArr = [item];
            this.showModal = true;
        },
        async handleConfirm () {
            for (let i = 0; i < this.sendObjectArr.length; i++) {
                const sendObject = this.sendObjectArr[i];
                const isCurConversation = this.storeCurrentConversation.userID === sendObject.userID;
                try {
                    this.$loading('转发中');
                    let message;
                    if (this.isMergeRender) {
                        message = this.message;
                    } else {
                        message = await IMSDK.asyncApi(IMMethods.CreateForwardMessage, IMSDK.uuid(), this.message);
                    }
                    if (isCurConversation) {
                        this.pushNewMessage(message);
                    }
                
                    const res = await IMSDK.asyncApi(IMMethods.SendMessage, IMSDK.uuid(), {
                        recvID: sendObject.userID,
                        groupID: sendObject.groupID,
                        message,
                        offlinePushInfo,
                    });
                    this.$toast('转发成功');
                    if (isCurConversation) {
                        this.updateOneMessage({
                            message: res.data,
                            isSuccess: true,
                        });
                    }
                } catch ({data, errCode}) {
                    if (isCurConversation) {
                        this.updateOneMessage({
                            message: data,
                            type: UpdateMessageTypes.KeyWords,
                            keyWords: [
                                {
                                    key: 'status',
                                    value: MessageStatus.Failed,
                                },
                                {
                                    key: 'errCode',
                                    value: errCode,
                                },
                            ],
                        });
                    }
                    this.$toast('转发失败');
                }
            }
            this.showModal = false;
            uni.$emit('forward_finish');
            setTimeout(() => {
                uni.navigateBack();
            }, 1000);
        },
        chooseContact () {
            uni.$u.route('/pages/common/contactChoose/index', {
                type: ContactChooseTypes.Forward
            });
        },
        getCheckUsers (val) {
            this.sendObjectArr = val.map((v) => {
                return {
                    ...v,
                    groupID: '',
                    showName: v.nickname
                };
            });
            this.isGetCheckUsers = true;
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
            border-bottom: 2rpx solid $uni-color-thinGrey;
        }
    }
    /deep/.text_message_container {
        padding: 0;
        & > view {
            @include ellipsisWithLine(2);
        }
    }
}
</style>