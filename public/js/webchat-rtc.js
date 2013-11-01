var PeerConnection = (window.PeerConnection || window.webkitPeerConnection00 || window.webkitRTCPeerConnection || window.mozRTCPeerConnection);
var URL = (window.URL || window.webkitURL || window.msURL || window.oURL);
var getUserMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
var nativeRTCIceCandidate = (window.mozRTCIceCandidate || window.RTCIceCandidate);
var nativeRTCSessionDescription = (window.mozRTCSessionDescription || window.RTCSessionDescription); // order is very important: "RTCSessionDescription" defined in Nighly but useless



WE = window.WE || {};

WE.rtc = {

    //链接服务器
    _socket:null,
    users:[],
    connect:function( server, sid, roomid ){
      server = server || "ws://vchat-rtc.co:8001";
      sid = sid || "e3238e39e72fdb588d6e5bb360fa90b0|275fccab7935736ff68c95c3ddbfaaee|07871915a8107172b3b5dc15a6574ad3";
      roomid = "abc";
      var socket = new WebSocket( server );
      var self = this;
      this._socket = socket;
      socket.emit = function( type, data ){
        if( this[type] ){
          this[type]( data );
        }
      };
      socket.onopen = function( e ){

        socket.send(
          JSON.stringify({
            type:"login",
            data:{
              sid:sid,
              roomid:roomid
            }
          })
        );

      };

      socket.onmessage = function( e ){
        //console.log(e)
        var data = JSON.parse(e.data);
        console.log("onmessage", data.type)
        this.emit( data.type, data );
      }

      socket.onclose = function(){
        console.log("onclose");
      }; 

      /**自己定义事件*/
      //登录事件完成
      /**
        data:{
          "connections":socketHashList.getUserList( roomid ),
          "me":user.getPublicInfo(36)
        }
      */
      //又新用户上线
      socket.online = function( data ){
        console.log("online", data);
        if(data.data._id != USER._id){
          console.log("new PeerConnection");
          var pc = self.createPeerConnection( data.data._id );
          pc.id = data.data._id;
          self.addStreams( pc );
          self.connections[pc.id] = pc;
        }
      };

      //登录的时候获取所有在线列表
      socket.onlines = function( data ){
        console.log("onlogin", data);
        /**[
          {_id:"123456"} 
        ]*/
        var users = self.users;
        var meid = data.data.me._id;
        var connections = data.data.connections;
        for(var i=0; i<connections.length; i++){
          if( connections[i]._id != meid ){
            users.push( connections[i] );
          }
        }

        self.socketReady();
        /**
        if( users.length > 0 ){
          console.log("createPeerConnections", users);
          WE.rtc.createPeerConnections(data.data.connections);
        }
        */
      };
      //有人发出ip和端口报告
      socket.receive_ice_candidate = function( data ){

        console.log( "receive_ice_candidate", data );
        var candidate = new nativeRTCIceCandidate(data.data);
        WE.rtc.connections[data.data.id].addIceCandidate( candidate );

      };

      socket.receive_offer = function( data ){
        WE.rtc.receiveOffer( data );
      };

      socket.receive_answer = function( data ){
        WE.rtc.receiveAnswer( data );
      };
    },
    socketReady:function(){


    },

    streams:[],//保存设备
    //请求创建视频
    createStream:function( options, success, fail ){

      /**
          options = {"video": true, "audio":false}
      */
      var self = this;
      if(getUserMedia){

        getUserMedia.call( navigator, options, function( stream ){

          self.streams.push( stream );
          self.streamReady();
          success( stream );

        },function( error ){

          alert("Could not connect stream.");
          fail(error)

        })

      }else{

        alert("webRTC is not you supported in this browser.");

      }

    },
    streamReady:function(){

      this.createPeerConnections();

    },
    connections:{},
    createPeerConnections:function(){
      var pc = null;
      var users = this.users;
      for(var i=0; i<users.length; i++){
         pc = this.createPeerConnection( users[i]._id );
         this.addStreams( pc );
         this.createDataChannel( pc );
         this.sendOffers( pc );
         this.connections[pc.id] = pc;
      }
    },
    //创建链接
    createPeerConnection:function( id ){
      var server = {
        "iceServers": [{
          "url":"stun:stun.l.google.com:19302"// "stun:23.21.150.121"
        }]
      };
      var config = {
        "optional": [{
          "RtpDataChannels": true
        }, {
          "DtlsSrtpKeyAgreement": true
        }]
      };
      var pc = new PeerConnection(server, config);
      pc.onicecandidate = function(event) {
          console.log("onicecandidate", event);
          if (event.candidate) {
            WE.rtc._socket.send(JSON.stringify({
              "type": "send_ice_candidate",
              "data": {
                "label": event.candidate.sdpMLineIndex,
                "candidate": event.candidate.candidate,
                "id": id
              }
            }));
          }
      };

      pc.onopen = function() {
        console.log("pc onopen")
      };

      pc.onaddstream = function(event) {
        // TODO: Finalize this API
        console.log("-------- onaddstream")
        //rtc.fire('add remote stream', event.stream, id);
        WE.rtc.addRemoteStream( event.stream, id );
      };

      pc.onclose = function(){
        console.log("onclose")
      };

      pc.ondatachannel = function(evt) {
        //console.log('data channel connecting ' + id);
        WE.rtc.addDataChannel(pc, evt.channel);
      };

      pc.onerror = function(){
        console.log("pc error");
      }

      pc.id = id;
      return pc;
    },
    addStreams:function( pc ){
      for(var i=0; i<this.streams.length; i++){
        pc.addStream( this.streams[i] );
      }
    },
    dataChannels:{},
    createDataChannel:function( pc, label ){

      // need a label
      label = label || 'fileTransfer' || String(id);

      var id = pc.id;
      // chrome only supports reliable false atm.
      var options = {
        reliable: false
      };

      var channel;
      try {
        console.log('createDataChannel ' + id);
        channel = pc.createDataChannel(label, options);
      } catch (error) {
        console.log('seems that DataChannel is NOT actually supported!');
        throw error;
      }

      return this.addDataChannel(pc, channel);
    },
    addDataChannel:function( pc, channel){

      var id = pc.id;
      channel.onopen = function() {
        console.log('data stream open ' + id);
        //rtc.fire('data stream open', channel);
      };

      channel.onclose = function(event) {
        delete rtc.dataChannels[id];
        delete rtc.peerConnections[id];
        delete rtc.connections[id];
        console.log('data stream close ' + id);
        //rtc.fire('data stream close', channel);
      };

      channel.onmessage = function(message) {
        console.log('data stream message ' + id);
        //rtc.fire('data stream data', channel, message.data);
      };

      channel.onerror = function(err) {
        console.log('data stream error ' + id + ': ' + err);
        //rtc.fire('data stream error', channel, err);
      };

      return channel;

    },
    sendOffers:function( pc ){
      //var pc = rtc.peerConnections[socketId];

      var constraints = {
        "optional": [],
        "mandatory": {
          "MozDontOfferDataChannel": true
        }
      };
      var sdpConstraints = {
        'mandatory': {
          'OfferToReceiveAudio': true,
          'OfferToReceiveVideo': true
        }
      };

      function mergeConstraints(cons1, cons2) {
        var merged = cons1;
        for (var name in cons2.mandatory) {
          merged.mandatory[name] = cons2.mandatory[name];
        }
        merged.optional.concat(cons2.optional);
        return merged;
      }

      // temporary measure to remove Moz* constraints in Chrome
      if (navigator.webkitGetUserMedia) {
        for (var prop in constraints.mandatory) {
          if (prop.indexOf("Moz") != -1) {
            delete constraints.mandatory[prop];
          }
        }
      }
      constraints = mergeConstraints(constraints, sdpConstraints);

      pc.createOffer(function(session_description) {
        session_description.sdp = preferOpus(session_description.sdp);
        pc.setLocalDescription(session_description);
        WE.rtc._socket.send(JSON.stringify({
          "type": "send_offer",
          "data": {
            "id": pc.id,
            "sdp": session_description
          }
        }));
      }, null, sdpConstraints);
    },
    receiveOffer:function( data ){ 
      var id = data.data.id;
      var sdp = data.data.sdp;
      var pc = WE.rtc.connections[id];
      var sdpConstraints = {
        'mandatory': {
          'OfferToReceiveAudio': true,
          'OfferToReceiveVideo': true
        }
      };
      pc.setRemoteDescription(new nativeRTCSessionDescription(sdp));
      pc.createAnswer(function(session_description) {
        pc.setLocalDescription(session_description);
        WE.rtc._socket.send(JSON.stringify({
          "type": "send_answer",
          "data": {
            "id": id,
            "sdp": session_description
          }
        }));
        //TODO Unused variable!?
        var offer = pc.remoteDescription;
      }, null, sdpConstraints);
    },

    receiveAnswer: function(data) {
      var id = data.data.id;
      var sdp = data.data.sdp;
      var pc = WE.rtc.connections[id];
      pc.setRemoteDescription(new nativeRTCSessionDescription(sdp));
    }

};


