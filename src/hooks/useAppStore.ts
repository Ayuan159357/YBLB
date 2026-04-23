import { useEffect, useMemo, useState } from "react";
import { calculateSignInStreak, createInitialState, formatDateKey } from "../mockData";
import type { AppNotification, AppSettings, AppState, PostTag } from "../types";

const STORAGE_KEY = "yblb-desktop-state-v1";

function createNotification(title: string, content: string): AppNotification {
  const now = new Date();
  return {
    id: `notice-${now.getTime()}-${Math.random().toString(36).slice(2, 7)}`,
    title,
    content,
    time: now.toISOString(),
    read: false,
  };
}

function loadInitialState(): AppState {
  if (typeof window === "undefined") {
    return createInitialState();
  }

  const cached = window.localStorage.getItem(STORAGE_KEY);
  if (!cached) {
    return createInitialState();
  }

  try {
    const parsed = JSON.parse(cached) as AppState;
    return parsed;
  } catch {
    return createInitialState();
  }
}

export function useAppStore() {
  const [state, setState] = useState<AppState>(() => loadInitialState());
  const todayKey = formatDateKey(new Date());

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const hasSignedToday = state.signedDates.includes(todayKey);
  const signInStreak = calculateSignInStreak(state.signedDates, todayKey);
  const activeRole = state.roles.find((role) => role.id === state.activeRoleId) ?? state.roles[0];

  const unreadCount = useMemo(
    () => state.notifications.filter((item) => !item.read).length,
    [state.notifications],
  );

  const completedTaskCount = useMemo(
    () => state.tasks.filter((task) => task.status === "done").length,
    [state.tasks],
  );

  const signInToday = () => {
    setState((prev) => {
      if (prev.signedDates.includes(todayKey)) {
        return prev;
      }

      const nextSignedDates = [...new Set([...prev.signedDates, todayKey])].sort();
      const nextNotifications = [
        createNotification("签到成功", "你已领取今日奖励：星钻 +20。"),
        ...prev.notifications,
      ];

      return {
        ...prev,
        signedDates: nextSignedDates,
        coinBalance: prev.coinBalance + 20,
        notifications: nextNotifications,
      };
    });
  };

  const setActiveRole = (roleId: string) => {
    setState((prev) => ({
      ...prev,
      activeRoleId: roleId,
    }));
  };

  const trainRole = (roleId: string) => {
    setState((prev) => ({
      ...prev,
      roles: prev.roles.map((role) =>
        role.id === roleId
          ? {
              ...role,
              power: role.power + 120,
              level: role.level + 1,
            }
          : role,
      ),
      notifications: [
        createNotification("角色演练完成", "角色战力已提升，记得搭配阵容继续冲分。"),
        ...prev.notifications,
      ],
    }));
  };

  const likePost = (postId: string) => {
    setState((prev) => ({
      ...prev,
      posts: prev.posts.map((post) => {
        if (post.id !== postId) {
          return post;
        }

        const willLike = !post.likedByMe;
        return {
          ...post,
          likedByMe: willLike,
          likes: post.likes + (willLike ? 1 : -1),
        };
      }),
    }));
  };

  const addPost = (title: string, content: string, tag: PostTag) => {
    setState((prev) => {
      const trimmedTitle = title.trim();
      const trimmedContent = content.trim();

      if (!trimmedTitle || !trimmedContent) {
        return prev;
      }

      const now = new Date();
      const nextPost = {
        id: `post-${now.getTime()}`,
        author: prev.profile.nickname,
        title: trimmedTitle,
        content: trimmedContent,
        likes: 0,
        comments: 0,
        likedByMe: false,
        createdAt: now.toISOString(),
        tag,
      };

      return {
        ...prev,
        posts: [nextPost, ...prev.posts],
        notifications: [createNotification("发布成功", "你的帖子已同步到社区动态。"), ...prev.notifications],
      };
    });
  };

  const toggleTask = (taskId: string) => {
    setState((prev) => {
      const task = prev.tasks.find((item) => item.id === taskId);
      if (!task) {
        return prev;
      }

      const nextStatus = task.status === "todo" ? "done" : "todo";
      const coinDelta = nextStatus === "done" ? task.reward : 0;

      const nextNotifications =
        nextStatus === "done"
          ? [
              createNotification("任务完成", `任务「${task.title}」完成，奖励 +${task.reward} 星钻。`),
              ...prev.notifications,
            ]
          : prev.notifications;

      return {
        ...prev,
        tasks: prev.tasks.map((item) =>
          item.id === taskId
            ? {
                ...item,
                status: nextStatus,
              }
            : item,
        ),
        coinBalance: prev.coinBalance + coinDelta,
        notifications: nextNotifications,
      };
    });
  };

  const markNotificationRead = (notificationId: string) => {
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((item) =>
        item.id === notificationId
          ? {
              ...item,
              read: true,
            }
          : item,
      ),
    }));
  };

  const markAllNotificationsRead = () => {
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((item) => ({
        ...item,
        read: true,
      })),
    }));
  };

  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setState((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        [key]: value,
      },
    }));
  };

  return {
    state,
    todayKey,
    hasSignedToday,
    signInStreak,
    activeRole,
    unreadCount,
    completedTaskCount,
    actions: {
      signInToday,
      setActiveRole,
      trainRole,
      likePost,
      addPost,
      toggleTask,
      markNotificationRead,
      markAllNotificationsRead,
      updateSetting,
    },
  };
}
