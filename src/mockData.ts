import type { AppState } from "./types";

const WEEK_DAY_NAMES = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];

export function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function addDays(date: Date, offset: number): Date {
  const cloned = new Date(date);
  cloned.setDate(cloned.getDate() + offset);
  return cloned;
}

function parseDateKey(dateKey: string): Date {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function createNotificationId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function formatDisplayDate(dateKey: string): string {
  const date = parseDateKey(dateKey);
  const label = WEEK_DAY_NAMES[date.getDay()];
  return `${date.getMonth() + 1}月${date.getDate()}日 ${label}`;
}

export function calculateSignInStreak(signedDates: string[], todayKey: string): number {
  const signedSet = new Set(signedDates);
  if (!signedSet.has(todayKey)) {
    return 0;
  }

  let streak = 0;
  let cursor = parseDateKey(todayKey);

  while (signedSet.has(formatDateKey(cursor))) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }

  return streak;
}

export function createInitialState(): AppState {
  const today = new Date();
  const dateOffset = (offset: number) => formatDateKey(addDays(today, offset));

  return {
    profile: {
      nickname: "晨星旅人",
      title: "蓝海远征队",
      level: 36,
      exp: 1780,
      expToNextLevel: 2200,
      avatarSeed: "CXLR",
    },
    activeRoleId: "role-hailan",
    roles: [
      {
        id: "role-hailan",
        name: "海岚",
        faction: "远洋联邦",
        level: 42,
        power: 12540,
        rarity: "SSR",
        element: "水",
        story: "擅长群体控制与爆发连携，是速推活动的核心角色。",
        tags: ["控制", "群伤", "速刷"],
      },
      {
        id: "role-lingfeng",
        name: "凌风",
        faction: "穹塔学院",
        level: 39,
        power: 11390,
        rarity: "SR",
        element: "风",
        story: "机动性优秀，适合挑战竞速与高机动副本。",
        tags: ["机动", "追击", "连段"],
      },
      {
        id: "role-yaoguang",
        name: "曜光",
        faction: "曙光议会",
        level: 40,
        power: 11730,
        rarity: "SSR",
        element: "光",
        story: "队伍增益能力强，适合长期战与公会协作玩法。",
        tags: ["辅助", "增益", "协同"],
      },
    ],
    signedDates: [dateOffset(-4), dateOffset(-3), dateOffset(-2), dateOffset(-1)],
    coinBalance: 1680,
    calendarEvents: [
      {
        id: "evt-1",
        date: dateOffset(0),
        title: "双倍积分冲刺",
        category: "赛事",
        location: "竞技大厅",
        startAt: "19:30",
        reward: "限定头像框",
      },
      {
        id: "evt-2",
        date: dateOffset(1),
        title: "春潮签到补给",
        category: "福利",
        location: "补给中心",
        startAt: "10:00",
        reward: "星钻*120",
      },
      {
        id: "evt-3",
        date: dateOffset(2),
        title: "创作社区接力赛",
        category: "社区",
        location: "社区广场",
        startAt: "20:00",
        reward: "限定贴纸",
      },
      {
        id: "evt-4",
        date: dateOffset(3),
        title: "1.7 版本前瞻直播",
        category: "更新",
        location: "官方直播间",
        startAt: "20:30",
        reward: "兑换码礼包",
      },
      {
        id: "evt-5",
        date: dateOffset(5),
        title: "公会集结挑战",
        category: "赛事",
        location: "公会战区",
        startAt: "21:00",
        reward: "公会贡献加成",
      },
      {
        id: "evt-6",
        date: dateOffset(7),
        title: "周末整点补给",
        category: "福利",
        location: "活动页",
        startAt: "12:00",
        reward: "体力药剂",
      },
    ],
    posts: [
      {
        id: "post-1",
        author: "潮汐指挥官",
        title: "海岚速刷队配置分享",
        content: "主C海岚 + 副C曜光 + 辅助夜琴，活动副本 40 秒稳定通关。",
        likes: 73,
        comments: 14,
        likedByMe: false,
        createdAt: new Date(today.getTime() - 1000 * 60 * 50).toISOString(),
        tag: "攻略",
      },
      {
        id: "post-2",
        author: "暮色学者",
        title: "新版本剧情讨论串",
        content: "这次主线伏笔很足，大家觉得下一章会不会回到旧港线？",
        likes: 42,
        comments: 31,
        likedByMe: true,
        createdAt: new Date(today.getTime() - 1000 * 60 * 60 * 5).toISOString(),
        tag: "讨论",
      },
      {
        id: "post-3",
        author: "星火公会",
        title: "周末公会战招募",
        content: "目标冲榜前 200，需要两名高练度辅助角色，欢迎私信。",
        likes: 28,
        comments: 8,
        likedByMe: false,
        createdAt: new Date(today.getTime() - 1000 * 60 * 60 * 20).toISOString(),
        tag: "招募",
      },
    ],
    tasks: [
      {
        id: "task-1",
        title: "完成每日签到",
        description: "前往签到页完成今日签到。",
        reward: 20,
        status: "todo",
      },
      {
        id: "task-2",
        title: "浏览活动日历",
        description: "查看至少 1 条当周活动。",
        reward: 12,
        status: "done",
      },
      {
        id: "task-3",
        title: "发布一条社区帖子",
        description: "在社区页发布你的心得或提问。",
        reward: 18,
        status: "todo",
      },
      {
        id: "task-4",
        title: "完成角色演练",
        description: "在我的角色页点击一次演练。",
        reward: 15,
        status: "todo",
      },
    ],
    notifications: [
      {
        id: createNotificationId("notice"),
        title: "赛事提醒",
        content: "今晚 19:30 双倍积分冲刺即将开始。",
        time: new Date(today.getTime() - 1000 * 60 * 10).toISOString(),
        read: false,
      },
      {
        id: createNotificationId("notice"),
        title: "版本资讯",
        content: "1.7 版本前瞻直播将在 3 天后开启。",
        time: new Date(today.getTime() - 1000 * 60 * 60 * 3).toISOString(),
        read: false,
      },
      {
        id: createNotificationId("notice"),
        title: "社区互动",
        content: "你关注的话题新增 5 条讨论。",
        time: new Date(today.getTime() - 1000 * 60 * 60 * 18).toISOString(),
        read: true,
      },
    ],
    settings: {
      autoLaunch: false,
      pushOnEventStart: true,
      syncOnStartup: true,
      language: "zh-CN",
      updateChannel: "stable",
    },
  };
}
