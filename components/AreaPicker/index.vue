<template>
    <u-picker
        :show="show"
        :default-index="defaultIndex"
        :columns="columns"
        key-name="label"
        @cancel="cancel"
        @confirm="confirm"
    />
</template>

<script>
import { areaCode } from "./areaCode";
export default {
    data () {
        return {
            show: false,
            defaultIndex: [0],
        };
    },
    computed: {
        columns () {
            const list = areaCode.map((i) => {
                return { label: `${i.label} +${i.value}`, value: i.value };
            });
            return [list];
        },
    },
    methods: {
        init () {
            this.show = true;
        },
        confirm ({ value }) {
            const item = value[0];
            this.$emit("chooseArea", item.value);
            this.show = false;
        },
        cancel () {
            this.show = false;
        },
    },
};
</script>
<style lang="scss" scoped>
</style>