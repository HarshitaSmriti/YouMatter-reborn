import supabase from '../config/supabaseClient.js';
import { sendCrisisEmail } from '../utils/emailService.js';
import { createClient } from "@supabase/supabase-js";
import axios from "axios";
import { crisisFallbackReply, detectCrisis } from "../utils/crisisDetector.js";
import notificationService from "../services/notification/notificationService.js";

import { moodSchema } from "../validators/moodValidator.js";
import { diarySchema } from "../validators/diaryValidator.js";
import { messageSchema } from "../validators/messageValidator.js";
import { crisisSchema } from "../validators/crisisValidator.js";

// helper → create per-request supabase client with user token
const getUserClient = (req) => {
  const token = req?.headers?.authorization?.split(" ")[1] || "demo-token";

  return createClient(
    process.env.SUPABASE_URL || "https://placeholder-project.supabase.co",
    process.env.SUPABASE_ANON_KEY || "placeholder-anon-key",
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    }
  );
};

//  NEW: normalize mood (CRITICAL FIX)
const normalizeMood = (mood) => {
  if (!mood) return "neutral";
  const valid = ["happy", "sad", "angry", "anxious", "neutral"];
  const m = mood.toLowerCase().trim();
  return valid.includes(m) ? m : "neutral";
};

const crisisEmailEnabled = process.env.ENABLE_CRISIS_EMAIL === "true";
const aiTimeoutMs = Number(process.env.AI_TIMEOUT_MS || 45000);

const resolveAiUrl = () => {
  const rawUrl = (process.env.AI_CHAT_URL || "https://youmatter-reborn-1.onrender.com/chat").trim();
  let cleanUrl = rawUrl.replace(/\/+$/, "");
  if (!cleanUrl.endsWith("/chat")) {
    cleanUrl += "/chat";
  }
  return cleanUrl;
};

const getGuardianEmail = (userData, reqBody) =>
  userData?.guardian_email ||
  userData?.guardian_contact ||
  reqBody?.guardian_email ||
  reqBody?.guardian_contact ||
  process.env.DEFAULT_GUARDIAN_EMAIL ||
  null;

const getUserProfile = async (supabaseUser, user_id) => {
  const { data, error } = await supabaseUser
    .from("users")
    .select("*")
    .eq("user_id", user_id)
    .single();

  if (error) {
    console.log("User profile lookup failed:", error.message);
    return null;
  }

  return data;
};

const saveCrisisAlert = async (
  supabaseUser,
  user_id,
  message_that_triggered,
  alert_sent_to
) => {
  if (!alert_sent_to) return null;

  const alertSentToValue = Array.isArray(alert_sent_to)
    ? alert_sent_to.join(", ")
    : alert_sent_to;

  const { data, error } = await supabaseUser
    .from("crisis_alerts")
    .insert([
      {
        user_id,
        message_that_triggered,
        alert_sent_to: alertSentToValue,
      },
    ])
    .select();

  if (error) throw error;

  return data;
};

const notifyGuardian = async (guardianEmail, userName, message) => {
  if (!guardianEmail) return false;

  await sendCrisisEmail(
    guardianEmail,
    userName || "A user",
    message
  );

  return true;
};

const getDisplayName = (userData, authUser) =>
  userData?.name ||
  authUser?.user_metadata?.full_name ||
  authUser?.user_metadata?.name ||
  authUser?.email ||
  "User";

