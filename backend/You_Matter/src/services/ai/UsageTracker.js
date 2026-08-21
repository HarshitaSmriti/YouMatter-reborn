import supabase from "../../config/supabaseClient.js";

/**
 * Server-Side AI Usage Tracking & Guest Quota Manager
 * Tracks request counts and token usage in memory / database without relying on frontend localStorage.
 */
class UsageTracker {
  constructor() {
    this.guestUsageMap = new Map(); // guestId -> { count: number, lastReset: number }
    this.guestMaxRequests = parseInt(process.env.GUEST_MAX_AI_REQUESTS || "15", 10);
    this.cleanInterval = setInterval(() => this.cleanupStaleGuests(), 3600000); // 1hr cleanup
  }

  getGuestIdentifier(req) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer demo-guest-token")) {
      return authHeader.split(" ")[1];
    }
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "guest_ip";
    return `guest_${ip.replace(/[^a-zA-Z0-9_]/g, "")}`;
  }

  checkGuestLimit(req) {
    if (!req.isDemoUser) return { allowed: true, remaining: 999 };

    const guestId = this.getGuestIdentifier(req);
    const now = Date.now();
    const record = this.guestUsageMap.get(guestId) || { count: 0, lastReset: now };

    // Reset daily
    if (now - record.lastReset > 86400000) {
      record.count = 0;
      record.lastReset = now;
    }

    if (record.count >= this.guestMaxRequests) {
      return {
        allowed: false,
        remaining: 0,
        limit: this.guestMaxRequests,
        message: "Guest AI request limit reached for today. Please sign up or log in to continue your mental wellness journey.",
      };
    }

    return {
      allowed: true,
      remaining: this.guestMaxRequests - record.count,
      limit: this.guestMaxRequests,
    };
  }

  recordGuestUsage(req) {
    if (!req.isDemoUser) return;
    const guestId = this.getGuestIdentifier(req);
    const now = Date.now();
    const record = this.guestUsageMap.get(guestId) || { count: 0, lastReset: now };
    record.count += 1;
    this.guestUsageMap.set(guestId, record);
  }

  async trackUserUsage(userId, inputTokens = 0, outputTokens = 0) {
    if (!userId || userId === "demo-user-123") return;

    try {
      // Optional async DB tracking for registered users
      const totalTokens = inputTokens + outputTokens;
      await supabase.from("ai_usage").insert([
        {
          user_id: userId,
          input_tokens: inputTokens,
          output_tokens: outputTokens,
          total_tokens: totalTokens,
          created_at: new Date().toISOString(),
        },
      ]).catch(() => null); // Silent non-blocking fallback if table does not exist
    } catch (e) {
      // Non-blocking catch
    }
  }

  cleanupStaleGuests() {
    const now = Date.now();
    for (const [guestId, record] of this.guestUsageMap.entries()) {
      if (now - record.lastReset > 86400000) {
        this.guestUsageMap.delete(guestId);
      }
    }
  }
}

export default new UsageTracker();
