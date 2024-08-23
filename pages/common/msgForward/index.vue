<template>
    <Page>
        <view class="forward_container">
            <CustomNavBar :title="$t('Forward')" is-bg-color2>
                <template slot="more">
                    <text class="mr-32 primary fz-32" @click="chooseContact">
                        {{ $t('Select_contact') }}
                    </text>
                </template>
            </CustomNavBar>
            <view class="px-20">
                <uni-search-bar
                    v-model="keyword"
                    class="h-70"
                    :placeholder="$t('Search')"
                />
            </view>
            <MyTabs
                :list="tabList"
                type="square"
                class="mx-32 fz-28"
                :height="86"
            />
            <view class="px-32 conversation_box bg-color">
                <view
                    v-for="item in showConversationList"
                    :key="item.conversationID"
                    class="flex li h-108 align-center"
                    @click="chooseConversation(item)"
                >
                    <MyAvatar
                        :is-group="
                            item.conversationType === SessionType.WorkingGroup
                        "
                        :src="item.faceURL"
                        :desc="item.showName"
                        size="78rpx"
                    />
                    <view class="flex-grow ml-20 name_box">
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
                        <view class="mb-20 ff-bold fz-36">
                            {{ $t('Send_to') }}:
                        </view>
                        <view class="flex align-center">
                            <MyAvatar
                                v-for="item in sendObjectArr"
                                :key="item.userID"
                                :is-group="
                                    item.conversationType ===
                                    SessionType.WorkingGroup
                                "
                                :src="item.faceURL"
                                :desc="item.showName"
                                size="78rpx"
                                class="mr-20"
                            />
                            <view
                                v-if="sendObjectArr.length === 1"
                                class="flex-grow name_box"
                            >
                                {{ sendObjectArr[0].showName }}
                            </view>
                        </view>
                        <view
                            :class="[
                                'flex mt-10',
                                isTextRender && isMergeRender
                                    ? ''
                                    : 'justify-center'
                            ]"
                        >
                            <view v-if="isMergeRender">
                                [{{ $t('Merge_messages') }}]{{
                                    message.mergeElem.title
                                }}
                            </view>
                            <MessageContentWrap
                                v-else
                                :message="message"
                                :only-message="true"
                            />
                        </view>
                    </view>
                </u-modal>
            </view>
            <Notification
                v-model="isShowNotification"
                :text="
                    $t(
                        'Message_has_been_sent_but_the_other_party_refused_to_receive_it'
                    )
                "
            />
        </view>
    </Page>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import IMSDK, {
    IMMethods,
    SessionType,
    MessageStatus
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

    data() {
        return {
            SessionType: Object.freeze(SessionType),
            isShowNotification: false,
            keyword: '',
            tabList: [{ label: this.$t('All_conversations'), value: 0 }],
            showModal: false,
            message: {},
            sendObjectArr: [],
            isGetCheckUsers: false
        };
    },
    computed: {
        ...mapGetters([
            'storeConversationList',
            'storeCurrentConversation',
            'storeHasMoreAfterMessage'
        ]),
        showConversationList() {
            return this.storeConversationList.filter(v => {
                return v.showName.includes(this.keyword);
            });
        },
        isTextRender() {
            return TextRenderTypes.includes(this.message.contentType);
        },
        isMergeRender() {
            return MergeRenderTypes.includes(this.message.contentType);
        }
    },
    onLoad(params) {
        const { message } = params;
        this.message = JSON.parse(decodeURIComponent(message));
    },
    onShow() {
        if (this.isGetCheckUsers) {
            this.showModal = true;
            this.isGetCheckUsers = false;
        }
    },
    methods: {
        ...mapActions('message', ['pushNewMessage', 'updateOneMessage']),
        chooseConversation(item) {
            // 单选
            this.sendObjectArr = [item];
            this.showModal = true;
        },
        async handleConfirm() {
            for (let i = 0; i < this.sendObjectArr.length; i++) {
                const sendObject = this.sendObjectArr[i];
                const isCurConversation =
                    this.storeCurrentConversation.userID === sendObject.userID;
                try {
                    this.$loading(this.$t('Forwarding'));
                    const message = this.message;

                    if (isCurConversation) {
                        if (this.storeHasMoreAfterMessage) {
                            console.log('发送信息。。。。需要重新new');
                            let pages = getCurrentPages();
                            let prevPage = pages[pages.length - 2];
                            await prevPage.$vm.setPositionMsgID('');
                        }
                        this.pushNewMessage(message);
                    }
                    const res = await IMSDK.asyncApi(
                        IMMethods.SendMessage,
                        IMSDK.uuid(),
                        {
                            recvID: sendObject.userID,
                            groupID: sendObject.groupID,
                            message,
                            offlinePushInfo
                        }
                    );
                    this.$toast(this.$t('Forwarded_successfully'));
                    if (isCurConversation) {
                        this.updateOneMessage({
                            message: res.data,
                            isSuccess: true
                        });
                    }
                } catch ({ data, errCode }) {
                    console.log('发送失败', data, errCode);
                    if (isCurConversation) {
                        if (errCode === 1302) {
                            console.log('被拉黑了');
                            this.isShowNotification = true;
                        }
                        this.updateOneMessage({
                            message: data,
                            type: UpdateMessageTypes.KeyWords,
                            keyWords: [
                                {
                                    key: 'status',
                                    value: MessageStatus.Failed
                                },
                                {
                                    key: 'errCode',
                                    value: errCode
                                }
                            ]
                        });
                    }
                    this.$toast(this.$t('Forwarding_failed'));
                }
            }
            this.showModal = false;
            setTimeout(() => {
                uni.navigateBack();
            }, 1000);
            setTimeout(() => {
                uni.$emit('forward_finish');
            }, 1500);
        },
        chooseContact() {
            uni.$u.route('/pages/common/contactChoose/index', {
                type: ContactChooseTypes.Forward
            });
        },
        getCheckUsers(val) {
            this.sendObjectArr = val.map(v => {
                return {
                    ...v,
                    groupID: '',
                    showName: v.nickname
                };
            });
            this.isGetCheckUsers = true;
        }
    }
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
    /deep/.text_message_container .base-box {
        display: none;
    }
}
</style>
