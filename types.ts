export enum InterestType {
  ALL = 'All',
  BUSINESS = 'Business',
  HIKING = 'Hiking',
  TECH = 'Tech',
  DATING = 'Dating',
  ART = 'Art',
  MUSIC = 'Music'
}

export interface Location {
  lat: number;
  lng: number;
}

export interface User {
  id: string;
  name: string;
  interest: InterestType;
  location: Location;
  avatar: string;
  bio: string;
  status: string;
  isConnected: boolean; // New field for privacy logic
}

export interface UserProfile {
  name: string;
  interest: InterestType;
  bio: string;
  status: string;
  avatar: string;
}

export interface Notification {
  id: string;
  type: 'match_accepted' | 'system';
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  data?: any; // e.g., user object
}

export interface AppState {
  center: Location;
  radius: number; // in kilometers
  selectedInterest: InterestType;
  users: User[];
}