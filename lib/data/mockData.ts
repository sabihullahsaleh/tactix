export type Position = 'GK' | 'CB' | 'LB' | 'RB' | 'CDM' | 'CM' | 'CAM' | 'LM' | 'RM' | 'LW' | 'RW' | 'ST' | 'CF';

export type Player = {
  id: string;
  name: string;
  shortName: string;
  position: Position;
  nationality: string;
  flagEmoji: string;
  club: string;
  clubBadge: string;
  age: number;
  height: number;
  weight: number;
  foot: 'Left' | 'Right' | 'Both';
  jerseyNumber: number;
  rating: number;
  marketValue: string;
  imageUrl: string;
  stats: {
    pace: number;
    shooting: number;
    passing: number;
    dribbling: number;
    defending: number;
    physical: number;
    goals: number;
    assists: number;
    matchRating: number;
    passAccuracy: number;
    sprintSpeed: number;
    tackles: number;
    dribbles: number;
    xG: number;
  };
};

export type Formation = '4-3-3' | '4-2-3-1' | '4-4-2' | '3-5-2' | '3-4-3' | '5-3-2' | '4-1-4-1';

export type BuildPlayer = {
  id: string;
  name: string;
  position: Position;
  jerseyNumber: number;
  imageUrl: string;
};

export type SavedLineup = {
  id: string;
  name: string;
  formation: Formation;
  teamName: string;
  teamBadge: string;
  players: { playerId: string; slot: number }[];
  opponentPlayers: { playerId: string; slot: number }[];
  createdAt: string;
};

export type Team = {
  id: string;
  name: string;
  shortName: string;
  badge: string;
  league: string;
  country: string;
  primaryColor: string;
  footballDataTeamId?: number;
};

export type MatchLog = {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  date: string;
  competition: string;
  formation: Formation;
  lineupId: string;
};

