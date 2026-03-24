// controllers/callController.js
// Creates Daily.co video rooms for InzuTrust calls
// Subdomain: inzutrust.daily.co

const DAILY_BASE_URL = "https://api.daily.co/v1";

// ── Read API key lazily (ensures dotenv has loaded before we read it) ─────────
const getKey = () => process.env.DAILY_API_KEY;

// ── POST /api/calls/room ──────────────────────────────────────────────────────
const createRoom = async (req, res) => {
  try {
    const { roomName } = req.body;

    if (!roomName) {
      return res.status(400).json({ success: false, message: "roomName is required." });
    }

    // Sanitise: only alphanumeric + hyphens, max 60 chars
    const safeName = roomName.replace(/[^a-zA-Z0-9-]/g, "-").slice(0, 60);
    const DAILY_API_KEY = getKey();

    if (!DAILY_API_KEY) {
      // No API key set — return fallback public URL (works for testing)
      console.warn("[CallController] DAILY_API_KEY not set — using fallback URL");
      return res.json({
        success: true,
        url:     `https://inzutrust.daily.co/${safeName}`,
        message: "No DAILY_API_KEY set — using public room URL.",
      });
    }

    // 1. Check if room already exists (reuse it)
    const checkRes = await fetch(`${DAILY_BASE_URL}/rooms/${safeName}`, {
      headers: { Authorization: `Bearer ${DAILY_API_KEY}` },
    });

    if (checkRes.ok) {
      const existing = await checkRes.json();
      console.log("[CallController] Reusing existing room:", existing.url);
      return res.json({ success: true, url: existing.url });
    }

    // 2. Create new room
    const createRes = await fetch(`${DAILY_BASE_URL}/rooms`, {
      method:  "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization:  `Bearer ${DAILY_API_KEY}`,
      },
      body: JSON.stringify({
        name:       safeName,
        privacy:    "private",
        properties: {
          max_participants:   2,                                         // 1-on-1 only
          exp:                Math.floor(Date.now() / 1000) + 60 * 60, // expires in 1 hour
          enable_chat:        false,                                     // we have our own chat
          enable_screenshare: true,
          start_video_off:    false,
          start_audio_off:    false,
          lang:               "en",
        },
      }),
    });

    if (!createRes.ok) {
      const err = await createRes.json();
      console.error("[CallController] Daily.co error:", err);
      throw new Error(err.info || "Failed to create Daily.co room");
    }

    const room = await createRes.json();
    console.log("[CallController] Created new room:", room.url);

    return res.json({ success: true, url: room.url });
  } catch (err) {
    console.error("[CallController] createRoom error:", err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ── POST /api/calls/token ─────────────────────────────────────────────────────
// Creates a meeting token so users can join a private room
const createToken = async (req, res) => {
  try {
    const { roomName, userName } = req.body;
    const DAILY_API_KEY = getKey();

    if (!DAILY_API_KEY) {
      // No key — no token needed for public rooms
      return res.json({ success: true, token: null });
    }

    const tokenRes = await fetch(`${DAILY_BASE_URL}/meeting-tokens`, {
      method:  "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization:  `Bearer ${DAILY_API_KEY}`,
      },
      body: JSON.stringify({
        properties: {
          room_name:       roomName,
          user_name:       userName || "InzuTrust User",
          exp:             Math.floor(Date.now() / 1000) + 60 * 60,
          is_owner:        false,
          start_video_off: false,
          start_audio_off: false,
        },
      }),
    });

    const data = await tokenRes.json();
    if (!tokenRes.ok) throw new Error(data.info || "Failed to create token");

    return res.json({ success: true, token: data.token });
  } catch (err) {
    console.error("[CallController] createToken error:", err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { createRoom, createToken };