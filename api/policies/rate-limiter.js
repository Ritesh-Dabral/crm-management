class TokenBucket {
  constructor(key, capacity, refillInterval) {
    this.key = key;                 // Redis key
    this.capacity = capacity;       // Max tokens (e.g., 10,000)
    this.refillInterval = refillInterval; // Refill interval (60,000 ms = 1 min)
  }

  async requestToken(tokens = 1) {
    const client = redisClient;
    if (!client.isOpen) {
      await client.connect(); // Ensure Redis client is connected
    }

    const now = Date.now();
    const luaScript = `
        local key, cap, interval, now, req = KEYS[1], tonumber(ARGV[1]), tonumber(ARGV[2]), tonumber(ARGV[3]), tonumber(ARGV[4])
        local bucket = redis.call("HMGET", key, "tokens", "lastRefill")
        local tokens = tonumber(bucket[1]) or cap
        local lastRefill = tonumber(bucket[2]) or now

        if now - lastRefill >= interval then
            tokens = cap
            lastRefill = now
        end

        if tokens >= req then
            tokens = tokens - req
            redis.call("HMSET", key, "tokens", tokens, "lastRefill", lastRefill)
            redis.call("EXPIRE", key, math.ceil(interval / 1000))
            return 1
        end
        return 0
    `;

    try {
      // KEYS and ARGV must be passed as separate arrays
      const result = await client.eval(
        luaScript,
        {
          keys: [this.key],
          arguments: [
            String(this.capacity),     // Convert numbers to strings for Redis
            String(this.refillInterval),
            String(now),
            String(tokens)
          ]
        }
      );

      return result === 1;
    } catch (error) {
      console.error('Rate Limiter Error:', {
        error: error.message,
        key: this.key,
        capacity: this.capacity,
        refillInterval: this.refillInterval
      });
      // In case of Redis errors, default to allowing the request
      // You might want to change this based on your requirements
      return true;
    }
  }
}

module.exports = async function isAuth(req, res, proceed) {
  try {
    const accountId = req.body.accountId;
    const bucket = new TokenBucket(`${accountId}:rate_limit`, 10, 60000);

    const success = await bucket.requestToken(_.get(req.body, 'file.meta.rows', 0));
    if (!success) {
      return res.status(429).json(res.generalResponse({ message: 'Too many requests. Try again later.' }));
    }

    return proceed();
  } catch (error) {
    return res.status(500).json(res.generalResponse({ message: error.message }));
  }
};