// --- MOCK PLAYERS ---
export const MOCK_PLAYERS: Player[] = [
  {
    id: 'p1', name: 'Mohamed Salah', shortName: 'Salah', position: 'RW',
    nationality: 'Egypt', flagEmoji: '🇪🇬', club: 'Liverpool', clubBadge: '⚽',
    age: 32, height: 175, weight: 71, foot: 'Left', jerseyNumber: 11, rating: 88,
    marketValue: '€65M', imageUrl: '',
    stats: { pace: 90, shooting: 86, passing: 81, dribbling: 87, defending: 45, physical: 75, goals: 22, assists: 13, matchRating: 8.1, passAccuracy: 83, sprintSpeed: 34, tackles: 28, dribbles: 112, xG: 19.4 }
  },
  {
    id: 'p2', name: 'Virgil van Dijk', shortName: 'Van Dijk', position: 'CB',
    nationality: 'Netherlands', flagEmoji: '🇳🇱', club: 'Liverpool', clubBadge: '⚽',
    age: 33, height: 193, weight: 92, foot: 'Right', jerseyNumber: 4, rating: 87,
    marketValue: '€40M', imageUrl: '',
    stats: { pace: 78, shooting: 60, passing: 76, dribbling: 71, defending: 91, physical: 88, goals: 3, assists: 2, matchRating: 7.8, passAccuracy: 89, sprintSpeed: 30, tackles: 87, dribbles: 15, xG: 2.1 }
  },
  {
    id: 'p3', name: 'Erling Haaland', shortName: 'Haaland', position: 'ST',
    nationality: 'Norway', flagEmoji: '🇳🇴', club: 'Man City', clubBadge: '⚽',
    age: 24, height: 194, weight: 88, foot: 'Left', jerseyNumber: 9, rating: 91,
    marketValue: '€180M', imageUrl: '',
    stats: { pace: 89, shooting: 95, passing: 65, dribbling: 80, defending: 45, physical: 88, goals: 29, assists: 5, matchRating: 8.4, passAccuracy: 72, sprintSpeed: 36, tackles: 18, dribbles: 67, xG: 25.1 }
  },
  {
    id: 'p4', name: 'Kevin De Bruyne', shortName: 'De Bruyne', position: 'CM',
    nationality: 'Belgium', flagEmoji: '🇧🇪', club: 'Man City', clubBadge: '⚽',
    age: 33, height: 181, weight: 70, foot: 'Right', jerseyNumber: 17, rating: 91,
    marketValue: '€70M', imageUrl: '',
    stats: { pace: 76, shooting: 82, passing: 94, dribbling: 86, defending: 64, physical: 78, goals: 8, assists: 16, matchRating: 8.3, passAccuracy: 88, sprintSpeed: 32, tackles: 45, dribbles: 98, xG: 7.2 }
  },
  {
    id: 'p5', name: 'Kylian Mbappé', shortName: 'Mbappé', position: 'ST',
    nationality: 'France', flagEmoji: '🇫🇷', club: 'Real Madrid', clubBadge: '⚽',
    age: 26, height: 178, weight: 73, foot: 'Right', jerseyNumber: 9, rating: 92,
    marketValue: '€200M', imageUrl: '',
    stats: { pace: 97, shooting: 89, passing: 80, dribbling: 92, defending: 36, physical: 76, goals: 31, assists: 8, matchRating: 8.6, passAccuracy: 79, sprintSpeed: 38, tackles: 22, dribbles: 187, xG: 26.8 }
  },
  {
    id: 'p6', name: 'Bukayo Saka', shortName: 'Saka', position: 'RW',
    nationality: 'England', flagEmoji: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', club: 'Arsenal', clubBadge: '⚽',
    age: 23, height: 178, weight: 72, foot: 'Left', jerseyNumber: 7, rating: 87,
    marketValue: '€130M', imageUrl: '',
    stats: { pace: 86, shooting: 80, passing: 83, dribbling: 85, defending: 58, physical: 68, goals: 16, assists: 11, matchRating: 7.9, passAccuracy: 84, sprintSpeed: 33, tackles: 42, dribbles: 134, xG: 14.2 }
  },
  {
    id: 'p7', name: 'Rodri', shortName: 'Rodri', position: 'CDM',
    nationality: 'Spain', flagEmoji: '🇪🇸', club: 'Man City', clubBadge: '⚽',
    age: 28, height: 191, weight: 82, foot: 'Right', jerseyNumber: 16, rating: 91,
    marketValue: '€120M', imageUrl: '',
    stats: { pace: 72, shooting: 68, passing: 88, dribbling: 78, defending: 89, physical: 84, goals: 4, assists: 7, matchRating: 8.0, passAccuracy: 92, sprintSpeed: 28, tackles: 112, dribbles: 45, xG: 3.1 }
  },
  {
    id: 'p8', name: 'Alisson Becker', shortName: 'Alisson', position: 'GK',
    nationality: 'Brazil', flagEmoji: '🇧🇷', club: 'Liverpool', clubBadge: '⚽',
    age: 32, height: 191, weight: 91, foot: 'Right', jerseyNumber: 1, rating: 89,
    marketValue: '€45M', imageUrl: '',
    stats: { pace: 52, shooting: 20, passing: 78, dribbling: 30, defending: 87, physical: 76, goals: 0, assists: 1, matchRating: 7.6, passAccuracy: 84, sprintSpeed: 22, tackles: 0, dribbles: 2, xG: 0 }
  },
  {
    id: 'p9', name: 'Trent Alexander-Arnold', shortName: 'TAA', position: 'RB',
    nationality: 'England', flagEmoji: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', club: 'Liverpool', clubBadge: '⚽',
    age: 26, height: 175, weight: 69, foot: 'Right', jerseyNumber: 66, rating: 87,
    marketValue: '€80M', imageUrl: '',
    stats: { pace: 82, shooting: 72, passing: 91, dribbling: 80, defending: 71, physical: 67, goals: 6, assists: 14, matchRating: 7.8, passAccuracy: 88, sprintSpeed: 31, tackles: 58, dribbles: 72, xG: 4.9 }
  },
  {
    id: 'p10', name: 'Jude Bellingham', shortName: 'Bellingham', position: 'CAM',
    nationality: 'England', flagEmoji: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', club: 'Real Madrid', clubBadge: '⚽',
    age: 21, height: 186, weight: 75, foot: 'Right', jerseyNumber: 5, rating: 90,
    marketValue: '€180M', imageUrl: '',
    stats: { pace: 80, shooting: 84, passing: 85, dribbling: 86, defending: 72, physical: 82, goals: 19, assists: 9, matchRating: 8.2, passAccuracy: 85, sprintSpeed: 33, tackles: 76, dribbles: 112, xG: 16.4 }
  },
  {
    id: 'p11', name: 'Phil Foden', shortName: 'Foden', position: 'LW',
    nationality: 'England', flagEmoji: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', club: 'Man City', clubBadge: '⚽',
    age: 24, height: 171, weight: 69, foot: 'Left', jerseyNumber: 47, rating: 88,
    marketValue: '€120M', imageUrl: '',
    stats: { pace: 84, shooting: 83, passing: 84, dribbling: 88, defending: 52, physical: 65, goals: 15, assists: 10, matchRating: 8.0, passAccuracy: 87, sprintSpeed: 32, tackles: 38, dribbles: 128, xG: 13.1 }
  },
  {
    id: 'p12', name: 'Marc-André ter Stegen', shortName: 'Ter Stegen', position: 'GK',
    nationality: 'Germany', flagEmoji: '🇩🇪', club: 'Barcelona', clubBadge: '⚽',
    age: 32, height: 187, weight: 85, foot: 'Right', jerseyNumber: 1, rating: 87,
    marketValue: '€30M', imageUrl: '',
    stats: { pace: 51, shooting: 18, passing: 80, dribbling: 28, defending: 86, physical: 74, goals: 0, assists: 0, matchRating: 7.4, passAccuracy: 85, sprintSpeed: 21, tackles: 0, dribbles: 1, xG: 0 }
  },
  {
    id: 'p13', name: 'Lamine Yamal', shortName: 'Yamal', position: 'RW',
    nationality: 'Spain', flagEmoji: '🇪🇸', club: 'Barcelona', clubBadge: '⚽',
    age: 17, height: 180, weight: 67, foot: 'Right', jerseyNumber: 19, rating: 84,
    marketValue: '€150M', imageUrl: '',
    stats: { pace: 88, shooting: 76, passing: 79, dribbling: 89, defending: 32, physical: 60, goals: 11, assists: 13, matchRating: 7.9, passAccuracy: 80, sprintSpeed: 34, tackles: 18, dribbles: 152, xG: 9.8 }
  },
  {
    id: 'p14', name: 'Harry Kane', shortName: 'Kane', position: 'ST',
    nationality: 'England', flagEmoji: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', club: 'Bayern Munich', clubBadge: '⚽',
    age: 31, height: 188, weight: 86, foot: 'Right', jerseyNumber: 9, rating: 90,
    marketValue: '€100M', imageUrl: '',
    stats: { pace: 74, shooting: 93, passing: 83, dribbling: 79, defending: 47, physical: 83, goals: 33, assists: 11, matchRating: 8.3, passAccuracy: 81, sprintSpeed: 30, tackles: 24, dribbles: 78, xG: 28.9 }
  },
  {
    id: 'p15', name: 'Declan Rice', shortName: 'Rice', position: 'CDM',
    nationality: 'England', flagEmoji: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', club: 'Arsenal', clubBadge: '⚽',
    age: 26, height: 185, weight: 82, foot: 'Right', jerseyNumber: 41, rating: 86,
    marketValue: '€90M', imageUrl: '',
    stats: { pace: 78, shooting: 70, passing: 82, dribbling: 76, defending: 86, physical: 83, goals: 7, assists: 8, matchRating: 7.8, passAccuracy: 88, sprintSpeed: 31, tackles: 98, dribbles: 62, xG: 5.2 }
  },
];

