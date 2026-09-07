import dynamic from "next/dynamic";
import { notFound } from "next/navigation";
import { getEpisodeById } from "../../mockData";

// Player must be client-only: it touches browser-only playback APIs
// and is where the simulated crash happens on init.
const VideoPlayer = dynamic(() => import("./VideoPlayer"), { ssr: false });

export default function WatchPage({ params }: { params: { id: string } }) {
  const episode = getEpisodeById(params.id);

  if (!episode) {
    notFound();
  }

  return (
    <div style={{ height: "100vh" }}>
      <VideoPlayer episodeId={episode!.id} />
    </div>
  );
}
