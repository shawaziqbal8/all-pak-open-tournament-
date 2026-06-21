export interface Player {
  id: string;
  name: string;
  jerseyNumber: string;
  position: string;
}

export interface TeamReg {
  id: string;
  teamName: string;
  captainName: string;
  contactDetails: string;
  roster: Player[];
  paymentStatus: 'pending' | 'paid';
  verified: boolean;
}

export interface MatchScore {
  id: string;
  team1: string;
  team2: string;
  sets1: number;
  sets2: number;
  points1: number;
  points2: number;
  status: 'upcoming' | 'live' | 'finished';
  startTime?: string;
}

export interface AppState {
  matches: MatchScore[];
  teams: TeamReg[];
  usersConnected: number;
}
