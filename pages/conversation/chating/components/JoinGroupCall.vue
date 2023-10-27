<template>
    <view
        v-if="shouldShow"
        class="join_group_call"
    >
        <view class="avatar_panel">
            <MyAvatar
                :src="faceURL"
                :is-group="true"
                :shape="`circle`"
                size="80rpx"
            />
            <view class="flex flex-column ml-20">
                <text class="text-color fz-30">
                    群组语音通话中
                </text>
                <text class="text-color fz-28">
                    {{ count }}人
                </text>
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
import { mapGetters, mapActions } from "vuex";
import { videoGetRoomMember } from '@/api/incoming';
import {AudioVideoType} from "@/enum";
export default {
    name: "JoinGroupCall",
    components: {
        MyAvatar,
    },
    data () {
        return {
            count: 0,
            token: ''
        };
    },
    computed: {
        ...mapGetters([
            'storeCurrentConversation',
            'storeSelfInfo',
            'storeIncomingCallMessage',
            'storeIsIncomingCallLoading',
            'storeIsIncomingCallIng'
        ]),

        faceURL () {
            return this.storeCurrentConversation.faceURL;
        },
        // 群聊对话 && 有人数正在通话中
        shouldShow () {
            return this.isGroupConversation && this.hasGroupCalling;
        },
        // 群聊对话
        isGroupConversation () {
            return this.storeCurrentConversation.conversationType === 3;
        },
        hasGroupCalling () {
            return this.count > 0;
        },
        isVideoCall () {
            const { data } = this.storeIncomingCallMessage.customElem;
            const res = JSON.parse(data);
            return res.type === AudioVideoType.Video;
        },
    },
    watch: {
        storeIncomingCallMessage: {
            handler () {
                const isGroupMessage = this.storeIncomingCallMessage.sessionType === 3;
                if (isGroupMessage) this.init();
            },
            deep: true
        }
    },
    created () {
        this.init();
    },
    methods: {
        ...mapActions('incomingCall', ['onSuccessCall']),

        async init () {
            const {userID} = this.storeSelfInfo;
            const {  conversationID } = this.storeCurrentConversation;
            const { token, count } = await videoGetRoomMember({
                recvID: userID,
                conversationID,
            });
            this.count = count;
            this.token = token;

            this.loopInit();
        },
        loopInit () {
            if (!this.hasGroupCalling) return;
            setTimeout(()=> {
                console.log('每8秒更新一次群聊中的通话人数', '_+++++++++++++++++++++++++++++++++++++++++++++++++++++++');
                this.init();
            }, 8000);
        },
        async onJoin () {
            this.$store.commit('incomingCall/SET_INCOMING_CALL_TOKEN', this.token);
            await this.onSuccessCall();
            await this.goWebrtc();
        },
        async goWebrtc () {
            const hasPermission  = await this.$store.dispatch('incomingCall/reviewPermission');
            const type = this.isVideoCall ? 'video' : 'audio';
            if (hasPermission) {
                this.$store.commit('incomingCall/SET_IS_INCOMING_CALL_MESSAGE', {
                    ...this.storeIncomingCallMessage,
                    type
                });
                uni.navigateTo({url: `/pages/conversation/webrtc/index`});
            }
        },
    }
};
</script>

<style lang="scss" scoped>
.join_group_call {
  background-color: rgba(0, 141, 255, 0.20);
  padding: 10rpx 30rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  .avatar_panel {
    display: flex;
    align-items: center;
    flex: 1;
  }
  /deep/ .u-button{
    width: 170rpx;
    height: 70rpx;
    background-color: #008DFF;
    color: #FFFFFF;
    font-size: 30rpx;
    border-radius: 10rpx;
    border: none;
  }
}
</style>