"use client";

import { VideoBackground } from "@/components/ui/video-background";

export default function VideoBackgroundGlobal() {
  return (
    <div aria-hidden className="fixed inset-0 z-0 pointer-events-none select-none">
      <VideoBackground className="absolute inset-0" />
    </div>
  );
}
