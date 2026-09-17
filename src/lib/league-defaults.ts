// Defaults mirror the league's rules sheet: 12 teams, $50 buy-in, 6 playoff
// spots, and a 3-round playoff (Wild Card / Round 2 / Finals) on weeks 15-17.
export const LEAGUE_DEFAULTS = {
  name: "DFS DraftKings League",
  numTeams: 12,
  buyIn: 50,
  playoffTeams: 6,
  regularSeasonWeeks: 14,
  weeklyMostPfPayout: 6,
  seasonMostPfPayout: 48,
  season1stPayout: 270,
  season2ndPayout: 120,
  season3rdPayout: 60,
} as const;

// Home Field Advantage bonus, added directly to a team's DFS score, indexed
// by playoff seed for each round. Seeds 1-2 bye Round 1.
export const HFA_ROUND1: Record<number, number | "bye"> = {
  1: "bye",
  2: "bye",
  3: 6,
  4: 4,
  5: 2,
  6: 0,
};

export const HFA_ROUND2: Record<number, number> = {
  1: 6,
  2: 4,
  3: 2,
  4: 0,
};
