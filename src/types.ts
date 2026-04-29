export type NavKey =
  | "console"
  | "checkin"
  | "calendar"
  | "account";

export type EventCategory = "赛事" | "福利" | "社区" | "更新";
export type PostTag = "攻略" | "讨论" | "招募" | "同人" | "公告";
export type TaskStatus = "todo" | "done";
export type RoleRarity = "SSR" | "SR" | "R";

export interface UserProfile {
  nickname: string;
  title: string;
  level: number;
  exp: number;
  expToNextLevel: number;
  avatarSeed: string;
}

export interface Role {
  id: string;
  name: string;
  faction: string;
  level: number;
  power: number;
  rarity: RoleRarity;
  element: "水" | "风" | "光" | "暗";
  story: string;
  tags: string[];
}

export interface CalendarEvent {
  id: string;
  date: string;
  title: string;
  category: EventCategory;
  location: string;
  startAt: string;
  reward: string;
}

export interface CommunityPost {
  id: string;
  author: string;
  title: string;
  content: string;
  likes: number;
  comments: number;
  likedByMe: boolean;
  createdAt: string;
  tag: PostTag;
}

export interface TaskItem {
  id: string;
  title: string;
  description: string;
  reward: number;
  status: TaskStatus;
}

export interface AppNotification {
  id: string;
  title: string;
  content: string;
  time: string;
  read: boolean;
}

export interface AppSettings {
  autoLaunch: boolean;
  pushOnEventStart: boolean;
  syncOnStartup: boolean;
  language: "zh-CN" | "en-US";
  updateChannel: "stable" | "beta";
}

export interface AppState {
  profile: UserProfile;
  activeRoleId: string;
  roles: Role[];
  signedDates: string[];
  coinBalance: number;
  calendarEvents: CalendarEvent[];
  posts: CommunityPost[];
  tasks: TaskItem[];
  notifications: AppNotification[];
  settings: AppSettings;
}
