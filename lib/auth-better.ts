import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { Resend } from "resend";
import { headers } from "next/headers";
import { prisma } from "./prisma";

// Initialize Resend (will be used when you add API keys)
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "mongodb",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }: { user: { email: string; name?: string | null }; url: string }) => {
      if (!resend) {
        console.log("Resend not configured. Reset URL:", url);
        return;
      }

      try {
        await resend.emails.send({
          from: process.env.EMAIL_FROM || "noreply@ptcrm.app",
          to: user.email,
          subject: "Reset your PT CRM password",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #333;">Reset Password</h1>
              <p>Hi ${user.name || "there"},</p>
              <p>You requested to reset your password. Click the link below:</p>
              <a href="${url}" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;">
                Reset Password
              </a>
              <p>This link will expire in 1 hour.</p>
              <p>If you did not request the reset, please ignore this email.</p>
              <p>Thanks,<br>The PT CRM Team</p>
            </div>
          `,
        });
      } catch (error) {
        console.error("Error sending reset password email:", error);
      }
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: "CLIENT",
        // Make role available in session
        input: false,
        output: true,
      },
      firstName: {
        type: "string",
        required: false,
        input: true,
        output: true,
      },
      lastName: {
        type: "string",
        required: false,
        input: true,
        output: true,
      },
      phone: {
        type: "string",
        required: false,
        input: false,
        output: true,
      },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // update every 24 hours
  },
  // Email configuration with Resend
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
          subject: "Verify your PT CRM account",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #333;">Welcome to PT CRM!</h1>
              <p>Hi ${user.name},</p>
              <p>Click the link below to verify your account:</p>
              <a href="${url}" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;">
                Verify Account
              </a>
              <p>If you did not request this registration, please ignore this email.</p>
              <p>Thanks,<br>The PT CRM Team</p>
            </div>
          `,
        });
      } catch (error) {
        console.error("Error sending verification email:", error);
      }
    },
  },
  trustedOrigins: [
    process.env.NEXTAUTH_URL || "http://localhost:3000",
  ],
});

export type Session = typeof auth.$Infer.Session;

/**
 * Helper to get session on server side (Server Components, API Routes)
 * Replaces getServerSession(authOptions) from NextAuth
 */
export async function getSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session;
}
