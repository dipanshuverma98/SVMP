import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import io from "socket.io-client";

const socket = io("http://localhost:5000");
const pcConfig = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };

export default function VideoCall() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const peerConnection = useRef();
  const localStream = useRef();

  const userName = localStorage.getItem("userName") || "Anonymous";
  const isMentor = localStorage.getItem("userRole")?.toUpperCase() === "MENTOR";

  useEffect(() => {
    const initCall = async () => {
      // 1. Setup Local Media
      localStream.current = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (localVideoRef.current) localVideoRef.current.srcObject = localStream.current;

      // 2. Initialize Peer Connection
      peerConnection.current = new RTCPeerConnection(pcConfig);

      // Add local tracks to peer connection
      localStream.current.getTracks().forEach(track => {
        peerConnection.current.addTrack(track, localStream.current);
      });

      // Receive Remote Tracks
      peerConnection.current.ontrack = (event) => {
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = event.streams[0];
      };

      // ICE Candidates
      peerConnection.current.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("webrtc-ice-candidate", { groupId, candidate: event.candidate });
        }
      };

      // 3. Signaling Logic
      socket.emit("join-group-chat", groupId);

      if (isMentor) {
        // Mentor creates the offer
        const offer = await peerConnection.current.createOffer();
        await peerConnection.current.setLocalDescription(offer);
        socket.emit("webrtc-offer", { groupId, offer });
      }

      socket.on("webrtc-offer", async (offer) => {
        if (!isMentor) {
          await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));
          const answer = await peerConnection.current.createAnswer();
          await peerConnection.current.setLocalDescription(answer);
          socket.emit("webrtc-answer", { groupId, answer });
        }
      });

      socket.on("webrtc-answer", async (answer) => {
        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
      });

      socket.on("webrtc-ice-candidate", async (candidate) => {
        if (candidate) {
          await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
        }
      });
    };

    initCall();

    return () => {
      socket.off("webrtc-offer");
      socket.off("webrtc-answer");
      socket.off("webrtc-ice-candidate");
      if (localStream.current) {
        localStream.current.getTracks().forEach(track => track.stop());
      }
      if (peerConnection.current) {
        peerConnection.current.close();
      }
    };
  }, [groupId, isMentor]);

  return (
    <div style={{ height: "100vh", background: "#000", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ color: "white", margin: 0 }}>Live Session: {groupId}</h2>
        <button 
          onClick={() => navigate(`/group/${groupId}`)} 
          style={{ padding: "10px 20px", background: "#d9534f", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}
        >
          End Call
        </button>
      </div>

      <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", gap: "20px", padding: "20px" }}>
        {/* Remote Video (Large) */}
        <div style={{ position: "relative", width: "70%", height: "80%", background: "#1a1a1a", borderRadius: "15px", overflow: "hidden" }}>
          <video ref={remoteVideoRef} autoPlay playsInline style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <div style={{ position: "absolute", bottom: "20px", left: "20px", color: "white", background: "rgba(0,0,0,0.5)", padding: "5px 10px", borderRadius: "5px" }}>
            Participant
          </div>
        </div>

        {/* Local Video (Small Overlay) */}
        <div style={{ width: "250px", height: "180px", background: "#333", borderRadius: "10px", overflow: "hidden", border: "2px solid #007bff" }}>
          <video ref={localVideoRef} autoPlay playsInline muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <div style={{ textAlign: "center", color: "white", fontSize: "12px", background: "rgba(0,0,0,0.5)" }}>You ({userName})</div>
        </div>
      </div>
    </div>
  );
}