import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import nodemailer from "nodemailer";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Email Reminder Logic (Simple implementation for demo)
  // In a real production app, you'd use a cron job.
  const sendReminders = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data: reminders, error } = await supabase
        .from('reminders')
        .select('*, projects(name)')
        .eq('status', 'pending')
        .lte('date', today);

      if (error) throw error;

      if (reminders && reminders.length > 0) {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_APP_PASSWORD,
          },
        });

        for (const reminder of reminders) {
          const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.REMINDER_EMAIL_RECIPIENT || 'tkla9988@gmail.com',
            subject: `Payment Reminder: ${reminder.projects.name}`,
            text: `Reminder to collect payment of ${reminder.amount} from ${reminder.person_name} for project ${reminder.projects.name} on ${reminder.date}.`,
          };

          await transporter.sendMail(mailOptions);
          console.log(`Reminder sent for ${reminder.person_name}`);
        }
      }
    } catch (err) {
      console.error("Error sending reminders:", err);
    }
  };

  // Run reminders check every hour (for demo purposes)
  setInterval(sendReminders, 3600000);

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

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
