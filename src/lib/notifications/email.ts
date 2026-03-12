type SendSetPasswordEmailArgs = {
  email: string;
  setupUrl: string;
};

type SendSetPasswordEmailResult = {
  sent: boolean;
};

const RESEND_API_KEY = process.env.RESEND_API_KEY ?? "";
const EMAIL_FROM = process.env.EMAIL_FROM ?? "";

export const sendSetPasswordEmail = async ({
  email,
  setupUrl,
}: SendSetPasswordEmailArgs): Promise<SendSetPasswordEmailResult> => {
  if (!RESEND_API_KEY || !EMAIL_FROM) {
    console.log("[onboarding-email:fallback-link]", { email, setupUrl });
    return { sent: false };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: EMAIL_FROM,
        to: [email],
        subject: "Set your AgentBlueprints password",
        html: `<p>Your purchase was successful.</p><p>Set your password to activate your login:</p><p><a href="${setupUrl}">${setupUrl}</a></p>`,
      }),
    });

    if (!response.ok) {
      console.log("[onboarding-email:resend-failed]", {
        email,
        status: response.status,
      });
      return { sent: false };
    }

    return { sent: true };
  } catch {
    return { sent: false };
  }
};