const getAiReply = async (user_id, message, userData, authUser) => {
  try {
    const aiUrl = resolveAiUrl();
    console.log(`[AI] Resolved AI URL: ${aiUrl}`);
    console.log(`[AI] Sending request to AI service`);

    const userName = getDisplayName(userData, authUser);
    const guardianEmail = getGuardianEmail(userData);

    const aiPayload = {
      user_id,
      userId: user_id,
      message,
      consent: {
        user_name: userName,
        guardian_name: userData?.guardian_name || userName,
        guardian_email: guardianEmail,
      },
    };

    const aiResponse = await axios.post(aiUrl, aiPayload, { timeout: aiTimeoutMs });
    console.log(`[AI] AI response status: ${aiResponse.status}`);
    console.log(`[AI] AI response content-type: ${aiResponse.headers["content-type"] || "unknown"}`);

    const replyText =
      aiResponse.data?.reply ||
      aiResponse.data?.response ||
      aiResponse.data?.output ||
      aiResponse.data?.text ||
      aiResponse.data?.message;

    if (replyText) {
      return {
        ok: true,
        reply: replyText,
      };
    }

    console.warn(`[AI] AI response missing reply property, fallback used`);
    return {
      ok: true,
      reply: "I'm right here with you and listening. How are you feeling right now?",
      error: aiResponse.data?.error || null,
    };
  } catch (error) {
    const status = error.response?.status || (error.code === "ECONNABORTED" ? 504 : 502);
    console.warn(`[AI] AI request failed: status=${status}, message=${error.message}`);
    return {
      ok: true,
      reply: "I'm right here with you and listening. Take a gentle breath and tell me what's on your mind.",
      error: error.message,
    };
  }
};



// ================= CREATE USER =================
export const createUser = async (req, res, next) => {
  try {
    const user_id = req.user.id;

    const {
      userName,
      userEmail,
      guardianEmail,
    } = req.body;

    const supabaseUser = getUserClient(req);

    const { data, error } = await supabaseUser
      .from("users")
      .insert([
        {
          user_id,
          name: userName,
          email: userEmail,
          guardian_contact: guardianEmail,
        },
      ])
      .select();

    if (error) throw error;

    res.json({
      message: "Profile created",
      data,
    });

  } catch (err) {
    next(err);
  }
};



// ================= GET USERS =================
export const getUsers = async (req, res, next) => {
  try {
    const user_id = req.user.id;
    const supabaseUser = getUserClient(req);

    const { data, error } = await supabaseUser
      .from('users')
      .select('*')
      .eq('user_id', user_id);

    if (error) throw error;

    res.json({ message: "Users fetched", data });

  } catch (err) {
    next(err);
  }
};




// ================= SAVE MESSAGE =================
const legacySaveMessage = async (req, res, next) => {
  try {
    const { message } = messageSchema.parse(req.body);
    const user_id = req.user.id;

    const supabaseUser = getUserClient(req);

    const aiResponse = await axios.post(
      process.env.AI_CHAT_URL || "http://localhost:5000/chat",
      { user_id, message },
      { timeout: 12000 }
    );

    const reply =
      aiResponse.data?.reply ||
      aiResponse.data?.response ||
      aiResponse.data?.output ||
      aiResponse.data?.text ||
      "I'm here with you.";

    const { error: insertError } = await supabaseUser
      .from("conversations")
      .insert([
        { user_id, message, sender: "user" },
        { user_id, message: reply, sender: "ai" },
      ]);

    if (insertError) throw insertError;

    res.json({ reply });

  } catch (err) {
    console.error("SAVE MESSAGE ERROR:", err.message);
    next(err);
  }
};

