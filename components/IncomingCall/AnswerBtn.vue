<template>
    <!--  拒绝/接听按钮组件  -->
    <view class="answer_btn">
        <template v-if="storeIncomingCallCatch">
            <u-button
                class="danger_btn"
                @click="dangerClick"
            >
                <image
                    :src="incomingCallIcon"
                    class="call_icon"
                />
            </u-button>
            <u-button
                class="success_btn"
                @click="successClick"
            >
                <image
                    :src="incomingCallIcon"
                    class="call_icon"
                />
            </u-button>
        </template>
        <template v-else-if="storeIncomingCallThrow || storeIsIncomingCallIng">
            <u-button
                class="danger_btn"
                @click="dangerClick"
            >
                <image
                    :src="incomingCallIcon"
                    class="call_icon"
                />
            </u-button>
        </template>
    </view>
</template>

<script>
import incomingCallIcon from '@/static/images/incoming_call_icon.png';
import store from "@/store";
import { mapGetters } from 'vuex';
export default {
    name: "AnswerBtn",
    data () {
        return {
            incomingCallIcon
        };
    },
    computed: {
        ...mapGetters(['storeIncomingCallThrow', 'storeIncomingCallCatch', 'storeIsIncomingCallIng']),
    },
    methods: {
        async dangerClick () {
            this.$emit('update:animateFadeOut', true);

            setTimeout(()=> {
                // 延时等待动画执行完毕
                store.commit('incomingCall/SET_IS_INCOMING_CALL_ING', false);
                store.commit('incomingCall/SET_INCOMING_CALL_CATCH', false);
                store.commit('incomingCall/SET_IS_INCOMING_CALL_MAIN', false);
                this.$emit('onDanger');
            }, 500);
        },
        successClick () {
            store.commit('incomingCall/SET_IS_INCOMING_CALL_ING', true);
            store.commit('incomingCall/SET_INCOMING_CALL_CATCH', false);
            this.$emit('onSuccess');
        },
    }
};
</script>

<style lang="scss" scoped>
.answer_btn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  /deep/ .u-button {
    border-radius: 100%;
    width: 140rpx;
    height: 140rpx;
    border: none;
  }
  .danger_btn{
    background-color: #F45955;
    .call_icon {
      transform: rotate(135deg);
    }
  }
  .success_btn {
    background-color: #58BE6B;
  }
  .call_icon {
    width: 60rpx;
    height: 60rpx;
  }
}
</style>