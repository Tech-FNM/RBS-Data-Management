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
  console.log("sendReminders: Starting check for pending reminders...");
  try {
    const supabase = getSupabase();
    if (!supabase) {
      console.error("sendReminders: Supabase client not initialized. Aborting.");
      throw new Error("Supabase client not available.");
    }
    const today = new Date().toISOString().split('T')[0];
    console.log(`sendReminders: Fetching ALL pending reminders (ignoring due date)...`);
    
    const { data: reminders, error } = await supabase
      .from('reminders')
      .select('*, projects(name)')
      .eq('status', 'pending');

    if (error) {
      console.error("sendReminders: Supabase Fetch Error:", error);
      throw new Error(`Supabase Fetch Error: ${error.message}`);
    }

    if (!reminders || reminders.length === 0) {
      console.log("sendReminders: No pending reminders due today.");
      return;
    }

    console.log(`sendReminders: Found ${reminders.length} pending reminders. Attempting to send emails...`);
    const transporter = getTransporter();
    if (!transporter) {
      console.error("sendReminders: Email transporter not initialized. Aborting.");
      throw new Error("Email transporter not available.");
    }

    for (const reminder of reminders) {
      console.log(`sendReminders: Sending email for ${reminder.person_name} (ID: ${reminder.id})...`);
      try {
        await transporter.sendMail({
          from: `"RBS System Reminders" <${process.env.EMAIL_USER}>`,
          to: process.env.REMINDER_EMAIL_RECIPIENT || process.env.EMAIL_USER,
          subject: `⚠️ Payment Reminder: ${reminder.person_name}`,
          html: `
            <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
              <h2 style="color: #c5a059;">Payment Reminder</h2>
              <p>Hello,</p>
              <p>This is a reminder for a pending payment collection:</p>
              <ul>
                <li><strong>Person:</strong> ${reminder.person_name}</li>
                <li><strong>Amount:</strong> PKR ${reminder.amount.toLocaleString()}</li>
                <li><strong>Project:</strong> ${reminder.projects?.name || 'N/A'}</li>
                <li><strong>Due Date:</strong> ${reminder.date}</li>
              </ul>
              <p>Please take necessary action.</p>
              <p style="font-size: 12px; color: #666;">Managed by RBS Engineering System</p>
            </div>
          `,
        });
        console.log(`sendReminders: ✅ Email sent for ${reminder.person_name} (ID: ${reminder.id}).`);
      } catch (mailErr) {
        console.error(`sendReminders: ❌ Failed to send email for ${reminder.person_name} (ID: ${reminder.id}):`, mailErr);
        // Continue to next reminder even if one fails
      }
    }
    console.log("sendReminders: All pending reminders processed.");
  } catch (err) {
    console.error("sendReminders: Unhandled Error:", err);
    throw err; // Re-throw to be caught by API endpoint error handler
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
  console.log("test-email: Test email requested...");
  try {
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;

    console.log("test-email: Environment check:", { 
      hasUser: !!user, 
      hasPass: !!pass,
      userValue: user ? user.substring(0, 3) + "..." : "missing" 
    });

    if (!user || !pass) {
      const errorMessage = "EMAIL_USER or EMAIL_PASS environment variables are missing in Vercel settings.";
      console.error("test-email: " + errorMessage);
      return res.status(400).json({ 
        success: false, 
        error: errorMessage 
      });
    }

    const transporter = getTransporter();
    console.log("test-email: Transporter created. Sending mail...");
    await transporter.sendMail({
      from: `"RBS Test" <${user}>`,
      to: user,
      subject: "RBS Engineering System - Test Email",
      text: "If you received this, your email configuration is working correctly!",
    });
    
    console.log("test-email: Test email sent successfully.");
    res.json({ success: true, message: "Test email sent successfully to " + user });
  } catch (error: any) {
    console.error("test-email: Test Email Error:", error);
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
  if (process.env.VERCEL === '1') {
    return; // Skip completely on Vercel
  }

  if (process.env.NODE_ENV !== "production") {
    try {
      const vitePkg = "vite"; // Dynamic string hides it from Vercel's static analyzer
      const { createServer: createViteServer } = await import(/* @vite-ignore */ vitePkg);
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
