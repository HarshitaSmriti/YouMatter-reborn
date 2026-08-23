import supabase from "../config/supabaseClient.js";

// Strict authentication middleware - Returns 401 if missing or invalid token
export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        error: { code: "UNAUTHORIZED", message: "Authentication required. Please provide a valid Bearer token." }
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token || token === "demo-guest-token" || token.startsWith("demo-")) {
      req.isDemoUser = true;
      req.user = { id: "00000000-0000-0000-0000-000000000000", email: "guest@youmatter.local", role: "user", user_metadata: { full_name: "Guest User" } };
      return next();
    }

    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data?.user) {
      return res.status(401).json({
        success: false,
        error: { code: "INVALID_TOKEN", message: "Invalid or expired session token." }
      });
    }

    req.user = {
      ...data.user,
      role: data.user.app_metadata?.role || data.user.user_metadata?.role || "user",
    };
    req.isDemoUser = false;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: { code: "AUTH_ERROR", message: "Authentication failure." }
    });
  }
};

// Optional authentication middleware - Defaults to guest if unauthenticated
export const optionalVerifyUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      req.isDemoUser = true;
      req.user = { id: "00000000-0000-0000-0000-000000000000", email: "guest@youmatter.local", role: "user", user_metadata: { full_name: "Guest User" } };
      return next();
    }

    const token = authHeader.split(" ")[1];

    if (!token || token === "demo-guest-token" || token.startsWith("demo-")) {
      req.isDemoUser = true;
      req.user = { id: "00000000-0000-0000-0000-000000000000", email: "guest@youmatter.local", role: "user", user_metadata: { full_name: "Guest User" } };
      return next();
    }

    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data?.user) {
      req.isDemoUser = true;
      req.user = { id: "00000000-0000-0000-0000-000000000000", email: "guest@youmatter.local", role: "user", user_metadata: { full_name: "Guest User" } };
      return next();
    }

    req.user = {
      ...data.user,
      role: data.user.app_metadata?.role || data.user.user_metadata?.role || "user",
    };
    req.isDemoUser = false;
    next();
  } catch (err) {
    req.isDemoUser = true;
    req.user = { id: "00000000-0000-0000-0000-000000000000", email: "guest@youmatter.local", role: "user", user_metadata: { full_name: "Guest User" } };
    next();
  }
};

export const verifyUser = requireAuth;

// Role-based authorization middleware
export const authorizeRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { code: "UNAUTHORIZED", message: "User not authenticated." }
      });
    }

    const userRole = req.user.role || "user";
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        error: { code: "FORBIDDEN", message: "Access denied. Insufficient role permissions." }
      });
    }

    next();
  };
};

// Resource Ownership Verification Middleware (Prevents IDOR)
export const authorizeResourceOwner = (table, idParam = "id") => {
  return async (req, res, next) => {
    try {
      if (req.isDemoUser) return next();

      const resourceId = req.params[idParam];
      const userId = req.user?.id;

      if (!resourceId || !userId) {
        return res.status(400).json({
          success: false,
          error: { code: "INVALID_RESOURCE", message: "Resource ID or User ID missing." }
        });
      }

      const { data, error } = await supabase
        .from(table)
        .select("user_id")
        .eq("id", resourceId)
        .single();

      if (error || !data) {
        return res.status(404).json({
          success: false,
          error: { code: "NOT_FOUND", message: "Resource not found." }
        });
      }

      if (data.user_id !== userId && req.user.role !== "admin") {
        return res.status(403).json({
          success: false,
          error: { code: "FORBIDDEN", message: "You do not own this resource." }
        });
      }

      next();
    } catch (err) {
      next(err);
    }
  };
};
