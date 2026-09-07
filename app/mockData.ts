export interface MockEpisode {
  id: string;
  title: string;
  synopsis: string;
}

// Static in-memory mock data — no API/GraphQL involved.
export const MOCK_EPISODES: MockEpisode[] = [
  {
    id: "1",
    title: "Nebula Drift — S1E1",
    synopsis: "A crew wakes from cryosleep to find their ship off course.",
  },
  {
    id: "2",
    title: "The Last Signal — S1E2",
    synopsis: "A lone technician chases a mysterious broadcast across the stars.",
  },
  {
    id: "3",
    title: "Quiet Harbor — S2E5",
    synopsis: "A detective returns to her hometown to solve a decades-old case.",
  },
];

export function getEpisodeById(id: string): MockEpisode | undefined {
  return MOCK_EPISODES.find((ep) => ep.id === id);
}
