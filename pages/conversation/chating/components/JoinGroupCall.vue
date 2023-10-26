<template>
    <view
        v-if="hasGroupCalling"
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
        <u-button @click="onJoin">
            加入
        </u-button>
    </view>
</template>

<script>
import MyAvatar from '@/components/MyAvatar/index.vue';
import { mapGetters } from "vuex";
import { videoGetRoomMember } from '@/api/incoming';
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
        ...mapGetters(['storeCurrentConversation', 'storeSelfInfo']),

        faceURL () {
            return this.storeCurrentConversation.faceURL;
        },
        hasGroupCalling () {
            return this.count > 0;
        }
    },
    mounted () {
        setTimeout(()=> {
            this.init();
        }, 10000);
    },
    methods: {
        async init () {
            const {userID} = this.storeSelfInfo;
            const {  conversationID } = this.storeCurrentConversation;
            const { token, count } = await videoGetRoomMember({
                recvID: userID,
                conversationID,
            });
            this.count = count;
            this.token = token;
        },
        onJoin () {
            // this.$store.commit('incomingCall/SET_INCOMING_CALL_TOKEN', this.token);
        }
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