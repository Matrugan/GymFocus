import { useCallback, useEffect, useState } from "react";

import { reportError } from "../utils/errorHandler";
import {
  createLike,
  deleteLike,
  fetchLikes,
  fetchPostsByUserId,
} from "../services/feedService";

function useFeed({ enabled = true, profileId, userId } = {}) {
  const [posts, setPosts] = useState([]);
  const [likes, setLikes] = useState([]);
  const [loading, setLoading] = useState(Boolean(enabled && profileId));
  const [error, setError] = useState(null);

  const refreshLikes = useCallback(async () => {
    const { data, error: likesError } = await fetchLikes();

    if (likesError) {
      reportError(likesError);
      setError(likesError);
      return [];
    }

    setLikes(data || []);
    return data || [];
  }, []);

  const refetch = useCallback(async () => {
    if (!enabled || !profileId) {
      setPosts([]);
      setLikes([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    const [{ data: postsData, error: postsError }] = await Promise.all([
      fetchPostsByUserId(profileId),
      refreshLikes(),
    ]);

    if (postsError) {
      reportError(postsError);
      setError(postsError);
      setLoading(false);
      return;
    }

    setPosts(postsData || []);
    setLoading(false);
  }, [enabled, profileId, refreshLikes]);

  const toggleLike = useCallback(
    async (postId) => {
      if (!userId) return;

      const existingLike = likes.find(
        (like) => like.post_id === postId && like.user_id === userId,
      );

      const { error: likeError } = existingLike
        ? await deleteLike(existingLike.id)
        : await createLike(postId, userId);

      if (likeError) {
        reportError(likeError);
        setError(likeError);
        return;
      }

      await refreshLikes();
    },
    [likes, refreshLikes, userId],
  );

  useEffect(() => {
    refetch();
  }, [refetch]);

  return {
    error,
    likes,
    loading,
    posts,
    refetch,
    refreshLikes,
    setLikes,
    setPosts,
    toggleLike,
  };
}

export default useFeed;
