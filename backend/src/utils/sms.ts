import { env } from "../config/env";

type TwilioMessageResponse = {
  sid?: string;
  status?: string;
  message?: string;
  code?: number;
};

export const sendSms = async (to: string, message: string) => {
  const url = `https://api.twilio.com/2010-04-01/Accounts/${env.TWILIO_ACCOUNT_SID}/Messages.json`;
  const body = new URLSearchParams({
    To: to,
    From: env.TWILIO_PHONE_NUMBER,
    Body: message
  });

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${env.TWILIO_ACCOUNT_SID}:${env.TWILIO_AUTH_TOKEN}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body
  });

  const data = (await response.json()) as TwilioMessageResponse;

  if (!response.ok) {
    throw new Error(data.message ?? "Failed to send SMS with Twilio");
  }

  return {
    sid: data.sid,
    status: data.status
  };
};
