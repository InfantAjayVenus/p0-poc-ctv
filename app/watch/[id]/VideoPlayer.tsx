"use client";

import { useEffect, useState } from "react";
import styled from "styled-components";

const PlayerWrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #000;
`;

const LoadingText = styled.p`
  color: #fff;
  font-size: 20px;
`;

// Fake player SDK handle — intentionally never assigned before use,
// simulating an SDK object that failed to attach during init.
let playerSdkHandle: { play: () => void } | undefined;

// Simulates an async player SDK load (e.g. fetching a manifest, warming up a decoder).
function initPlayer(episodeId: string): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, 800);
  });
}

export default function VideoPlayer({ episodeId }: { episodeId: string }) {
  const [status, setStatus] = useState<"loading" | "ready">("loading");

  useEffect(() => {
    initPlayer(episodeId).then(() => {
      setStatus("ready");
      // Crash: playerSdkHandle was never initialized by initPlayer(),
      // so calling .play() on it throws inside this uncaught .then().
      // (non-null assertion bypasses the compile-time check; it is
      // genuinely undefined at runtime, which is the point of this POC)
      playerSdkHandle!.play();
    });
  }, [episodeId]);

  return (
    <PlayerWrapper>
      <LoadingText>
        {status === "loading" ? "Loading player…" : "Starting playback…"}
      </LoadingText>
    </PlayerWrapper>
  );
}
