import { User, InterestType, Location } from './types';

// Center of London
export const DEFAULT_CENTER: Location = { lat: 51.505, lng: -0.09 };

const NAMES = [
  "Alice", "Bob", "Charlie", "Diana", "Ethan", "Fiona", "George", "Hannah", 
  "Ian", "Julia", "Kevin", "Liam", "Mia", "Noah", "Olivia", "Peter", 
  "Quinn", "Rachel", "Sam", "Tina"
];

const STATUSES = [
  "Looking for a hiking buddy!",
  "Networking for SaaS ideas.",
  "Just here for the vibes.",
  "Anyone up for coffee?",
  "Coding in the park.",
  "Photography walk anyone?"
];

const INTERESTS = [
  InterestType.BUSINESS,
  InterestType.HIKING,
  InterestType.TECH,
  InterestType.DATING,
  InterestType.ART,
  InterestType.MUSIC
];

/**
 * Generates a random float between min and max
 */
function randomRange(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

/**
 * Generate random users around a central point
 */
export const generateMockUsers = (center: Location, count: number): User[] => {
  const users: User[] = [];
  
  for (let i = 0; i < count; i++) {
    // Generate random offset for lat/lng
    const latOffset = randomRange(-0.08, 0.08);
    const lngOffset = randomRange(-0.12, 0.12);

    users.push({
      id: `user-${i}`,
      name: NAMES[i % NAMES.length],
      interest: INTERESTS[Math.floor(Math.random() * INTERESTS.length)],
      location: {
        lat: center.lat + latOffset,
        lng: center.lng + lngOffset
      },
      avatar: `https://picsum.photos/seed/${i + 123}/200/200`,
      bio: "Lover of life, explorer of the unknown, and seeking genuine connections in this busy city.",
      status: STATUSES[i % STATUSES.length],
      isConnected: Math.random() > 0.8 // 20% chance of being already connected (simulated previous chats)
    });
  }
  return users;
};

/**
 * Calculate distance between two coordinates in Kilometers (Haversine formula)
 */
export const calculateDistance = (loc1: Location, loc2: Location): number => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(loc2.lat - loc1.lat);
  const dLng = deg2rad(loc2.lng - loc1.lng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(loc1.lat)) *
      Math.cos(deg2rad(loc2.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}

/**
 * Get Interest Color for UI
 */
export const getInterestColor = (interest: InterestType): string => {
  switch (interest) {
    case InterestType.BUSINESS: return 'bg-blue-500';
    case InterestType.HIKING: return 'bg-green-600';
    case InterestType.TECH: return 'bg-indigo-500';
    case InterestType.DATING: return 'bg-pink-500';
    case InterestType.ART: return 'bg-purple-500';
    case InterestType.MUSIC: return 'bg-orange-500';
    default: return 'bg-gray-500';
  }
};

export const getInterestIconColor = (interest: InterestType): string => {
  switch (interest) {
    case InterestType.BUSINESS: return 'text-blue-500';
    case InterestType.HIKING: return 'text-green-600';
    case InterestType.TECH: return 'text-indigo-500';
    case InterestType.DATING: return 'text-pink-500';
    case InterestType.ART: return 'text-purple-500';
    case InterestType.MUSIC: return 'text-orange-500';
    default: return 'text-gray-500';
  }
};