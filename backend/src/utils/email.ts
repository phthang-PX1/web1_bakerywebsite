import nodemailer from "nodemailer";
import { env } from "../config/env";

export const emailTransporter = nodemailer.createTransport({
  host: env.EMAIL_HOST,
  port: env.EMAIL_PORT,
  secure: env.EMAIL_PORT === 465,
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASS
  }
});

const getBaseHtml = (title: string, content: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #fcfaf8; color: #333333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
    .header { background-color: #C87A19; padding: 24px; text-align: center; color: #ffffff; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 1px; }
    .body { padding: 32px 24px; line-height: 1.6; }
    .footer { background-color: #f5eedf; padding: 16px 24px; text-align: center; font-size: 12px; color: #7a6e5d; }
    .btn { display: inline-block; padding: 12px 24px; background-color: #C87A19; color: #ffffff !important; text-decoration: none; border-radius: 6px; font-weight: 600; margin-top: 16px; }
    .order-box { background: #fcfaf8; border: 1px solid #eee; border-radius: 6px; padding: 16px; margin: 16px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>WeBee Bakery</h1>
    </div>
    <div class="body">
      ${content}
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} WeBee Bakery. All rights reserved.<br>
      Thank you for being part of our sweet journey!
    </div>
  </div>
</body>
</html>
`;

export const renderWelcomeEmail = (fullName: string, activationUrl: string) =>
  getBaseHtml(
    "Welcome to WeBee Bakery",
    `
    <h2 style="color: #C87A19; margin-top: 0;">Welcome to WeBee, ${fullName}!</h2>
    <p>We are thrilled to have you join our community of bakery lovers. To get started and unlock all member perks, please activate your account below:</p>
    <div style="text-align: center; margin: 24px 0;">
      <a href="${activationUrl}" class="btn">Activate My Account</a>
    </div>
    <p style="font-size: 13px; color: #666;">If the button above does not work, copy and paste this link into your browser:<br><a href="${activationUrl}" style="color: #C87A19;">${activationUrl}</a></p>
    `
  );

export const renderResetPasswordEmail = (resetUrl: string) =>
  getBaseHtml(
    "Reset Your Password",
    `
    <h2 style="color: #C87A19; margin-top: 0;">Password Reset Request</h2>
    <p>We received a request to reset the password for your WeBee account. You can set a new password by clicking the button below:</p>
    <div style="text-align: center; margin: 24px 0;">
      <a href="${resetUrl}" class="btn">Reset Password</a>
    </div>
    <p style="font-size: 13px; color: #666;">If you did not request a password reset, please ignore this email. Your password will remain unchanged.<br>Link: <a href="${resetUrl}" style="color: #C87A19;">${resetUrl}</a></p>
    `
  );

export const renderEmailChangeEmail = (fullName: string, confirmUrl: string) =>
  getBaseHtml(
    "Confirm Your New Email",
    `
    <h2 style="color: #C87A19; margin-top: 0;">Confirm your new email, ${fullName}</h2>
    <p>We received a request to use this email address for your WeBee account. Confirm the change with the button below:</p>
    <div style="text-align: center; margin: 24px 0;">
      <a href="${confirmUrl}" class="btn">Confirm Email Change</a>
    </div>
    <p style="font-size: 13px; color: #666;">If you did not request this change, please ignore this email.<br>Link: <a href="${confirmUrl}" style="color: #C87A19;">${confirmUrl}</a></p>
    `
  );

export const renderOrderNotificationEmail = (data: {
  buyerName: string;
  orderId: string;
  totalAmount: number;
  isCash: boolean;
  transferContent: string | null;
  paymentQrUrl: string | null;
  activationUrl?: string;
}) =>
  getBaseHtml(
    `Order Confirmation #${data.orderId}`,
    `
    <h2 style="color: #C87A19; margin-top: 0;">Thank You for Your Order, ${data.buyerName}!</h2>
    <p>We have received your order and our chefs are getting ready to prepare your fresh bakery treats.</p>
    <div class="order-box">
      <p style="margin: 0 0 8px;"><strong>Order ID:</strong> #${data.orderId}</p>
      <p style="margin: 0 0 8px;"><strong>Total Amount:</strong> <span style="color: #C87A19; font-size: 18px; font-weight: bold;">${data.totalAmount.toLocaleString()} VNĐ</span></p>
      <p style="margin: 0;"><strong>Payment Method:</strong> ${data.isCash ? "Thanh toán khi nhận hàng (COD)" : "Chuyển khoản ngân hàng (Transfer)"}</p>
      ${!data.isCash && data.transferContent ? `
        <div style="margin-top: 12px; padding-top: 12px; border-top: 1px dashed #ccc;">
          <p style="margin: 0 0 8px;"><strong>Transfer Content:</strong> <span style="background: #eee; padding: 2px 6px; border-radius: 4px; font-family: monospace;">${data.transferContent}</span></p>
          ${data.paymentQrUrl ? `<div style="text-align: center; margin-top: 12px;"><img src="${data.paymentQrUrl}" alt="Payment QR" style="max-width: 200px; border-radius: 8px; border: 1px solid #ddd;" /></div>` : ""}
        </div>
      ` : ""}
    </div>
    ${data.activationUrl ? `
      <div style="background: #fff8f0; border-left: 4px solid #C87A19; padding: 12px 16px; margin-top: 24px;">
        <p style="margin: 0 0 8px; font-weight: bold;">Activate Your Member Account</p>
        <p style="margin: 0 0 12px; font-size: 14px;">We created an account for you so you can track this order and earn loyalty points!</p>
        <a href="${data.activationUrl}" class="btn" style="margin-top: 0; padding: 8px 16px; font-size: 14px;">Activate Account</a>
      </div>
    ` : ""}
    `
  );

export const sendEmailAsync = async (options: nodemailer.SendMailOptions): Promise<boolean> => {
  try {
    await emailTransporter.sendMail(options);
    return true;
  } catch (error) {
    console.error("Async email delivery failed:", error);
    return false;
  }
};
