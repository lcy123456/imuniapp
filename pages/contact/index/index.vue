<template>
    <view
        class="contact_container"
        :update="update"
        :change:update="updateData"
    >
        <div
            id="other-box"
        />
        <div
            id="my-box"
        />
        <div>
            <text @click="roomModule.toggleAudio">切换声音</text>
            <text @click="roomModule.toggleVideo">开关视频</text>
            <text @click="roomModule.toggleVideoInput">切换视频</text>
        </div>
        <CustomNavBar
            :show-left="false" 
            is-bg-color2
            title="通讯录"
        >
            <view
                slot="more"
                class="mr-30"
                @click="contactAddClick"
            >
                <image
                    src="@/static/images/common_circle_add.png"
                    class="w-44 h-44"
                />
            </view>
        </CustomNavBar>
        <view
            class="px-20 pt-10 pb-20"
            @click="handleToSearch"
        >
            <uni-search-bar
                v-model="keyword"
                bg-color="#fff"
                class="h-70"
                placeholder="搜索"
                readonly
            />
        </view>
        <ContactMenus />

        <view class="list_title">
            <text>常用联系人</text>
        </view>

        <u-list
            class="user_list"
        >
            <u-list-item
                v-for="user in frequentContacts"
                :key="user.userID"
            >
                <UserItem
                    :item="user"
                    @itemClick="userClick"
                />
            </u-list-item>
        </u-list>
    </view>
</template>

<script>
import CustomNavBar from '@/components/CustomNavBar/index.vue';
import ContactMenus from './components/ContactMenus.vue';
import UserItem from "@/components/UserItem/index.vue";
export default {
    components: {
        CustomNavBar,
        ContactMenus,
        UserItem
    },
    data () {
        return {
            videoelm: null,
            keyword: '',
            update: '',
            frequentContacts: []
        };
    },
    onShow () {
        this.getFrequentContacts();
        // setTimeout(() => {
        //     this.update = +new Date();
        // }, 100);
    },
    methods: {
        handleToSearch () {
            uni.$u.route('/pages/common/searchRecord/index');
        },
        contactAddClick () {
            uni.navigateTo({
                url: "/pages/contact/contactAdd/index"
            });
        },
        getFrequentContacts () {
            const tmpData = uni.getStorageSync(`${this.$store.getters.storeCurrentUserID}_frequentContacts`) || [];
            this.frequentContacts = [...tmpData].sort((a, b) => b - a);
        },
        userClick (item) {
            uni.navigateTo({
                url: `/pages/common/userCard/index?sourceID=${item.userID}`
            });
        },
    }
};
</script>

<script module="roomModule" lang="renderjs">
import {
    Participant,
    RemoteParticipant,
    RemoteTrack,
    RemoteTrackPublication,
    Room,
    RoomEvent,
} from 'livekit-client';
export default {
    data () {
        return {
            device: '',
            trackList: [],
            systemInfo: uni.getSystemInfoSync(),
            room: null
        }
    },
    methods: {
        getDom (id) {
            return document.getElementById(id);
        },
        setDomAttr (map) {
            const { width = `${this.systemInfo.windowWidth}px`, height = `${this.systemInfo.windowHeight}px`, id, dom } = map;
            dom.id = id;
            dom.style.width = width;
            dom.style.height = height;
        },
        updateData () {
            this.testOpenRoom();
        },
        async toggleAudio () {
            if (!this.room) return;
            const enabled = this.room?.localParticipant?.isMicrophoneEnabled;
            await this.room?.localParticipant?.setMicrophoneEnabled(!enabled);
        },

        async toggleVideo () {
            if (!this.room) return;
            const enabled = this.room?.localParticipant.isCameraEnabled;
            await this.room?.localParticipant.setCameraEnabled(!enabled);
        },

        async toggleVideoInput () {
            const devices = await Room.getLocalDevices('videoinput');
            if (this.device === '') {
                this.device = devices[1];
            } else {
                const otherDevices = devices.filter(item => item.deviceId !== this.device.deviceId);
                this.device = otherDevices[0];
            }
            this.device && await this.room.switchActiveDevice('videoinput', this.device.deviceId);
        },
        async testOpenRoom () {
            const wsURL = `ws://192.168.2.20:7880`;
            const token = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3MDAzMDM2NDIsImlzcyI6IkFQSVZWQ3BETGtaTHZSViIsIm5iZiI6MTY5NzcxMTY0Miwic3ViIjoicGFydGljaXBhbnRJZGVudGl0eTEiLCJ2aWRlbyI6eyJyb29tIjoiTVVTSyIsInJvb21Kb2luIjp0cnVlfX0._-3jkKTw-wBFJVI6BCN2bBdbEQKujeUwHVazttNCNCE`;
            this.room = new Room();
            this.trackList = [];
            try {
                await this.room.connect(wsURL, token);
                console.log('connected to room----', this.room.name);
                const p = this.room.localParticipant;
                // await p.enableCameraAndMicrophone();
                const myBoxDom = this.getDom('my-box');
                const otherDom = this.getDom('other-box');
                this.room.on(RoomEvent.ParticipantDisconnected, (participant) => {
                    this.removeElment({
                        participant,
                        parentDom: otherDom
                    });
                });
                this.room?.participants?.forEach(participant => {
                    participant?.tracks?.forEach(track => {
                        this.addElement({
                            participant,
                            track: track.track,
                            parentDom: otherDom
                        });
                    });
                });
                this.room.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
                    this.addElement({
                        parentDom: otherDom,
                        track,
                        participant
                    });
                })
                await p.setCameraEnabled(true);
                await p.setMicrophoneEnabled(true);
                const cameraTrack = p.getTrack(RemoteTrack.Source.Camera);
                const myVideo = cameraTrack?.track?.attach();
                if (!myBoxDom.children[0]) {
                    this.setDomAttr({
                        dom: myVideo,
                        id: 'myVideo'
                    })
                    myBoxDom.appendChild(myVideo);
                }
            } catch (err) {
                console.log('fail -----connected to room----', err);
            }
        },
        addElement ({ parentDom, track, participant}) {
            const { identity } = participant;
            const element = track.attach();
            const type = `${identity}-${track.kind}`;
            if (this.trackList.includes(type)) {
                const dom = this.getDom(type);
                parentDom.removeChild(dom);
            }
            this.setDomAttr({
                dom: element,
                id: type
            })
            parentDom.appendChild(element);
            this.trackList.push(type);
        },
        removeElment ({parentDom, participant}) {
            const { identity } = participant;
            const video = this.getDom(`${identity}-video`);
            const audio = this.getDom(`${identity}-audio`);
            this.trackList = this.trackList.filter(item => ![`${identity}-video`, `${identity}-audio`].includes(item));
            parentDom.removeChild(video);
            parentDom.removeChild(audio);
        },
        beforeDestroy () {
            this.room && this.room.disconnect();
            this.myVideo = null;
            this.trackList = [];
        }
    }
}
</script>
<style lang="scss" scoped>

    .screenshare-video {
        width: 400px;
        height: 400px;
        border: 1px solid red;
    }
	.contact_container {
		@include colBox(false);
		height: 100vh;
		background-color: $uni-bg-color-grey;

		.list_title {
			font-size: 24rpx;
			color: $uni-text-color-grey;
			margin-left: 30rpx;
		}

		.user_list {
			flex: 1;
            overflow: hidden;
			margin-top: 24rpx;
			background-color: $uni-bg-color;
		}
	}
</style>
