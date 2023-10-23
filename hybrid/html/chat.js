window.onload = function () {
    // alert(33);
    // const back = document.getElementById('back');
    // back.onclick = function () {
    //     uni.navigateBack();
    // }
    const {
        // Participant,
        // RemoteParticipant,
        // RemoteTrackPublication,
        RemoteTrack,
        Room,
        RoomEvent,
    } = window.LivekitClient;
    const map = {
        type: '',
        device: '',
        trackList: [],
        room: null,
        init () {
            this.openRoom();
        },
        getDom (id) {
            return document.getElementById(id);
        },
        setDomAttr (map) {
            // const { width = `300px`, height = `300px`, id, dom } = map;
            const { width = `auto`, height = `${document.documentElement.clientHeight}px`, id, dom } = map;
            if (!dom) return;
            dom.id = id;
            dom.className = map.className;
            dom.style.width = width;
            dom.style.height = height;
        },
        updateData () {
            this.openRoom();
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
        async openRoom () {
            const wsURL = `ws://192.168.2.20:7880`;
            const token = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3MDAzMDM2NDIsImlzcyI6IkFQSVZWQ3BETGtaTHZSViIsIm5iZiI6MTY5NzcxMTY0Miwic3ViIjoicGFydGljaXBhbnRJZGVudGl0eTEiLCJ2aWRlbyI6eyJyb29tIjoiTVVTSyIsInJvb21Kb2luIjp0cnVlfX0._-3jkKTw-wBFJVI6BCN2bBdbEQKujeUwHVazttNCNCE`;
            this.room = new Room();
            this.trackList = [];
            try {
                await this.room.connect(wsURL, token);
                console.log('connected to room----', this.room.name);
                // await p.enableCameraAndMicrophone();
                this.removeMember();
                this.addInitMember();
                this.addJoinMember();
                this.addSelf();
            } catch (err) {
                console.log('fail -----connected to room----', err);
            }
        },
        // 断线删除成员
        async removeMember () {
            const otherDom = this.getDom('other-box');
            this.room.on(RoomEvent.ParticipantDisconnected, (participant) => {
                this.removeElment({
                    participant,
                    parentDom: otherDom
                });
            });
        },
        // 加入新进成员
        async addJoinMember () {
            const otherDom = this.getDom('other-box');
            this.room.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
                this.addElement({
                    parentDom: otherDom,
                    track,
                    participant
                });
            });
        },
        // 初始化已在成员
        async addInitMember () {
            const otherDom = this.getDom('other-box');
            this.room?.participants?.forEach(participant => {
                participant?.tracks?.forEach(track => {
                    this.addElement({
                        participant,
                        track: track.track,
                        parentDom: otherDom
                    });
                });
            });
        },
        // 添加自己
        async addSelf () {
            const myBoxDom = this.getDom('my-box');
            const p = this.room.localParticipant;
            if (this.type === 'video') {
                await p.setCameraEnabled(true);
                await p.setMicrophoneEnabled(true);
                console.log(RemoteTrack.Source, 'RemoteTrack.SourceRemoteTrack.Source');
                const cameraTrack = p.getTrack(RemoteTrack.Source.Camera);
                const myVideo = cameraTrack?.track?.attach();
                // if (!myBoxDom.children[0]) {
                if (!myVideo) return;
                this.setDomAttr({
                    dom: myVideo,
                    id: 'myVideo',
                    className: 'big-video'
                });
                myBoxDom.appendChild(myVideo);
                // }
            } else {
                await p.setMicrophoneEnabled(true);
                // console.log(RemoteTrack.Source, 'RemoteTrack.SourceRemoteTrack.Source');
                // const microphoneTrack = p.getTrack(RemoteTrack.Source.Microphone);
                // const microphone = microphoneTrack?.track?.attach();
                // if (!microphone) return;
                // this.setDomAttr({
                //     dom: microphone,
                //     id: 'myVideo',
                //     className: 'big-video'
                // });
                // myBoxDom.appendChild(microphone);
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
                id: type,
                className: 'small-video'
            });
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
    };
    map.init();
};
