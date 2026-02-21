import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import nodemailer from "nodemailer";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import cron from "node-cron";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use Service Role Key for backend operations to bypass RLS if needed
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const app = express();

async function setupServer() {
  const PORT = 3000;

  app.use(express.json());

  // Email Transporter Setup
  const getTransporter = () => {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // 16-digit App Password
      },
    });
  };

  // Email Reminder Logic
  const sendReminders = async () => {
    console.log("Checking for pending reminders...");
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Fetch pending reminders that are due today or in the past
      const { data: reminders, error } = await supabase
        .from('reminders')
        .select('*, projects(name)')
        .eq('status', 'pending')
        .lte('date', today);

      if (error) {
        console.error("Supabase Error:", error);
        return;
      }

      if (reminders && reminders.length > 0) {
        console.log(`Found ${reminders.length} pending reminders. Sending emails...`);
        const transporter = getTransporter();

        for (const reminder of reminders) {
          const mailOptions = {
            from: `"RBS Panel Reminders" <${process.env.EMAIL_USER}>`,
            to: process.env.REMINDER_EMAIL_RECIPIENT || process.env.EMAIL_USER,
            subject: `⚠️ Payment Reminder: ${reminder.person_name} (${reminder.projects?.name || 'N/A'})`,
            html: `
              <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #4f46e5;">Payment Reminder</h2>
                <p>This is an automated reminder for a pending payment collection.</p>
                <hr />
                <p><strong>Person:</strong> ${reminder.person_name}</p>
                <p><strong>Amount:</strong> PKR ${reminder.amount.toLocaleString()}</p>
                <p><strong>Project:</strong> ${reminder.projects?.name || 'N/A'}</p>
                <p><strong>Due Date:</strong> ${reminder.date}</p>
                <hr />
                <p style="font-size: 12px; color: #666;">Managed by RBS Panel</p>
              </div>
            `,
          };

          try {
            await transporter.sendMail(mailOptions);
            console.log(`✅ Email sent to ${mailOptions.to} for ${reminder.person_name}`);
          } catch (mailErr) {
            console.error(`❌ Failed to send email for ${reminder.person_name}:`, mailErr);
          }
        }
      } else {
        console.log("No pending reminders due today.");
      }
    } catch (err) {
      console.error("Unexpected Error in sendReminders:", err);
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
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Manual Trigger for testing
  app.post("/api/test-email", async (req, res) => {
    console.log("Test email requested...");
    try {
      const transporter = getTransporter();
      const user = process.env.EMAIL_USER;
      const pass = process.env.EMAIL_PASS;

      if (!user || !pass) {
        throw new Error("EMAIL_USER or EMAIL_PASS environment variables are missing.");
      }

      await transporter.sendMail({
        from: `"RBS Test" <${user}>`,
        to: user,
        subject: "RBS Panel - Test Email",
        text: "If you received this, your email configuration is working correctly!",
      });
      res.json({ success: true, message: "Test email sent successfully to " + user });
    } catch (error: any) {
      console.error("Test Email Error:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Schedule Daily Reminders (Runs every day at 9:00 AM)
  // Format: second minute hour day-of-month month day-of-week
  cron.schedule('0 0 9 * * *', () => {
    console.log("Running scheduled daily reminders check...");
    sendReminders();
  });

  // Also run once on server start
  sendReminders();

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  // Only listen if not on Vercel
  if (process.env.VERCEL !== '1') {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }
}

setupServer();
export default app;
