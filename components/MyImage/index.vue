<template>
    <u--image
        :src="src"
        :mode="mode"
        :width="width"
        :height="height"
        v-on="$listeners"
    >
        <view slot="loading">
            <u-loading-icon color="red" />
        </view>
    </u--image>
</template>

<script>
export default {
    name: 'MyImage',

    props: {
        src: {
            type: String,
            default: ''
        },
        mode: {
            type: String,
            default: 'aspectFill'
        },
        width: {
            type: String | Number,
            default: '100%'
        },
        height: {
            type: String | Number,
            default: '100%'
        }
    },

    data() {
        return {};
    },

    mounted() {},

    methods: {}
};
</script>

<style lang="scss" scoped></style>
