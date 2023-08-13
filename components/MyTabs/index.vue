<template>
    <view
        class="list flex align-center bg-grey"
        :style="{
            height: height + 'rpx', 
            'borderRadius': Math.ceil(height / 2) + 'rpx'
        }"
    >
        <view
            v-for="(v, i) in list"
            :key="i"
            :class="['item', active === v.value && 'active']"
            :style="{
                'borderRadius': Math.ceil(height / 2) + 'rpx',
            }"
            @click="change(v)"
        >
            {{ v.label }}
        </view>
    </view>
</template>

<script>
export default {
    name: 'MyTabs',

    props: {
        value: {
            type: [Number, String],
            default: ''
        },
        list: {
            type: Array,
            default: () => ([])
        },
        height: {
            type: Number,
            default: 64
        }
    },

    data () {
        return {
            active: ''
        };
    },

    mounted () {
        this.active = this.value || this.list[0].value;
    },

    methods: {
        change (v) {
            this.$emit('change', v);
            this.$emit('input', v.value);
            this.active = v.value;
        }
    },
};
</script>

<style lang="scss" scoped>
.list {
    padding: 5rpx;
    .item {
        height: 100%;
        flex: 1;
        display: flex;
        justify-content: center;
        align-items: center;
        color: $uni-text-color-grey;
        font-family: MiSans-Demibold;

        &.active {
            background-color: $uni-bg-color;
            color: $uni-color-primary;
        }
    }
}
</style>