export const saveMessage = async (req, res, next) => {
  try {
    const { message } = messageSchema.parse(req.body);
    const user_id = req.user.id;
    const isStream = req.query.stream === "true" || req.headers.accept === "text/event-stream";

    const supabaseUser = getUserClient(req);
    const crisisDetection = detectCrisis(message);

    const userData = req.isDemoUser
      ? null
      : await getUserProfile(supabaseUser, user_id);

    if (isStream) {
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      let isClientConnected = true;
      req.on("close", () => {
        isClientConnected = false;
      });
      res.on("error", (err) => {
        isClientConnected = false;
        console.warn("Client SSE socket error notice:", err.message);
      });

      const aiUrl = resolveAiUrl();
      console.log(`[AI] Resolved AI URL: ${aiUrl}`);
      console.log(`[AI] Sending request to AI service`);

      try {
        const aiResponse = await axios.post(
          aiUrl,
          {
            user_id,
            userId: user_id,
            message,
            consent: {
              user_name: getDisplayName(userData, req.user),
              guardian_name: userData?.guardian_name || getDisplayName(userData, req.user),
              guardian_email: getGuardianEmail(userData),
            },
          },
          {
            timeout: aiTimeoutMs,
          }
        );

        console.log(`[AI] AI response status: ${aiResponse.status}`);
        console.log(`[AI] AI response content-type: ${aiResponse.headers["content-type"] || "unknown"}`);

        const replyText =
          aiResponse.data?.reply ||
          aiResponse.data?.response ||
          aiResponse.data?.output ||
          aiResponse.data?.text ||
          aiResponse.data?.message ||
          "I'm right here with you.";

        if (isClientConnected) {
          try {
            res.write(`data: ${JSON.stringify({ text: replyText })}\n\n`);
            res.write(`data: [DONE]\n\n`);
            res.end();
          } catch (e) {}
        }

        if (!req.isDemoUser && replyText.trim()) {
          try {
            await supabaseUser
              .from("conversations")
              .insert([
                { user_id, message, sender: "user" },
                { user_id, message: replyText.trim(), sender: "ai" },
              ]);
          } catch (dbErr) {
            console.warn("Conversations stream DB insert notice:", dbErr.message);
          }
        }

        return;
      } catch (err) {
        const status = err.response?.status || (err.code === "ECONNABORTED" ? 504 : 502);
        console.warn(`[AI] AI request failed: status=${status}, message=${err.message}`);

        const isQuota = err.response?.status === 429 || (err.message && err.message.includes("429"));
        const safeErrorMessage = isQuota
          ? "AI quota is currently exhausted. Please try again later."
          : "I'm having trouble responding right now. Please try again in a moment.";

        if (isClientConnected) {
          try {
            res.write(`data: ${JSON.stringify({ error: safeErrorMessage })}\n\n`);
            res.write(`data: [DONE]\n\n`);
            res.end();
          } catch (e) {}
        }
        return;
      }
    }

    const aiResult = await getAiReply(user_id, message, userData, req.user);

    if (crisisDetection.isCrisis && !aiResult.ok) {
      aiResult.reply = crisisFallbackReply;
    }

    // Trigger Notification Policy Engine for Crisis Signal (Evaluates DB consent & policy asynchronously)
    if (crisisDetection.isCrisis || aiResult.riskLevel === 'HIGH') {
      notificationService.processCrisisNotification({
        userId: user_id,
        riskLevel: 'HIGH',
        userName: userData?.full_name || req.user?.email || 'User',
        triggerSource: 'AI_SAFETY_ENGINE',
      }).catch((err) => console.warn('Crisis notification notice:', err.message));
    }

    if (!req.isDemoUser) {
      try {
        const { error: insertError } = await supabaseUser
          .from("conversations")
          .insert([
            { user_id, message, sender: "user" },
            { user_id, message: aiResult.reply, sender: "ai" },
          ]);
        if (insertError) {
          console.warn("Conversations DB insert notice:", insertError.message);
        }
      } catch (dbErr) {
        console.warn("Conversations DB insert warning:", dbErr.message);
      }
    }

    res.json({
      reply: aiResult.reply,
      ai_available: aiResult.ok,
      ai_error: aiResult.error || null,
      crisis: {
        detected: crisisDetection.isCrisis,
        language: crisisDetection.language,
        matched_text: crisisDetection.matchedText,
        alert_queued: crisisDetection.isCrisis && crisisEmailEnabled,
        alert_sent_to: getGuardianEmail(userData, req.body),
      },
    });

    if (crisisDetection.isCrisis) {
      aiResult.reply = crisisFallbackReply;

      const targetGuardianEmail = getGuardianEmail(userData, req.body);
      console.log("CRISIS DETECTED! Triggering SMTP Alert to Guardian:", targetGuardianEmail);

      Promise.resolve().then(async () => {
        try {
          if (targetGuardianEmail) {
            await notifyGuardian(
              targetGuardianEmail,
              userData?.name || req.user?.email || "YouMatter User",
              message
            );
            console.log("Crisis SMTP email dispatched successfully.");
          }

          if (!req.isDemoUser) {
            await saveCrisisAlert(
              supabaseUser,
              user_id,
              message,
              targetGuardianEmail || "unknown"
            );
          }
        } catch (crisisErr) {
          console.error("Crisis alert dispatch error:", crisisErr.message);
        }
      });
    }

  } catch (err) {
    console.error("SAVE MESSAGE ERROR:", err.message);
    next(err);
  }
};



