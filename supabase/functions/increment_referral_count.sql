
-- Function to increment referral count and add coins to a user
CREATE OR REPLACE FUNCTION increment_referral_count(user_id UUID, coin_reward INTEGER)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update the referrer's stats (add coins and increment referral count)
  UPDATE public.users
  SET 
    referral_count = referral_count + 1,
    coins = coins + coin_reward
  WHERE id = user_id;
END;
$$;
