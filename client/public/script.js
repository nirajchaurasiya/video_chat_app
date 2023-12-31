document.addEventListener('DOMContentLoaded', () => {
    const socket = io('https://video-chat-server-e88k.onrender.com');
    const videoGrid = document.getElementById('video-grid')

    const myPeer = new Peer(undefined, {
        host: 'https://video-chat-server-e88k.onrender.com',
        port: '3001'
    })

    const myVideo = document.createElement('video')
    myVideo.muted = true;
    const peers = []
    navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
    }).then(stream => {
        addVideoStream(myVideo, stream);


        myPeer.on('call', call => {
            call.answer(stream);
            const video = document.createElement('video')
            call.on('stream', otherVideoStream => {
                addVideoStream(video, otherVideoStream)
            })
        })

        socket.on('user-connected', userId => {
            connectToNewUser(userId, stream)
        })
    })


    socket.on('user-disconnected', userId => {
        // console.log(userId);

        if (peers[userId]) peers[userId].close()
    })

    myPeer.on('open', id => {
        socket.emit('join-room', Room_ID, id);
    })

    function connectToNewUser(userId, stream) {
        const call = myPeer.call(userId, stream);
        const video = document.createElement('video')
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream)
        })
        call.on('close', () => {
            video.remove();
        })
        peers[userId] = call
    }

    function addVideoStream(video, stream) {
        video.srcObject = stream;
        video.addEventListener('loadedmetadata', () => {
            video.play();
        });
        videoGrid.append(video);
    }

});
