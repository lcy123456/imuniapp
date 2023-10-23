<template>
    <Page>
        <view class="page_container">
            <custom-nav-bar title="关于我们" />
            <view class="box-logo mt-80 mb-20">
                <image
                    class="logo w-130 h-120"
                    src="/static/images/logo@2x.png"
                />
                <image
                    class="w-249 h-37"
                    src="/static/images/logo_name.png"
                />
            </view>
            <view class="text-grey text-center">
                {{ appVersion }}
            </view>
        </view>
    </Page>
</template>

<script>
import CustomNavBar from '@/components/CustomNavBar/index.vue';

import {mapActions} from 'vuex';

export default {
    components: {
        CustomNavBar
    },
    data () {
        return {
            appVersion: ''
        };
    },
    onLoad () {
        this.getAppVersion();
        
        this.onCatchCall('video');
    },
    methods: {
        ...mapActions('incomingCall', ['onCatchCall']),

        getAppVersion () {
            this.appVersion = plus.runtime.version;
        },
    }
};
</script>

<style lang="scss">
</style>
