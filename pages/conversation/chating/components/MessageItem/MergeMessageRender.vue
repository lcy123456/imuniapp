<template>
    <view class="merge_message_container bg_container">
        <view class="ff-bold">
            {{ message.mergeElem.title }}
        </view>
        <view>待开发...</view>
    </view> 
</template>

<script>
export default {

    props: {
        message: {
            type: Object,
            default: () => ({})
        }
    },
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
.merge_message_container {
    max-width: 100%;
    width: 100vw;
    
}
</style>