// --- MOCK TEAMS ---
export const MOCK_TEAMS: Team[] = [
  { id: 't1', name: 'Liverpool FC', shortName: 'LFC', badge: '🔴', league: 'Premier League', country: 'England', primaryColor: '#c8102e', footballDataTeamId: 64 },
  { id: 't2', name: 'Manchester City', shortName: 'MCI', badge: '🔵', league: 'Premier League', country: 'England', primaryColor: '#6cabdd', footballDataTeamId: 65 },
  { id: 't3', name: 'Arsenal', shortName: 'ARS', badge: '🔴', league: 'Premier League', country: 'England', primaryColor: '#ef0107', footballDataTeamId: 57 },
  { id: 't4', name: 'Real Madrid', shortName: 'RMA', badge: '⚪', league: 'La Liga', country: 'Spain', primaryColor: '#febe10', footballDataTeamId: 86 },
  { id: 't5', name: 'Barcelona', shortName: 'FCB', badge: '🔵', league: 'La Liga', country: 'Spain', primaryColor: '#a50044', footballDataTeamId: 81 },
  { id: 't6', name: 'Bayern Munich', shortName: 'FCB', badge: '🔴', league: 'Bundesliga', country: 'Germany', primaryColor: '#dc052d', footballDataTeamId: 5 },
];

