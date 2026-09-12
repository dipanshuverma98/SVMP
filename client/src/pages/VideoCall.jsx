import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getSocket } from "../services/socket";

const pcConfig = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

export default function VideoCall() {
  const { groupId } = useParams();
  const navigate = useNavigate();

  const localVideoRef = useRef(null);
  const localStreamRef = useRef(null);

  // Map of peer socketId -> { pc, stream, name, isMentor }
  const peersRef = useRef({});
  const [remotePeers, setRemotePeers] = useState([]); // array of { socketId, userName, stream }

  const [micEnabled, setMicEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);

  const userName = localStorage.getItem("userName") || "Anonymous";
  const userRole = localStorage.getItem("userRole")?.toUpperCase() || "USER";
  const isMentor = userRole === "MENTOR";

  const socket = getSocket();

  useEffect(() => {
    let mounted = true;

    // Helper to create a dummy silent stream if device camera/mic is blocked
    const createDummyStream = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 640;
      canvas.height = 480;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#1e293b";
      ctx.fillRect(0, 0, 640, 480);
      ctx.fillStyle = "#38bdf8";
      ctx.font = "28px sans-serif";
      ctx.fillText(userName, 200, 240);
      const stream = canvas.captureStream(15);
      return stream;
    };

    const createPeerConnection = (targetSocketId, targetUserName, isInitiator) => {
      const pc = new RTCPeerConnection(pcConfig);

      // Add local stream tracks
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => {
          pc.addTrack(track, localStreamRef.current);
        });
      }

      // Handle receiving remote tracks
      pc.ontrack = (event) => {
        const [remoteStream] = event.streams;
        if (mounted) {
          setRemotePeers((prev) => {
            const exists = prev.find((p) => p.socketId === targetSocketId);
            if (exists) {
              return prev.map((p) =>
                p.socketId === targetSocketId ? { ...p, stream: remoteStream } : p
              );
            }
            return [...prev, { socketId: targetSocketId, userName: targetUserName, stream: remoteStream }];
          });
        }
      };

      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("signal-send", {
            to: targetSocketId,
            signal: { type: "candidate", candidate: event.candidate },
            fromName: userName,
          });
        }
      };

      peersRef.current[targetSocketId] = {
        pc,
        userName: targetUserName,
      };

      // If initiator, send offer
      if (isInitiator) {
        pc.createOffer()
          .then((offer) => pc.setLocalDescription(offer))
          .then(() => {
            socket.emit("signal-send", {
              to: targetSocketId,
              signal: { type: "offer", sdp: pc.localDescription },
              fromName: userName,
            });
          })
          .catch((err) => console.error("Error creating offer:", err));
      }

      return pc;
    };

    const setupMediaAndJoin = async () => {
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      } catch (err) {
        console.warn("Could not access physical camera/microphone, using fallback stream:", err.message);
        stream = createDummyStream();
      }

      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Tell socket server we are joining the video call
      socket.emit("join-video-call", { groupId, userName, isMentor });

      // Existing peers in the room: initiate offer to each
      socket.on("existing-peers", (peersList) => {
        peersList.forEach((peer) => {
          createPeerConnection(peer.socketId, peer.userName, true);
        });
      });

      // When a new peer joins the room
      socket.on("peer-joined", ({ peerId, userName: peerName }) => {
        createPeerConnection(peerId, peerName, false);
      });

      // When receiving signaling data (offer/answer/candidate)
      socket.on("signal-receive", async ({ from, signal, fromName }) => {
        let peerData = peersRef.current[from];
        if (!peerData) {
          createPeerConnection(from, fromName, false);
          peerData = peersRef.current[from];
        }

        const pc = peerData?.pc;
        if (!pc) return;

        try {
          if (signal.type === "offer") {
            await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            socket.emit("signal-send", {
              to: from,
              signal: { type: "answer", sdp: answer },
              fromName: userName,
            });
          } else if (signal.type === "answer") {
            await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));
          } else if (signal.type === "candidate" && signal.candidate) {
            await pc.addIceCandidate(new RTCIceCandidate(signal.candidate));
          }
        } catch (signalErr) {
          console.error("Signaling handle error:", signalErr);
        }
      });

      // Peer left
      socket.on("peer-left", ({ peerId }) => {
        if (peersRef.current[peerId]) {
          peersRef.current[peerId].pc.close();
          delete peersRef.current[peerId];
        }
        setRemotePeers((prev) => prev.filter((p) => p.socketId !== peerId));
      });
    };

    setupMediaAndJoin();

    return () => {
      mounted = false;
      socket.emit("leave-video-call", { groupId });
      socket.off("existing-peers");
      socket.off("peer-joined");
      socket.off("signal-receive");
      socket.off("peer-left");

      // Stop local tracks
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }

      // Close peer connections
      Object.values(peersRef.current).forEach((p) => {
        if (p.pc) p.pc.close();
      });
      peersRef.current = {};
    };
  }, [groupId, userName, isMentor]);

  const toggleMic = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((t) => (t.enabled = !micEnabled));
      setMicEnabled(!micEnabled);
    }
  };

  const toggleCamera = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach((t) => (t.enabled = !cameraEnabled));
      setCameraEnabled(!cameraEnabled);
    }
  };

  const endCall = () => {
    socket.emit("leave-video-call", { groupId });
    navigate(/group/);
  };

  return (
    <div style={{ height: "100vh", background: "#0f172a", display: "flex", flexDirection: "column", color: "white" }}>
      {/* Top Header */}
      <div style={{ padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #1e293b", background: "#1e293b" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: "20px" }}>🎥 Group Video Meeting</h2>
          <span style={{ fontSize: "12px", color: "#94a3b8" }}>Group ID: {groupId} | Logged in as: {userName} ({userRole})</span>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={toggleMic}
            style={{
              padding: "8px 14px",
              background: micEnabled ? "#334155" : "#ef4444",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            {micEnabled ? "🎤 Mic On" : "🔇 Mic Off"}
          </button>
          <button
            onClick={toggleCamera}
            style={{
              padding: "8px 14px",
              background: cameraEnabled ? "#334155" : "#ef4444",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            {cameraEnabled ? "📷 Cam On" : "🚫 Cam Off"}
          </button>
          <button
            onClick={endCall}
            style={{
              padding: "8px 16px",
              background: "#ef4444",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Leave Call
          </button>
        </div>
      </div>

      {/* Main Video Stage Grid */}
      <div style={{ flex: 1, padding: "20px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px", overflowY: "auto", alignItems: "center" }}>
        {/* Local Participant Card */}
        <div style={{ position: "relative", height: "300px", background: "#1e293b", borderRadius: "12px", overflow: "hidden", border: "2px solid #3b82f6" }}>
          <video ref={localVideoRef} autoPlay playsInline muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <div style={{ position: "absolute", bottom: "12px", left: "12px", background: "rgba(0,0,0,0.7)", padding: "4px 10px", borderRadius: "6px", fontSize: "13px" }}>
            You ({userName}) {isMentor && "⭐ Mentor"}
          </div>
        </div>

        {/* Remote Peers Cards */}
        {remotePeers.map((peer) => (
          <RemotePeerVideo key={peer.socketId} peer={peer} />
        ))}

        {remotePeers.length === 0 && (
          <div style={{ gridColumn: "1 / -1", textAlign: "center", color: "#64748b", padding: "40px" }}>
            <h3>⏳ Waiting for others to join...</h3>
            <p>Share this group link or open another browser window to test the multi-user call.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function RemotePeerVideo({ peer }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && peer.stream) {
      videoRef.current.srcObject = peer.stream;
    }
  }, [peer.stream]);

  return (
    <div style={{ position: "relative", height: "300px", background: "#1e293b", borderRadius: "12px", overflow: "hidden", border: "1px solid #334155" }}>
      <video ref={videoRef} autoPlay playsInline style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      <div style={{ position: "absolute", bottom: "12px", left: "12px", background: "rgba(0,0,0,0.7)", padding: "4px 10px", borderRadius: "6px", fontSize: "13px" }}>
        {peer.userName || "Participant"}
      </div>
    </div>
  );
}
