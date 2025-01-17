<template>
    <view v-if="shouldShow" class="join_group_call">
        <view class="avatar_panel">
            <MyAvatar
                :src="faceURL"
                :is-group="true"
                :shape="`circle`"
                size="80rpx"
            />
            <view class="flex ml-20 flex-column">
                <text class="text-color fz-30"> 群组语音通话中 </text>
                <text class="text-color fz-28"> {{ count }}人 </text>
            </view>
        </view>
        <u-button
            v-if="!storeIsIncomingCallLoading && !storeIsIncomingCallIng"
            @click="onJoin"
        >
            加入
        </u-button>
    </view>
</template>

<script>
import MyAvatar from '@/components/MyAvatar/index.vue';
import { mapGetters, mapActions } from 'vuex';
import { videoGetRoomMember } from '@/api/incoming';
import { AudioVideoStatus, AudioVideoType } from '@/enum';
export default {
    name: 'JoinGroupCall',
    components: {
        MyAvatar
    },
    data() {
        return {
            count: 0,
            token: '',
            callType: '' // AudioVideoType.Video  131视频通话 130语音通话
        };
    },
    computed: {
        ...mapGetters([
            'storeCurrentConversation',
            'storeIncomingCallMessage',
            'storeIsIncomingCallLoading',
            'storeIsIncomingCallIng',
            'storeUserID'
        ]),

        faceURL() {
            return this.storeCurrentConversation.faceURL;
        },
        // 群聊对话 && 有人数正在通话中
        shouldShow() {
            return this.isGroupConversation && this.hasGroupCalling;
        },
        // 群聊对话
        isGroupConversation() {
            return this.storeCurrentConversation.conversationType === 3;
        },
        hasGroupCalling() {
            return this.count > 0;
        }
    },
    watch: {
        storeIncomingCallMessage: {
            handler() {
                const isGroupMessage =
                    this.storeIncomingCallMessage.sessionType === 3;
                if (isGroupMessage) {
                    setTimeout(() => {
                        // 调用太快，接口可能会查不到count
                        this.init();
                    }, 1000);
                }
            },
            deep: true
        }
    },
    created() {
        this.init();
    },
    methods: {
        ...mapActions('incomingCall', ['onSuccessCall']),

        async init() {
            const { conversationID } = this.storeCurrentConversation;
            if (!this.isGroupConversation) return;

            const { token, count, type } = await videoGetRoomMember({
                recvID: this.storeUserID,
                conversationID
            });
            this.count = count;
            this.token = token;
            this.callType = type;
            this.$store.commit(
                'incomingCall/SET_IS_GROUP_CHAT',
                !!this.shouldShow
            );
            this.loopInit();
        },
        loopInit() {
            if (this.hasGroupCalling) {
                setTimeout(() => {
                    this.init();
                }, 5000);
            }
        },
        async onJoin() {
            this.$store.commit(
                'incomingCall/SET_INCOMING_CALL_TOKEN',
                this.token
            );
            this.$store.commit('incomingCall/SET_CALL_TIME', +new Date());
            await this.onSuccessCall();
            await this.goWebrtc();
        },
        async goWebrtc() {
            const hasPermission = await this.$store.dispatch(
                'incomingCall/reviewPermission'
            );
            const customElem = {
                data: JSON.stringify({
                    type: this.callType,
                    status: AudioVideoStatus.Send
                })
            };
            const message = {
                contentType: 110,
                customElem: customElem,
                groupID: this.storeCurrentConversation.groupID,
                recvID: this.storeUserID,
                sessionType: 3, // 3群聊 1单聊
                type: this.callType === AudioVideoType.Video ? 'video' : 'audio'
            };
            if (hasPermission) {
                this.$store.commit(
                    'incomingCall/SET_IS_INCOMING_CALL_MESSAGE',
                    {
                        ...message
                    }
                );
                uni.navigateTo({ url: `/pages/conversation/webrtc/index` });
            }
        }
    }
};
</script>

<style lang="scss" scoped>
.join_group_call {
    background-color: rgba(0, 141, 255, 0.2);
    padding: 10rpx 30rpx;
    display: flex;
    align-items: center;
    justify-content: space-between;
    .avatar_panel {
        display: flex;
        align-items: center;
        flex: 1;
    }
    /deep/ .u-button {
        width: 170rpx;
        height: 70rpx;
        background-color: #008dff;
        color: #ffffff;
        font-size: 30rpx;
        border-radius: 10rpx;
        border: none;
    }
}
</style>