// --- FORMATION POSITIONS (pitch coordinates as % x, y) ---
export const FORMATION_POSITIONS: Record<Formation, { slot: number; position: Position; x: number; y: number }[]> = {
  '4-3-3': [
    { slot: 0, position: 'GK', x: 50, y: 90 },
    { slot: 1, position: 'RB', x: 80, y: 72 },
    { slot: 2, position: 'CB', x: 63, y: 72 },
    { slot: 3, position: 'CB', x: 37, y: 72 },
    { slot: 4, position: 'LB', x: 20, y: 72 },
    { slot: 5, position: 'CM', x: 70, y: 50 },
    { slot: 6, position: 'CM', x: 50, y: 48 },
    { slot: 7, position: 'CM', x: 30, y: 50 },
    { slot: 8, position: 'RW', x: 80, y: 25 },
    { slot: 9, position: 'ST', x: 50, y: 18 },
    { slot: 10, position: 'LW', x: 20, y: 25 },
  ],
  '4-2-3-1': [
    { slot: 0, position: 'GK', x: 50, y: 90 },
    { slot: 1, position: 'RB', x: 80, y: 72 },
    { slot: 2, position: 'CB', x: 63, y: 72 },
    { slot: 3, position: 'CB', x: 37, y: 72 },
    { slot: 4, position: 'LB', x: 20, y: 72 },
    { slot: 5, position: 'CDM', x: 62, y: 55 },
    { slot: 6, position: 'CDM', x: 38, y: 55 },
    { slot: 7, position: 'RM', x: 78, y: 35 },
    { slot: 8, position: 'CAM', x: 50, y: 33 },
    { slot: 9, position: 'LM', x: 22, y: 35 },
    { slot: 10, position: 'ST', x: 50, y: 16 },
  ],
  '4-4-2': [
    { slot: 0, position: 'GK', x: 50, y: 90 },
    { slot: 1, position: 'RB', x: 80, y: 72 },
    { slot: 2, position: 'CB', x: 63, y: 72 },
    { slot: 3, position: 'CB', x: 37, y: 72 },
    { slot: 4, position: 'LB', x: 20, y: 72 },
    { slot: 5, position: 'RM', x: 78, y: 50 },
    { slot: 6, position: 'CM', x: 62, y: 50 },
    { slot: 7, position: 'CM', x: 38, y: 50 },
    { slot: 8, position: 'LM', x: 22, y: 50 },
    { slot: 9, position: 'ST', x: 63, y: 20 },
    { slot: 10, position: 'ST', x: 37, y: 20 },
  ],
  '3-5-2': [
    { slot: 0, position: 'GK', x: 50, y: 90 },
    { slot: 1, position: 'CB', x: 70, y: 72 },
    { slot: 2, position: 'CB', x: 50, y: 74 },
    { slot: 3, position: 'CB', x: 30, y: 72 },
    { slot: 4, position: 'RM', x: 85, y: 52 },
    { slot: 5, position: 'CM', x: 67, y: 52 },
    { slot: 6, position: 'CDM', x: 50, y: 55 },
    { slot: 7, position: 'CM', x: 33, y: 52 },
    { slot: 8, position: 'LM', x: 15, y: 52 },
    { slot: 9, position: 'ST', x: 63, y: 20 },
    { slot: 10, position: 'ST', x: 37, y: 20 },
  ],
  '3-4-3': [
    { slot: 0, position: 'GK', x: 50, y: 90 },
    { slot: 1, position: 'CB', x: 70, y: 72 },
    { slot: 2, position: 'CB', x: 50, y: 74 },
    { slot: 3, position: 'CB', x: 30, y: 72 },
    { slot: 4, position: 'RM', x: 80, y: 50 },
    { slot: 5, position: 'CM', x: 60, y: 50 },
    { slot: 6, position: 'CM', x: 40, y: 50 },
    { slot: 7, position: 'LM', x: 20, y: 50 },
    { slot: 8, position: 'RW', x: 78, y: 22 },
    { slot: 9, position: 'ST', x: 50, y: 16 },
    { slot: 10, position: 'LW', x: 22, y: 22 },
  ],
  '5-3-2': [
    { slot: 0, position: 'GK', x: 50, y: 90 },
    { slot: 1, position: 'RB', x: 85, y: 68 },
    { slot: 2, position: 'CB', x: 68, y: 72 },
    { slot: 3, position: 'CB', x: 50, y: 74 },
    { slot: 4, position: 'CB', x: 32, y: 72 },
    { slot: 5, position: 'LB', x: 15, y: 68 },
    { slot: 6, position: 'CM', x: 65, y: 48 },
    { slot: 7, position: 'CM', x: 50, y: 46 },
    { slot: 8, position: 'CM', x: 35, y: 48 },
    { slot: 9, position: 'ST', x: 63, y: 20 },
    { slot: 10, position: 'ST', x: 37, y: 20 },
  ],
  '4-1-4-1': [
    { slot: 0, position: 'GK', x: 50, y: 90 },
    { slot: 1, position: 'RB', x: 80, y: 72 },
    { slot: 2, position: 'CB', x: 63, y: 72 },
    { slot: 3, position: 'CB', x: 37, y: 72 },
    { slot: 4, position: 'LB', x: 20, y: 72 },
    { slot: 5, position: 'CDM', x: 50, y: 57 },
    { slot: 6, position: 'RM', x: 78, y: 40 },
    { slot: 7, position: 'CM', x: 60, y: 40 },
    { slot: 8, position: 'CM', x: 40, y: 40 },
    { slot: 9, position: 'LM', x: 22, y: 40 },
    { slot: 10, position: 'ST', x: 50, y: 16 },
  ],
};

