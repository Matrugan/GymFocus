import { useCallback, useEffect, useState } from "react";

import {
  fetchFollow,
  fetchFollowers,
  fetchFollowing,
  followProfile,
  unfollowProfile,
} from "../services/followService";
import { createNotification } from "../utils/notificationSystem";
import { reportError } from "../utils/errorHandler";

function useFollow({ enabled = true, profileId, userId } = {}) {
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(Boolean(enabled && profileId));
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    if (!enabled || !profileId) {
      setFollowersCount(0);
      setFollowingCount(0);
      setIsFollowing(false);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    const [
      { data: followers, error: followersError },
      { data: following, error: followingError },
      { data: existingFollow, error: existingFollowError },
    ] = await Promise.all([
      fetchFollowers(profileId),
      fetchFollowing(profileId),
      userId
        ? fetchFollow(userId, profileId)
        : Promise.resolve({ data: null, error: null }),
    ]);

    const firstError = followersError || followingError || existingFollowError;

    if (firstError) {
      reportError(firstError);
      setError(firstError);
      setLoading(false);
      return;
    }

    setFollowersCount(followers?.length || 0);
    setFollowingCount(following?.length || 0);
    setIsFollowing(Boolean(existingFollow));
    setLoading(false);
  }, [enabled, profileId, userId]);

  const toggleFollow = useCallback(async () => {
    if (!userId || !profileId) return;

    const { error: followError } = isFollowing
      ? await unfollowProfile(userId, profileId)
      : await followProfile(userId, profileId);

    if (followError) {
      reportError(followError);
      setError(followError);
      return;
    }

    if (!isFollowing) {
      await createNotification({
        userId: profileId,
        actorId: userId,
        type: "follow",
        message: "started following you.",
      });
    }

    await refetch();
  }, [isFollowing, profileId, refetch, userId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return {
    error,
    followersCount,
    followingCount,
    isFollowing,
    loading,
    refetch,
    toggleFollow,
  };
}

export default useFollow;
