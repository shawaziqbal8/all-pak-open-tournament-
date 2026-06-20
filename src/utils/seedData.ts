import { setDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Team, TournamentStats, Match } from '../types';

export const seedInitialDatabaseData = async () => {
  const sampleTeams: Team[] = [
    {
      id: 't1',
      name: 'Bisham Tigers',
      registrationDate: new Date().toISOString(),
      primaryColor: 'red',
      secondaryColor: 'black',
      city: 'Bisham',
      coach: 'Khursheed Ali',
      contactNumber: '0300-1111111',
      paymentStatus: 'paid',
      paymentDetails: {
        amount: 5000,
        transactionId: 'TXN-001',
        method: 'EasyPaisa',
        timestamp: new Date().toISOString(),
        accountName: 'Bisham Tigers'
      },
      players: [
        { id: 'p1', name: 'Zaman Shah', role: 'Captain' },
        { id: 'p2', name: 'Rahim Gul', role: 'Spiker' }
      ],
      won: 3,
      lost: 1,
      points: 120,
      setsWon: 6
    },
    {
      id: 't2',
      name: 'Peshawar Hawks',
      registrationDate: new Date().toISOString(),
      primaryColor: 'blue',
      secondaryColor: 'white',
      city: 'Peshawar',
      coach: 'Waqas Khan',
      contactNumber: '0300-2222222',
      paymentStatus: 'paid',
      paymentDetails: {
        amount: 5000,
        transactionId: 'TXN-002',
        method: 'JazzCash',
        timestamp: new Date().toISOString(),
        accountName: 'Peshawar Hawks'
      },
      players: [
        { id: 'p3', name: 'Sadiq Afridi', role: 'Captain' },
        { id: 'p4', name: 'Irfan Ullah', role: 'Libero' }
      ],
      won: 4,
      lost: 0,
      points: 150,
      setsWon: 8
    },
    {
      id: 't3',
      name: 'Swat Spikers',
      registrationDate: new Date().toISOString(),
      primaryColor: 'green',
      secondaryColor: 'gold',
      city: 'Swat',
      coach: 'Nawazish',
      contactNumber: '0300-3333333',
      paymentStatus: 'pending',
      paymentDetails: {
        amount: 5000,
        transactionId: 'TXN-PENDING',
        method: 'Bank Transfer',
        timestamp: new Date().toISOString(),
        accountName: 'Swat Spikers'
      },
      players: [
        { id: 'p5', name: 'Asad Khan', role: 'Captain' }
      ],
      won: 0,
      lost: 0,
      points: 0,
      setsWon: 0
    }
  ];

  const sampleStats: TournamentStats = {
    totalTeams: 3,
    completedMatches: 10,
    activeMatches: 1,
    totalSpectatorsSimulated: 450,
    totalFundsRaised: 15000, // 3 * 5000
    featuredAdvertisement: 'Welcome to the Official Pakistan Volleyball Championship!',
    featuredAdvertisementLink: '',
    featuredAdvertisementMediaUrl: '',
    featuredAdvertisementMediaType: 'none'
  };

  try {
    for (const team of sampleTeams) {
      await setDoc(doc(db, 'teams', team.id), team);
    }
    await setDoc(doc(db, 'stats', 'global'), sampleStats);
    alert('Successfully seeded database with sample teams and stats!');
  } catch (err) {
    console.error('Error seeding DB:', err);
    alert('Failed to seed database.');
  }
};
