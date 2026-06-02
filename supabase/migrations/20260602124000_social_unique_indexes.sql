-- Prevent duplicate social records caused by double clicks or concurrent tabs.

do $$
begin
  if to_regclass('public.likes') is not null then
    with duplicate_likes as (
      select
        id,
        row_number() over (
          partition by post_id, user_id
          order by id desc
        ) as duplicate_rank
      from public.likes
    )
    delete from public.likes
    using duplicate_likes
    where public.likes.id = duplicate_likes.id
      and duplicate_likes.duplicate_rank > 1;

    create unique index if not exists likes_post_user_unique_idx
      on public.likes (post_id, user_id);
  end if;
end;
$$;

do $$
begin
  if to_regclass('public.followers') is not null then
    with duplicate_followers as (
      select
        id,
        row_number() over (
          partition by follower_id, following_id
          order by id desc
        ) as duplicate_rank
      from public.followers
    )
    delete from public.followers
    using duplicate_followers
    where public.followers.id = duplicate_followers.id
      and duplicate_followers.duplicate_rank > 1;

    create unique index if not exists followers_pair_unique_idx
      on public.followers (follower_id, following_id);
  end if;
end;
$$;

do $$
begin
  if to_regclass('public.user_challenges') is not null then
    with duplicate_user_challenges as (
      select
        id,
        row_number() over (
          partition by user_id, challenge_id
          order by id desc
        ) as duplicate_rank
      from public.user_challenges
    )
    delete from public.user_challenges
    using duplicate_user_challenges
    where public.user_challenges.id = duplicate_user_challenges.id
      and duplicate_user_challenges.duplicate_rank > 1;

    create unique index if not exists user_challenges_user_challenge_unique_idx
      on public.user_challenges (user_id, challenge_id);
  end if;
end;
$$;

do $$
begin
  if to_regclass('public.achievements') is not null then
    with duplicate_achievements as (
      select
        id,
        row_number() over (
          partition by user_id, badge
          order by id desc
        ) as duplicate_rank
      from public.achievements
    )
    delete from public.achievements
    using duplicate_achievements
    where public.achievements.id = duplicate_achievements.id
      and duplicate_achievements.duplicate_rank > 1;

    create unique index if not exists achievements_user_badge_unique_idx
      on public.achievements (user_id, badge);
  end if;
end;
$$;
