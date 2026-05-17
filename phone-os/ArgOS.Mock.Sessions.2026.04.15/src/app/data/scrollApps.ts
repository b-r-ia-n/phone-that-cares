import type { IconType } from 'react-icons';
import {
  SiInstagram,
  SiX,
  SiYoutube,
  SiReddit,
  SiSubstack,
  SiFacebook,
  SiThreads,
  SiPinterest,
  SiSnapchat,
  SiDiscord,
  SiBluesky,
  SiTiktok,
} from 'react-icons/si';
import type { ModeId } from '../lib/modes';

export interface ScrollApp {
  id: string;
  name: string;
  icon: IconType;
  color: string;
  availableModes: ModeId[];
  defaultMode: ModeId;
  defaultRampMinutes: number;
}

export const allScrollApps: ScrollApp[] = [
  {
    id: 'instagram',
    name: 'Instagram',
    icon: SiInstagram,
    color: '#E4405F',
    availableModes: ['grayscale', 'feed-blur', 'break-cards', 'passive-tracking', 'off'],
    defaultMode: 'grayscale',
    defaultRampMinutes: 30,
  },
  {
    id: 'x',
    name: 'X',
    icon: SiX,
    color: '#000000',
    availableModes: ['tweet-spacing', 'grayscale', 'feed-blur', 'font-cycling', 'off'],
    defaultMode: 'tweet-spacing',
    defaultRampMinutes: 15,
  },
  {
    id: 'youtube',
    name: 'YouTube',
    icon: SiYoutube,
    color: '#FF0000',
    availableModes: ['grayscale', 'feed-blur', 'break-cards', 'passive-tracking', 'off'],
    defaultMode: 'off',
    defaultRampMinutes: 45,
  },
  {
    id: 'reddit',
    name: 'Reddit',
    icon: SiReddit,
    color: '#FF4500',
    availableModes: ['font-cycling', 'grayscale', 'break-cards', 'feed-blur', 'off'],
    defaultMode: 'off',
    defaultRampMinutes: 20,
  },
  {
    id: 'substack',
    name: 'Substack',
    icon: SiSubstack,
    color: '#FF6719',
    availableModes: ['font-cycling', 'feed-blur', 'break-cards', 'passive-tracking', 'off'],
    defaultMode: 'off',
    defaultRampMinutes: 30,
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: SiFacebook,
    color: '#1877F2',
    availableModes: ['grayscale', 'feed-blur', 'break-cards', 'passive-tracking', 'off'],
    defaultMode: 'off',
    defaultRampMinutes: 30,
  },
  {
    id: 'threads',
    name: 'Threads',
    icon: SiThreads,
    color: '#000000',
    availableModes: ['tweet-spacing', 'grayscale', 'feed-blur', 'font-cycling', 'off'],
    defaultMode: 'off',
    defaultRampMinutes: 20,
  },
  {
    id: 'pinterest',
    name: 'Pinterest',
    icon: SiPinterest,
    color: '#E60023',
    availableModes: ['grayscale', 'feed-blur', 'break-cards', 'passive-tracking', 'off'],
    defaultMode: 'off',
    defaultRampMinutes: 30,
  },
  {
    id: 'snapchat',
    name: 'Snapchat',
    icon: SiSnapchat,
    color: '#FFFC00',
    availableModes: ['grayscale', 'feed-blur', 'break-cards', 'passive-tracking', 'off'],
    defaultMode: 'off',
    defaultRampMinutes: 20,
  },
  {
    id: 'discord',
    name: 'Discord',
    icon: SiDiscord,
    color: '#5865F2',
    availableModes: ['grayscale', 'feed-blur', 'break-cards', 'font-cycling', 'off'],
    defaultMode: 'off',
    defaultRampMinutes: 30,
  },
  {
    id: 'bluesky',
    name: 'Bluesky',
    icon: SiBluesky,
    color: '#0085FF',
    availableModes: ['tweet-spacing', 'grayscale', 'feed-blur', 'font-cycling', 'off'],
    defaultMode: 'off',
    defaultRampMinutes: 20,
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    icon: SiTiktok,
    color: '#000000',
    availableModes: ['grayscale', 'feed-blur', 'break-cards', 'passive-tracking', 'off'],
    defaultMode: 'off',
    defaultRampMinutes: 20,
  },
];

export const defaultActiveIds = ['instagram', 'x', 'youtube', 'reddit', 'substack'];

export function getScrollApp(id: string | undefined): ScrollApp | undefined {
  return allScrollApps.find((a) => a.id === id);
}