function preferOpus(sdp) {
  var sdpLines = sdp.split('\r\n');
  var mLineIndex = null;
  // Search for m line.
  for (var i = 0; i < sdpLines.length; i++) {
    if (sdpLines[i].search('m=audio') !== -1) {
      mLineIndex = i;
      break;
    }
  }
  if (mLineIndex === null) return sdp;

  // If Opus is available, set it as the default in m line.
  for (var j = 0; j < sdpLines.length; j++) {
    if (sdpLines[j].search('opus/48000') !== -1) {
      var opusPayload = extractSdp(sdpLines[j], /:(\d+) opus\/48000/i);
      if (opusPayload) sdpLines[mLineIndex] = setDefaultCodec(sdpLines[mLineIndex], opusPayload);
      break;
    }
  }

  // Remove CN in m line and sdp.
  sdpLines = removeCN(sdpLines, mLineIndex);

  sdp = sdpLines.join('\r\n');
  return sdp;
}

function extractSdp(sdpLine, pattern) {
  var result = sdpLine.match(pattern);
  return (result && result.length == 2) ? result[1] : null;
}

function setDefaultCodec(mLine, payload) {
  var elements = mLine.split(' ');
  var newLine = [];
  var index = 0;
  for (var i = 0; i < elements.length; i++) {
    if (index === 3) // Format of media starts from the fourth.
    newLine[index++] = payload; // Put target payload to the first.
    if (elements[i] !== payload) newLine[index++] = elements[i];
  }
  return newLine.join(' ');
}

function removeCN(sdpLines, mLineIndex) {
  var mLineElements = sdpLines[mLineIndex].split(' ');
  // Scan from end for the convenience of removing an item.
  for (var i = sdpLines.length - 1; i >= 0; i--) {
    var payload = extractSdp(sdpLines[i], /a=rtpmap:(\d+) CN\/\d+/i);
    if (payload) {
      var cnPos = mLineElements.indexOf(payload);
      if (cnPos !== -1) {
        // Remove CN payload from m line.
        mLineElements.splice(cnPos, 1);
      }
      // Remove CN line in sdp
      sdpLines.splice(i, 1);
    }
  }

  sdpLines[mLineIndex] = mLineElements.join(' ');
  return sdpLines;
}