// --- MOCK LINEUPS ---
export const MOCK_LINEUPS: SavedLineup[] = [
  {
    id: 'l1',
    name: 'Liverpool Attack',
    formation: '4-3-3',
    teamName: 'Liverpool FC',
    teamBadge: '🔴',
    players: [
      { playerId: 'p8', slot: 0 },
      { playerId: 'p9', slot: 1 },
      { playerId: 'p2', slot: 2 },
      { playerId: 'p1', slot: 8 },
    ],
    opponentPlayers: [],
    createdAt: '2025-03-28',
  },
  {
    id: 'l2',
    name: 'Man City Midfield Press',
    formation: '4-2-3-1',
    teamName: 'Manchester City',
    teamBadge: '🔵',
    players: [
      { playerId: 'p4', slot: 8 },
      { playerId: 'p7', slot: 5 },
      { playerId: 'p11', slot: 9 },
      { playerId: 'p3', slot: 10 },
    ],
    opponentPlayers: [],
    createdAt: '2025-03-20',
  },
  {
    id: 'l3',
    name: 'England NT',
    formation: '4-3-3',
    teamName: 'England',
    teamBadge: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    players: [
      { playerId: 'p9', slot: 1 },
      { playerId: 'p15', slot: 6 },
      { playerId: 'p10', slot: 8 },
      { playerId: 'p6', slot: 8 },
    ],
    opponentPlayers: [],
    createdAt: '2025-03-15',
  },
];

// --- MOCK MATCH LOGS ---
export const MOCK_MATCHES: MatchLog[] = [
  { id: 'm1', homeTeam: 'Liverpool', awayTeam: 'Arsenal', homeScore: 3, awayScore: 1, date: '2025-03-28', competition: 'Premier League', formation: '4-3-3', lineupId: 'l1' },
  { id: 'm2', homeTeam: 'Man City', awayTeam: 'Chelsea', homeScore: 2, awayScore: 2, date: '2025-03-22', competition: 'Premier League', formation: '4-2-3-1', lineupId: 'l2' },
  { id: 'm3', homeTeam: 'England', awayTeam: 'France', homeScore: 1, awayScore: 0, date: '2025-03-18', competition: 'UEFA Nations League', formation: '4-3-3', lineupId: 'l3' },
];

export const LEAGUES = ['All', 'Premier League', 'La Liga', 'Bundesliga', 'Serie A', 'Ligue 1', 'UCL'];

export const POSITIONS: Position[] = ['GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LM', 'RM', 'LW', 'RW', 'ST', 'CF'];

export type RecentMatch = {
  opponent: string;
  competition: string;
  type: 'club' | 'country';
  date: string;
  result: 'W' | 'L' | 'D';
  score: string;
  goals: number;
  assists: number;
  rating: number;
};

