export interface VerifyEmailPayload {
  name: string;
  code: string;
  expiryMinutes: number;
}

export interface PasswordResetPayload {
  name: string;
  code: string;
  expiryMinutes: number;
}

export interface LoginAlertPayload {
  name: string;
  device: string;
  location: string;
  ip: string;
  time: string;
}

export interface QueuedMail {
  to: string;
  subject: string;
  html: string;
}
