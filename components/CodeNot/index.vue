<template>
    <view
        class="code-not fs-28 text-grey"
        @click="handleCodeNot"
    >
        收不到验证码?
    </view>
</template>

<script>
export default {
    name: 'CodeNot',

    data () {
        return {
            
        };
    },

    methods: {
        // 收不到验证码
        handleCodeNot () {
            uni.$u.toast(`请联系管理员\n\remail_xxx@163.com`);
        }
    },
};
</script>

<style lang="scss" scoped>
.code-not {
    text-align: right;
}
</style>