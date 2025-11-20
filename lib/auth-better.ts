import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { Resend } from "resend";
import { prisma } from "./prisma";

// Inizializza Resend (verrà usato quando aggiungerai le API keys)
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "mongodb",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Impostiamo a true quando Resend sarà configurato
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: "CLIENT",
      },
      telefono: {
        type: "string",
        required: false,
      },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 giorni
    updateAge: 60 * 60 * 24, // aggiorna ogni 24 ore
  },
  // Email configuration con Resend
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      if (!resend) {
        console.log("Resend not configured. Verification URL:", url);
        return;
      }

      try {
        await resend.emails.send({
          from: process.env.EMAIL_FROM || "noreply@ptcrm.app",
          to: user.email,
          subject: "Verifica il tuo account PT CRM",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #333;">Benvenuto in PT CRM!</h1>
              <p>Ciao ${user.name},</p>
              <p>Clicca sul link qui sotto per verificare il tuo account:</p>
              <a href="${url}" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;">
                Verifica Account
              </a>
              <p>Se non hai richiesto questa registrazione, ignora questa email.</p>
              <p>Grazie,<br>Il team PT CRM</p>
            </div>
          `,
        });
      } catch (error) {
        console.error("Error sending verification email:", error);
      }
    },
  },
  // Password reset con Resend
  resetPassword: {
    sendResetPasswordEmail: async ({ user, url }) => {
      if (!resend) {
        console.log("Resend not configured. Reset URL:", url);
        return;
      }

      try {
        await resend.emails.send({
          from: process.env.EMAIL_FROM || "noreply@ptcrm.app",
          to: user.email,
          subject: "Reset password PT CRM",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #333;">Reset Password</h1>
              <p>Ciao ${user.name},</p>
              <p>Hai richiesto di reimpostare la password. Clicca sul link qui sotto:</p>
              <a href="${url}" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;">
                Reset Password
              </a>
              <p>Questo link scadrà tra 1 ora.</p>
              <p>Se non hai richiesto il reset, ignora questa email.</p>
              <p>Grazie,<br>Il team PT CRM</p>
            </div>
          `,
        });
      } catch (error) {
        console.error("Error sending reset password email:", error);
      }
    },
  },
  trustedOrigins: [
    process.env.NEXTAUTH_URL || "http://localhost:3000",
  ],
});

export type Session = typeof auth.$Infer.Session;