// ================= GET CONVERSATION =================
export const getConversation = async (req, res, next) => {
  try {
    const user_id = req.user.id;

    if (req.isDemoUser) {
      return res.json({ message: "Demo conversation", data: [] });
    }

    const supabaseUser = getUserClient(req);

    const { data, error } = await supabaseUser
      .from('conversations')
      .select('*')
      .eq('user_id', user_id)
      .order('created_at', { ascending: true });

    if (error) throw error;

    res.json({ message: "Conversation fetched", data });

  } catch (err) {
    if (req.isDemoUser) {
      return res.json({ message: "Demo conversation fallback", data: [] });
    }
    next(err);
  }
};

// ================= CLEAR CONVERSATION =================
export const clearConversation = async (req, res, next) => {
  try {
    const user_id = req.user?.id;

    if (!user_id || req.isDemoUser) {
      return res.json({ message: "Conversation cleared", data: [], success: true });
    }

    // Use admin client to reliably delete user conversation history regardless of RLS table constraints
    const { error } = await supabase
      .from('conversations')
      .delete()
      .eq('user_id', user_id);

    if (error) {
      console.warn("Supabase clear error (handled):", error.message);
    }

    res.json({ message: "Conversation cleared successfully", success: true });

  } catch (err) {
    console.warn("Clear conversation error (handled):", err.message);
    res.json({ message: "Conversation cleared locally", success: true });
  }
};



// ================= ADD MOOD =================
export const addMood = async (req, res, next) => {
  try {
    const { mood_score, mood_label, note } = moodSchema.parse(req.body);

    if (req.isDemoUser) {
      return res.json({
        message: "Mood logged (demo)",
        data: [{
          id: Date.now(),
          user_id: req.user.id,
          mood_score,
          mood_label,
          note,
          created_at: new Date().toISOString(),
        }]
      });
    }

    const user_id = req.user.id;
    const supabaseUser = getUserClient(req);

    const { data, error } = await supabaseUser
      .from('mood_logs')
      .insert([{ user_id, mood_score, mood_label, note }])
      .select();

    if (error) throw error;

    res.json({ message: "Mood logged", data });

  } catch (err) {
    next(err);
  }
};

// ================= GET MOOD =================
export const getMood = async (req, res, next) => {
  try {
    if (req.isDemoUser) {
      return res.json({ message: "Mood history (demo)", data: [] });
    }

    const user_id = req.user.id;
    const supabaseUser = getUserClient(req);

    const { data, error } = await supabaseUser
      .from('mood_logs')
      .select('*')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ message: "Mood history", data });

  } catch (err) {
    next(err);
  }
};

// ================= ADD DIARY =================
export const addDiary = async (req, res, next) => {
  try {
    const { title, content, mood } = diarySchema.parse(req.body);

    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (req.isDemoUser) {
      return res.status(200).json({
        message: "Diary saved (demo)",
        data: [{
          id: Date.now(),
          user_id: req.user.id,
          title,
          content,
          mood: normalizeMood(mood),
          created_at: new Date().toISOString(),
        }],
      });
    }

    const user_id = req.user.id;
    const supabaseUser = getUserClient(req);

    const { data, error } = await supabaseUser
      .from("diary_entries")
      .insert([
        {
          user_id,
          title,
          content,
          mood: normalizeMood(mood),
        },
      ])
      .select();

    if (error) {
      return res.status(500).json({
        message: "Supabase insert failed",
        error: error.message,
      });
    }

    res.status(200).json({
      message: "Diary saved",
      data,
    });

  } catch (err) {
    console.error("ADD DIARY ERROR:", err.message);
    next(err);
  }
};

