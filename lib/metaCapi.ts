import crypto from "crypto";

export interface MetaCapiLeadParams {
  eventId: string;
  email?: string;
  name?: string;
  leadValue?: number;
  sourceUrl?: string;
  clientIp?: string;
  userAgent?: string;
  fbp?: string;
  fbc?: string;
}

/**
 * Hashes a string using SHA-256 in lowercase hex format, as required by Meta Graph API.
 */
function hashSha256(value: string): string {
  return crypto
    .createHash("sha256")
    .update(value.trim().toLowerCase())
    .digest("hex");
}

/**
 * Sends a server-side Conversions API (CAPI) Lead event to Meta.
 * Missing credentials or network failures result in a silent no-op / warning
 * and will never throw an exception or interrupt the user request flow.
 */
export async function sendMetaCapiLeadEvent(
  params: MetaCapiLeadParams
): Promise<void> {
  const pixelId =
    process.env.META_PIXEL_ID || process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const accessToken = process.env.META_CAPI_ACCESS_TOKEN;

  // Missing env -> silent no-op as requested
  if (!pixelId || !accessToken) {
    return;
  }

  try {
    const userData: Record<string, unknown> = {};

    if (params.email) {
      userData.em = [hashSha256(params.email)];
    }

    if (params.name) {
      const parts = params.name.trim().split(/\s+/);
      if (parts[0]) {
        userData.fn = [hashSha256(parts[0])];
      }
      if (parts.length > 1) {
        userData.ln = [hashSha256(parts.slice(1).join(" "))];
      }
    }

    if (params.clientIp) {
      userData.client_ip_address = params.clientIp;
    }

    if (params.userAgent) {
      userData.client_user_agent = params.userAgent;
    }

    if (params.fbp) {
      userData.fbp = params.fbp;
    }

    if (params.fbc) {
      userData.fbc = params.fbc;
    }

    const customData: Record<string, unknown> = {};
    if (typeof params.leadValue === "number" && !Number.isNaN(params.leadValue)) {
      customData.currency = "EUR";
      customData.value = params.leadValue;
    }

    const eventPayload: Record<string, unknown> = {
      event_name: "Lead",
      event_time: Math.floor(Date.now() / 1000),
      event_id: params.eventId,
      action_source: "website",
      user_data: userData,
    };

    if (params.sourceUrl) {
      eventPayload.event_source_url = params.sourceUrl;
    }

    if (Object.keys(customData).length > 0) {
      eventPayload.custom_data = customData;
    }

    const requestBody: Record<string, unknown> = {
      data: [eventPayload],
    };

    if (process.env.META_TEST_EVENT_CODE) {
      requestBody.test_event_code = process.env.META_TEST_EVENT_CODE;
    }

    const response = await fetch(
      `https://graph.facebook.com/v21.0/${pixelId}/events?access_token=${accessToken}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.warn(
        `Meta CAPI request failed with status ${response.status}:`,
        errorText
      );
    }
  } catch (error) {
    // Non-blocking: never let CAPI errors disrupt user form submission
    console.warn("Meta CAPI lead event dispatch error:", error);
  }
}
