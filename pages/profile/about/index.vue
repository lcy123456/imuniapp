<template>
    <Page>
        <view class="page_container">
            <custom-nav-bar :title="$t('About_us')" />
            <view class="mb-20 box-logo mt-80">
                <image class="logo w-130 h-120" src="/static/images/logo.png" />
                <image class="w-249 h-37" src="/static/images/logo_name.png" />
            </view>
            <view class="text-center text-grey">
                {{ appVersion }}
            </view>
        </view>
    </Page>
</template>

<script>
import CustomNavBar from '@/components/CustomNavBar/index.vue';

export default {
    components: {
        CustomNavBar
    },
    data() {
        return {
            appVersion: ''
        };
    },
    onLoad() {
        this.getAppVersion();
    },
    methods: {
        getAppVersion() {
            this.appVersion = plus.runtime.version;
        }
    }
};
</script>

<style lang="scss"></style>
