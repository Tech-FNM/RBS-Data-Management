import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import nodemailer from "nodemailer";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// Lazy Supabase Client
const getSupabase = () => {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";
  if (!url || !key) {
    console.error("Supabase credentials missing!");
  }
  return createClient(url, key);
};

// Email Transporter Setup
const getTransporter = () => {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;
  if (!user || !pass) {
    throw new Error("Email credentials (EMAIL_USER/EMAIL_PASS) are missing.");
  }
  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  });
};

// Email Reminder Logic
const sendReminders = async () => {
  console.log("Checking for pending reminders...");
  try {
    const supabase = getSupabase();
    const today = new Date().toISOString().split('T')[0];
    
    const { data: reminders, error } = await supabase
      .from('reminders')
      .select('*, projects(name)')
      .eq('status', 'pending')
      .lte('date', today);

    if (error) throw error;

    if (reminders && reminders.length > 0) {
      console.log(`Found ${reminders.length} pending reminders.`);
      const transporter = getTransporter();

      for (const reminder of reminders) {
        try {
          await transporter.sendMail({
            from: `"RBS Panel Reminders" <${process.env.EMAIL_USER}>`,
            to: process.env.REMINDER_EMAIL_RECIPIENT || process.env.EMAIL_USER,
            subject: `⚠️ Payment Reminder: ${reminder.person_name}`,
            html: `
              <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #4f46e5;">Payment Reminder</h2>
                <p><strong>Person:</strong> ${reminder.person_name}</p>
                <p><strong>Amount:</strong> PKR ${reminder.amount.toLocaleString()}</p>
                <p><strong>Project:</strong> ${reminder.projects?.name || 'N/A'}</p>
                <p><strong>Due Date:</strong> ${reminder.date}</p>
              </div>
            `,
          });
          console.log(`✅ Sent to ${reminder.person_name}`);
        } catch (mailErr) {
          console.error(`❌ Failed for ${reminder.person_name}:`, mailErr);
        }
      }
    }
  } catch (err) {
    console.error("Error in sendReminders:", err);
    throw err;
  }
};

// API Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Vercel Cron Endpoint
app.get("/api/cron/reminders", async (req, res) => {
  console.log("Vercel Cron triggered...");
  try {
    await sendReminders();
    res.json({ success: true, message: "Cron reminders processed" });
  } catch (error: any) {
    console.error("Cron Error:", error);
    res.status(500).json({ success: false, error: error.message || "Internal Server Error" });
  }
});

// Config Check Endpoint
app.get("/api/config-check", (req, res) => {
  res.json({
    hasEmailUser: !!process.env.EMAIL_USER,
    hasEmailPass: !!process.env.EMAIL_PASS,
    hasSupabaseUrl: !!process.env.SUPABASE_URL,
    hasSupabaseKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
  });
});

// Manual Trigger for testing
app.post("/api/test-email", async (req, res) => {
  console.log("Test email requested...");
  try {
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;

    console.log("Environment check:", { 
      hasUser: !!user, 
      hasPass: !!pass,
      userValue: user ? user.substring(0, 3) + "..." : "missing" 
    });

    if (!user || !pass) {
      return res.status(400).json({ 
        success: false, 
        error: "EMAIL_USER or EMAIL_PASS environment variables are missing in Vercel settings." 
      });
    }

    const transporter = getTransporter();
    await transporter.sendMail({
      from: `"RBS Test" <${user}>`,
      to: user,
      subject: "RBS Panel - Test Email",
      text: "If you received this, your email configuration is working correctly!",
    });
    
    res.json({ success: true, message: "Test email sent successfully to " + user });
  } catch (error: any) {
    console.error("Test Email Error:", error);
    res.status(500).json({ success: false, error: error.message || "Failed to send email" });
  }
});

// Global Error Handler for API
app.use("/api", (err: any, req: any, res: any, next: any) => {
  console.error("API Error:", err);
  res.status(500).json({ success: false, error: err.message || "An internal server error occurred" });
});

// Vite middleware for development (Dynamic Import to prevent Vercel crash)
async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    try {
      const { createServer: createViteServer } = await import("vite");
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
    } catch (err) {
      console.error("Failed to load Vite:", err);
    }
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }
}

setupVite();

// Only listen if not on Vercel
if (process.env.VERCEL !== '1') {
  const PORT = 3000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

export default app;
