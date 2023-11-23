<template>
    <div class="chating_record_bar">
        <div>录音中...</div>
        <image
            class="chating_record_cancel w-100 h-100"
            src="/static/images/close.svg"
        />
    </div>
</template>

<script>
export default {
    name: 'ChatingRecordBar',

    data () {
        return {
            
        };
    },

    mounted () {
        
    },

    methods: {
    },
};
</script>

<style lang="scss" scoped>
.chating_record_bar {
    width: 100%;
    height: 500rpx;
    position: absolute;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: space-evenly;
    background-color: rgba(0, 0, 0, .2);
    border-start-start-radius: 50% 25%;
    border-start-end-radius: 50% 25%;
}
</style>