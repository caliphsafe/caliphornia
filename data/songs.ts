// data/songs.ts
export type SongMeta = {
  slug: string;              // e.g. "polygamy"
  title: string;
  artist: string;
  cover: string;
  audioUrl: string;          // full track URL (no preview logic)
  status: "live" | "upcoming";
};

export const SONGS: Record<string, SongMeta> = {
  polygamy: {
    slug: "polygamy",
    title: "Polygamy (Prod. By Caliph)",
    artist: "Caliph",
    cover: "/polygamy-cover.png",
    audioUrl: "/audio/polygamy-full.mp3",
    status: "live",
  },
  // add future drops here...
};