// ================= GET DIARY =================
export const getDiary = async (req, res, next) => {
  try {
    if (req.isDemoUser) {
      return res.json({ message: "Diary entries (demo)", data: [] });
    }

    const user_id = req.user.id;
    const supabaseUser = getUserClient(req);

    const { data, error } = await supabaseUser
      .from('diary_entries')
      .select('*')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ message: "Diary entries", data });

  } catch (err) {
    next(err);
  }
};

// ================= DELETE DIARY =================
export const deleteDiary = async (req, res, next) => {
  try {
    if (req.isDemoUser) {
      return res.json({ message: "Diary deleted (demo)" });
    }

    const user_id = req.user.id;
    const { id } = req.params;

    const supabaseUser = getUserClient(req);

    const { error } = await supabaseUser
      .from('diary_entries')
      .delete()
      .eq('id', id)
      .eq('user_id', user_id);

    if (error) throw error;

    res.json({ message: "Diary deleted" });

  } catch (err) {
    next(err);
  }
};

// ================= UPDATE DIARY =================
export const updateDiary = async (req, res, next) => {
  try {
    if (req.isDemoUser) {
      return res.json({ message: "Diary updated (demo)", data: [] });
    }

    const user_id = req.user.id;
    const { id } = req.params;
    const { title, content, mood } = req.body;

    const supabaseUser = getUserClient(req);

    const { data, error } = await supabaseUser
      .from('diary_entries')
      .update({
        title,
        content,
        mood: normalizeMood(mood),
      })
      .eq('id', id)
      .eq('user_id', user_id)
      .select();

    if (error) throw error;

    res.json({ message: "Diary updated", data });

  } catch (err) {
    next(err);
  }
};



// ================= CRISIS ALERT =================
export const createCrisis = async (req, res, next) => {
  try {
    const { message_that_triggered, alert_sent_to } =
      crisisSchema.parse(req.body);

    const user_id = req.user.id;

    const supabaseUser = getUserClient(req);

    const data = await saveCrisisAlert(
      supabaseUser,
      user_id,
      message_that_triggered,
      alert_sent_to
    );

    try {
      const userData = await getUserProfile(supabaseUser, user_id);
      await notifyGuardian(
        getGuardianEmail(userData, alert_sent_to),
        userData?.name,
        message_that_triggered
      );

      console.log("Crisis email sent successfully");

    } catch (emailErr) {
      console.log("Email failed:", emailErr.message);
    }

    res.json({
      message: "Crisis alert saved + email attempted",
      data,
    });

  } catch (err) {
    next(err);
  }
};

//------------------FORGET PASSWORD =================
export const forgotPassword = async (
  req,
  res,
  next
) => {
  try {
    const { email } = req.body;

    const { error } =
      await supabase.auth.resetPasswordForEmail(
        email,
        {
          redirectTo:
            "http://localhost:5173/reset-password",
        }
      );

    if (error) throw error;

    res.json({
      message:
        "Password reset email sent successfully",
    });

  } catch (err) {
    next(err);
  }
};

//------------------ UPLOAD MEDICAL REPORT =================
export const uploadMedicalReport = async (req, res, next) => {
  try {
    const file = req.file;
    const user_id = req.user.id;

    if (!file) {
      return res.status(400).json({
        message: "No file uploaded",
      });
    }

    const fileName = `${user_id}-${Date.now()}-${file.originalname}`;

    const { data, error } = await supabase.storage
      .from("medical-reports")
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
      });

    if (error) throw error;

    const { data: publicUrl } = supabase.storage
      .from("medical-reports")
      .getPublicUrl(fileName);

    res.json({
      message: "Medical report uploaded successfully",
      url: publicUrl.publicUrl,
    });

  } catch (err) {
    console.log("UPLOAD ERROR:", err.message);
    next(err);
  }
};
