<template>
    <u-alert
        :type="type"
        :description="description"
        :show-icon="showIcon"
    />
    <!-- :description="$t(description)" -->
</template>

<script>
export default {

    props: {
        // 要校验的值
        value: {
            type: String,
            default: ''
        },
        // 校验的结果
        verifyRes: {
            type: Boolean,
            default: false
        },
        // 描述文本
        description: {
            type: String,
            default: ''
        },
        showIcon: {
            type: Boolean,
            default: true
        }
    },

    computed: {
        type () {
            if (this.value) {
                return this.verifyRes ? 'success' : 'error';
            } else {
                return 'info';
            }
        },
    }
};
</script>

<style lang="scss" scoped>
/deep/.u-alert {
    background-color: transparent;
    padding: 0;
    margin: 8rpx 0;
}
</style>