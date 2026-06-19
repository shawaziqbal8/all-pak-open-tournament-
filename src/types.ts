/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Player {
  id: string;
  name: string;
  role: 'Captain' | 'Spiker' | 'Setter' | 'Libero' | 'Blocker' | 'All-Rounder';
  cnic?: string; // Standard Pakistani National ID
  photoUrl?: string; // Base64 or URL for player photo
}

export type PaymentStatus = 'unpaid' | 'pending' | 'paid';

export interface PaymentDetails {
  method: 'JazzCash' | 'EasyPaisa' | 'Bank Transfer' | 'Card';
  accountName: string;
  accountNumber?: string;
  transactionId: string;
  amount: number;
  timestamp: string;
  receiptUrl?: string; // Captured screenshot of the payment
}

export interface Team {
  id: string;
  name: string;
  city: string;
  coach: string;
  contactNumber: string;
  players: Player[];
  registrationDate: string;
  paymentStatus: PaymentStatus;
  paymentDetails?: PaymentDetails;
  primaryColor: string; // Hex or tailwind color class
  secondaryColor: string;
  logoUrl?: string; // Base64 or URL for team logo
  points?: number; // Leaderboard pts
  won?: number;
  lost?: number;
  setsWon?: number;
  setsLost?: number;
}

export type RoundType = 'quarters' | 'semis' | 'finals';
export type MatchStatus = 'scheduled' | 'live' | 'completed';

export interface SetScore {
  teamA: number;
  teamB: number;
}

export interface Match {
  id: string;
  teamAId: string;
  teamBId: string;
  teamAScore: number; // Sets won by team A
  teamBScore: number; // Sets won by team B
  setScores: SetScore[]; // E.g. [{teamA: 25, teamB: 22}, {teamA: 19, teamB: 25}]
  currentSetPoints: SetScore; // Live points in the current active set
  currentSetIndex: number; // 0, 1, 2
  round: RoundType;
  status: MatchStatus;
  scheduledTime: string; // e.g. "02 July, 04:00 PM"
  court: string; // e.g. "Court A - Khursheed Khan Ground"
  winnerId?: string;
  liveServer?: 'A' | 'B'; // Which team is serving right now
}

export interface NotificationItem {
  id: string;
  type: 'push' | 'email';
  title: string;
  message: string;
  recipient: string; // Email address or "All Participants"
  timestamp: string;
  sent: boolean;
}

export interface TournamentStats {
  totalTeams: number;
  completedMatches: number;
  activeMatches: number;
  totalSpectatorsSimulated: number;
  totalFundsRaised: number;
  featuredAdvertisement?: string;
  featuredAdvertisementLink?: string;
  featuredAdvertisementMediaUrl?: string;
  featuredAdvertisementMediaType?: 'image' | 'video' | 'none';
}