export const PLAYER_RECENT_MATCHES: Record<string, RecentMatch[]> = {
  p1: [
    { opponent: 'Arsenal', competition: 'Premier League', type: 'club', date: '2026-04-06', result: 'W', score: '3-1', goals: 1, assists: 1, rating: 8.4 },
    { opponent: 'Real Madrid', competition: 'UCL', type: 'club', date: '2026-04-01', result: 'D', score: '1-1', goals: 1, assists: 0, rating: 7.9 },
    { opponent: 'Sudan', competition: 'AFCON Qualifier', type: 'country', date: '2026-03-26', result: 'W', score: '2-0', goals: 2, assists: 0, rating: 8.8 },
    { opponent: 'Newcastle', competition: 'Premier League', type: 'club', date: '2026-03-22', result: 'W', score: '2-0', goals: 0, assists: 2, rating: 7.8 },
    { opponent: 'Everton', competition: 'Premier League', type: 'club', date: '2026-03-15', result: 'W', score: '4-0', goals: 2, assists: 1, rating: 9.1 },
  ],
  p2: [
    { opponent: 'Arsenal', competition: 'Premier League', type: 'club', date: '2026-04-06', result: 'W', score: '3-1', goals: 0, assists: 0, rating: 8.0 },
    { opponent: 'Real Madrid', competition: 'UCL', type: 'club', date: '2026-04-01', result: 'D', score: '1-1', goals: 0, assists: 1, rating: 7.5 },
    { opponent: 'Germany', competition: 'Nations League', type: 'country', date: '2026-03-26', result: 'L', score: '1-2', goals: 0, assists: 0, rating: 6.8 },
    { opponent: 'Newcastle', competition: 'Premier League', type: 'club', date: '2026-03-22', result: 'W', score: '2-0', goals: 0, assists: 0, rating: 7.9 },
    { opponent: 'Everton', competition: 'Premier League', type: 'club', date: '2026-03-15', result: 'W', score: '4-0', goals: 1, assists: 0, rating: 8.2 },
  ],
  p3: [
    { opponent: 'Chelsea', competition: 'Premier League', type: 'club', date: '2026-04-07', result: 'W', score: '3-0', goals: 2, assists: 0, rating: 9.0 },
    { opponent: 'Real Madrid', competition: 'UCL', type: 'club', date: '2026-04-02', result: 'W', score: '2-1', goals: 1, assists: 0, rating: 8.2 },
    { opponent: 'Sweden', competition: 'WC Qualifier', type: 'country', date: '2026-03-27', result: 'W', score: '3-1', goals: 2, assists: 1, rating: 9.3 },
    { opponent: 'Spurs', competition: 'Premier League', type: 'club', date: '2026-03-22', result: 'D', score: '1-1', goals: 1, assists: 0, rating: 7.4 },
    { opponent: 'Arsenal', competition: 'Premier League', type: 'club', date: '2026-03-15', result: 'W', score: '2-0', goals: 0, assists: 1, rating: 7.6 },
  ],
  p4: [
    { opponent: 'Chelsea', competition: 'Premier League', type: 'club', date: '2026-04-07', result: 'W', score: '3-0', goals: 0, assists: 2, rating: 8.7 },
    { opponent: 'Real Madrid', competition: 'UCL', type: 'club', date: '2026-04-02', result: 'W', score: '2-1', goals: 1, assists: 1, rating: 9.1 },
    { opponent: 'France', competition: 'Nations League', type: 'country', date: '2026-03-27', result: 'L', score: '0-2', goals: 0, assists: 0, rating: 6.5 },
    { opponent: 'Spurs', competition: 'Premier League', type: 'club', date: '2026-03-22', result: 'D', score: '1-1', goals: 0, assists: 1, rating: 7.8 },
    { opponent: 'Arsenal', competition: 'Premier League', type: 'club', date: '2026-03-15', result: 'W', score: '2-0', goals: 1, assists: 0, rating: 8.3 },
  ],
  p5: [
    { opponent: 'Barcelona', competition: 'La Liga', type: 'club', date: '2026-04-05', result: 'W', score: '3-2', goals: 2, assists: 1, rating: 9.4 },
    { opponent: 'Dortmund', competition: 'UCL', type: 'club', date: '2026-04-02', result: 'W', score: '4-1', goals: 2, assists: 0, rating: 9.2 },
    { opponent: 'Belgium', competition: 'Nations League', type: 'country', date: '2026-03-27', result: 'W', score: '2-0', goals: 1, assists: 1, rating: 8.6 },
    { opponent: 'Atletico', competition: 'La Liga', type: 'club', date: '2026-03-21', result: 'D', score: '2-2', goals: 1, assists: 0, rating: 7.8 },
    { opponent: 'Getafe', competition: 'La Liga', type: 'club', date: '2026-03-14', result: 'W', score: '5-0', goals: 3, assists: 1, rating: 9.6 },
  ],
  p6: [
    { opponent: 'Man City', competition: 'Premier League', type: 'club', date: '2026-04-06', result: 'L', score: '1-3', goals: 1, assists: 0, rating: 7.2 },
    { opponent: 'PSG', competition: 'UCL', type: 'club', date: '2026-04-01', result: 'W', score: '2-0', goals: 0, assists: 1, rating: 7.9 },
    { opponent: 'Albania', competition: 'WC Qualifier', type: 'country', date: '2026-03-26', result: 'W', score: '3-0', goals: 1, assists: 2, rating: 8.5 },
    { opponent: 'Chelsea', competition: 'Premier League', type: 'club', date: '2026-03-22', result: 'W', score: '2-1', goals: 1, assists: 1, rating: 8.3 },
    { opponent: 'Everton', competition: 'Premier League', type: 'club', date: '2026-03-15', result: 'W', score: '5-1', goals: 2, assists: 1, rating: 9.0 },
  ],
  p7: [
    { opponent: 'Chelsea', competition: 'Premier League', type: 'club', date: '2026-04-07', result: 'W', score: '3-0', goals: 0, assists: 1, rating: 8.4 },
    { opponent: 'Real Madrid', competition: 'UCL', type: 'club', date: '2026-04-02', result: 'W', score: '2-1', goals: 0, assists: 0, rating: 8.1 },
    { opponent: 'Netherlands', competition: 'Nations League', type: 'country', date: '2026-03-27', result: 'W', score: '1-0', goals: 0, assists: 0, rating: 7.9 },
    { opponent: 'Spurs', competition: 'Premier League', type: 'club', date: '2026-03-22', result: 'D', score: '1-1', goals: 0, assists: 0, rating: 7.6 },
    { opponent: 'Arsenal', competition: 'Premier League', type: 'club', date: '2026-03-15', result: 'W', score: '2-0', goals: 1, assists: 0, rating: 8.5 },
  ],
  p8: [
    { opponent: 'Arsenal', competition: 'Premier League', type: 'club', date: '2026-04-06', result: 'W', score: '3-1', goals: 0, assists: 0, rating: 7.8 },
    { opponent: 'Real Madrid', competition: 'UCL', type: 'club', date: '2026-04-01', result: 'D', score: '1-1', goals: 0, assists: 0, rating: 7.4 },
    { opponent: 'Colombia', competition: 'WC Qualifier', type: 'country', date: '2026-03-26', result: 'W', score: '1-0', goals: 0, assists: 0, rating: 8.2 },
    { opponent: 'Newcastle', competition: 'Premier League', type: 'club', date: '2026-03-22', result: 'W', score: '2-0', goals: 0, assists: 0, rating: 7.5 },
    { opponent: 'Everton', competition: 'Premier League', type: 'club', date: '2026-03-15', result: 'W', score: '4-0', goals: 0, assists: 0, rating: 7.9 },
  ],
  p9: [
    { opponent: 'Arsenal', competition: 'Premier League', type: 'club', date: '2026-04-06', result: 'W', score: '3-1', goals: 1, assists: 1, rating: 8.6 },
    { opponent: 'Real Madrid', competition: 'UCL', type: 'club', date: '2026-04-01', result: 'D', score: '1-1', goals: 0, assists: 0, rating: 7.2 },
    { opponent: 'Albania', competition: 'WC Qualifier', type: 'country', date: '2026-03-26', result: 'W', score: '3-0', goals: 0, assists: 2, rating: 8.3 },
    { opponent: 'Newcastle', competition: 'Premier League', type: 'club', date: '2026-03-22', result: 'W', score: '2-0', goals: 0, assists: 1, rating: 7.8 },
    { opponent: 'Everton', competition: 'Premier League', type: 'club', date: '2026-03-15', result: 'W', score: '4-0', goals: 0, assists: 1, rating: 8.0 },
  ],
  p10: [
    { opponent: 'Barcelona', competition: 'La Liga', type: 'club', date: '2026-04-05', result: 'W', score: '3-2', goals: 1, assists: 1, rating: 9.0 },
    { opponent: 'Dortmund', competition: 'UCL', type: 'club', date: '2026-04-02', result: 'W', score: '4-1', goals: 2, assists: 0, rating: 9.3 },
    { opponent: 'Albania', competition: 'WC Qualifier', type: 'country', date: '2026-03-26', result: 'W', score: '3-0', goals: 1, assists: 1, rating: 8.9 },
    { opponent: 'Atletico', competition: 'La Liga', type: 'club', date: '2026-03-21', result: 'D', score: '2-2', goals: 1, assists: 0, rating: 8.1 },
    { opponent: 'Getafe', competition: 'La Liga', type: 'club', date: '2026-03-14', result: 'W', score: '5-0', goals: 1, assists: 2, rating: 8.7 },
  ],
  p11: [
    { opponent: 'Chelsea', competition: 'Premier League', type: 'club', date: '2026-04-07', result: 'W', score: '3-0', goals: 1, assists: 1, rating: 8.4 },
    { opponent: 'Real Madrid', competition: 'UCL', type: 'club', date: '2026-04-02', result: 'W', score: '2-1', goals: 0, assists: 1, rating: 7.8 },
    { opponent: 'Albania', competition: 'WC Qualifier', type: 'country', date: '2026-03-26', result: 'W', score: '3-0', goals: 1, assists: 0, rating: 8.1 },
    { opponent: 'Spurs', competition: 'Premier League', type: 'club', date: '2026-03-22', result: 'D', score: '1-1', goals: 1, assists: 0, rating: 7.5 },
    { opponent: 'Arsenal', competition: 'Premier League', type: 'club', date: '2026-03-15', result: 'W', score: '2-0', goals: 0, assists: 2, rating: 8.2 },
  ],
  p12: [
    { opponent: 'Real Madrid', competition: 'La Liga', type: 'club', date: '2026-04-05', result: 'L', score: '2-3', goals: 0, assists: 0, rating: 6.5 },
    { opponent: 'Napoli', competition: 'UCL', type: 'club', date: '2026-04-01', result: 'W', score: '2-0', goals: 0, assists: 0, rating: 7.8 },
    { opponent: 'Italy', competition: 'Nations League', type: 'country', date: '2026-03-26', result: 'D', score: '1-1', goals: 0, assists: 0, rating: 7.2 },
    { opponent: 'Atletico', competition: 'La Liga', type: 'club', date: '2026-03-21', result: 'W', score: '2-1', goals: 0, assists: 0, rating: 7.6 },
    { opponent: 'Valencia', competition: 'La Liga', type: 'club', date: '2026-03-14', result: 'W', score: '3-0', goals: 0, assists: 0, rating: 7.9 },
  ],
  p13: [
    { opponent: 'Real Madrid', competition: 'La Liga', type: 'club', date: '2026-04-05', result: 'L', score: '2-3', goals: 1, assists: 0, rating: 7.8 },
    { opponent: 'Napoli', competition: 'UCL', type: 'club', date: '2026-04-01', result: 'W', score: '2-0', goals: 1, assists: 1, rating: 8.9 },
    { opponent: 'Albania', competition: 'WC Qualifier', type: 'country', date: '2026-03-26', result: 'W', score: '3-0', goals: 1, assists: 2, rating: 9.1 },
    { opponent: 'Atletico', competition: 'La Liga', type: 'club', date: '2026-03-21', result: 'W', score: '2-1', goals: 0, assists: 1, rating: 8.3 },
    { opponent: 'Valencia', competition: 'La Liga', type: 'club', date: '2026-03-14', result: 'W', score: '3-0', goals: 2, assists: 0, rating: 9.0 },
  ],
  p14: [
    { opponent: 'Dortmund', competition: 'Bundesliga', type: 'club', date: '2026-04-05', result: 'W', score: '3-1', goals: 2, assists: 1, rating: 9.2 },
    { opponent: 'Inter', competition: 'UCL', type: 'club', date: '2026-04-01', result: 'W', score: '2-0', goals: 1, assists: 0, rating: 8.4 },
    { opponent: 'Albania', competition: 'WC Qualifier', type: 'country', date: '2026-03-26', result: 'W', score: '3-0', goals: 1, assists: 1, rating: 8.7 },
    { opponent: 'RB Leipzig', competition: 'Bundesliga', type: 'club', date: '2026-03-21', result: 'D', score: '2-2', goals: 1, assists: 0, rating: 7.8 },
    { opponent: 'Mainz', competition: 'Bundesliga', type: 'club', date: '2026-03-14', result: 'W', score: '5-0', goals: 3, assists: 0, rating: 9.5 },
  ],
  p15: [
    { opponent: 'Man City', competition: 'Premier League', type: 'club', date: '2026-04-06', result: 'L', score: '1-3', goals: 0, assists: 0, rating: 7.3 },
    { opponent: 'PSG', competition: 'UCL', type: 'club', date: '2026-04-01', result: 'W', score: '2-0', goals: 1, assists: 0, rating: 8.1 },
    { opponent: 'Albania', competition: 'WC Qualifier', type: 'country', date: '2026-03-26', result: 'W', score: '3-0', goals: 0, assists: 1, rating: 8.0 },
    { opponent: 'Chelsea', competition: 'Premier League', type: 'club', date: '2026-03-22', result: 'W', score: '2-1', goals: 0, assists: 0, rating: 7.7 },
    { opponent: 'Everton', competition: 'Premier League', type: 'club', date: '2026-03-15', result: 'W', score: '5-1', goals: 1, assists: 1, rating: 8.6 },
  ],
};

export const POSITION_COLORS: Record<Position, string> = {
  GK: '#f59e0b',
  CB: '#3b82f6', LB: '#3b82f6', RB: '#3b82f6',
  CDM: '#10b981', CM: '#10b981', CAM: '#10b981', LM: '#10b981', RM: '#10b981',
  LW: '#ef4444', RW: '#ef4444', ST: '#ef4444', CF: '#ef4444',
};
