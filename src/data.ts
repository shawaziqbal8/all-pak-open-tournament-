/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Team, Match, NotificationItem, TournamentStats } from './types';

export const INITIAL_TEAMS: Team[] = [];

export const INITIAL_MATCHES: Match[] = [];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [];

export const TOURNAMENT_DETAILS = {
  name: 'All Pakistan Open Volleyball Tournament',
  venue: 'Khursheed Khan Volleyball Ground, Taja Maira, Bisham, Shangla.',
  startDate: '2 July 2026',
  chiefOrganizers: ['Raham Iqbal Khan', 'Bakht Zeb', 'Hamid Anjum'],
  contactNumber: '0306-0888584',
  sponsor: 'FGC (Fawad Group of Companies)',
  entryFee: 5000, // PKR
};

export const INITIAL_STATS: TournamentStats = {
  totalTeams: 0,
  completedMatches: 0,
  activeMatches: 0,
  totalSpectatorsSimulated: 0,
  totalFundsRaised: 0,
  featuredAdvertisement: 'Welcome to the Official Pakistan Volleyball Championship!',
  featuredAdvertisementLink: '',
  featuredAdvertisementMediaUrl: '',
  featuredAdvertisementMediaType: 'none'
};
