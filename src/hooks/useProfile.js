import { useCallback, useEffect, useState } from "react";

import { reportError } from "../utils/errorHandler";
import {
  fetchProfileById,
  fetchProfileByUsername,
} from "../services/profileService";

function useProfile({ enabled = true, userId, username } = {}) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(Boolean(enabled && (userId || username)));
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    if (!enabled || (!userId && !username)) {
      setProfile(null);
      setLoading(false);
      setError(null);
      return null;
    }

    setLoading(true);
    setError(null);

    const result = username
      ? await fetchProfileByUsername(username)
      : await fetchProfileById(userId);

    if (result.error) {
      reportError(result.error);
      setError(result.error);
      setProfile(null);
      setLoading(false);
      return null;
    }

    setProfile(result.data);
    setLoading(false);
    return result.data;
  }, [enabled, userId, username]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return {
    error,
    loading,
    profile,
    refetch,
    setProfile,
  };
}

export default useProfile;
