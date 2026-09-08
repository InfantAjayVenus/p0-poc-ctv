import React from "react";
import StyledComponentsRegistry from "./lib/registry";

export const metadata = {
  title: "CTV Player Crash POC",
  description: "Minimal POC reproducing a video player-load crash",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#0b0b0f", color: "#fff" }}>
        <StyledComponentsRegistry>{children}</StyledComponentsRegistry>
      </body>
    </html>
  );
}
