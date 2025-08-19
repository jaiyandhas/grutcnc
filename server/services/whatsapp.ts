import fetch from 'node-fetch';

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
// Support both TWILIO_WHATSAPP_FROM and legacy TWILIO_PHONE_NUMBER
const TWILIO_WHATSAPP_FROM = process.env.TWILIO_WHATSAPP_FROM || process.env.TWILIO_PHONE_NUMBER;
const DEFAULT_TWILIO_WHATSAPP_TO = process.env.TWILIO_WHATSAPP_TO; // Optional default recipient

export type WhatsAppContentVariables = Record<string, string | number>;

export async function sendWhatsAppMessage(options: {
  to?: string;
  body?: string;
  contentSid?: string;
  contentVariables?: WhatsAppContentVariables;
}): Promise<{ ok: boolean; status: number; statusText: string; responseText?: string }> {
  try {
    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
      throw new Error('Missing TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN');
    }
    if (!TWILIO_WHATSAPP_FROM) {
      throw new Error('Missing TWILIO_WHATSAPP_FROM (or TWILIO_PHONE_NUMBER)');
    }

    const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;

    const toNumber = options.to || DEFAULT_TWILIO_WHATSAPP_TO;
    if (!toNumber) {
      throw new Error('No WhatsApp recipient provided (set TWILIO_WHATSAPP_TO or pass options.to)');
    }

    const params = new URLSearchParams();
    params.append('To', `whatsapp:${toNumber}`);
    params.append('From', `whatsapp:${TWILIO_WHATSAPP_FROM}`);

    if (options.contentSid) {
      params.append('ContentSid', options.contentSid);
      if (options.contentVariables && Object.keys(options.contentVariables).length > 0) {
        params.append('ContentVariables', JSON.stringify(options.contentVariables));
      }
    } else if (options.body) {
      params.append('Body', options.body);
    } else {
      throw new Error('Either body or contentSid must be provided');
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    });

    const responseText = await response.text();
    if (!response.ok) {
      console.error('Twilio WhatsApp send failed:', response.status, response.statusText, responseText);
    }
    return { ok: response.ok, status: response.status, statusText: response.statusText, responseText };
  } catch (error: any) {
    console.error('Error sending WhatsApp message:', error);
    return { ok: false, status: 0, statusText: error?.message || 'Unknown error' };
  }
}

export async function sendWhatsAppAlert(machineName: string, component: string, remainingLife: number, replacementCost?: number): Promise<boolean> {
  try {
    const costMessage = replacementCost ? ` Replacement cost: ₹${replacementCost.toLocaleString()}` : '';
    const message = `🚨 CRITICAL ALERT: ${machineName}'s ${component} is below safe threshold at ${remainingLife.toFixed(1)}%. Immediate maintenance recommended.${costMessage}`;

    const result = await sendWhatsAppMessage({ body: message });
    if (result.ok) {
      console.log(`WhatsApp alert sent successfully for ${machineName}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error sending WhatsApp alert:', error);
    return false;
  }
}
