import axios from "axios";
import { getApiBaseUrl, getLogginEnabled } from "@/config/api"; // Import API config

// Flag to enable or disable logging globally
const LOGGING_ENABLED = getLogginEnabled();

/**
 * Centralized function for sending logs to a logging endpoint.
 * @param {string} eventType - The type of event (e.g., "USER_SELECTED_POI_IN_MAP", "CAMPAIGN_CREATED").
 * @param {string} description - A brief description of the event.
 * @param {Record<string, any>} [metadata] - Optional additional data related to the event.
 */
export const logEvent = async (
  eventType: string,
  description: string,
  metadata?: Record<string, any>
): Promise<void> => {
  if (!LOGGING_ENABLED) {
    console.info(`[Logging disabled]: ${eventType} - ${description}`, metadata);
    return;
  }

  try {
    await axios.post(`${getApiBaseUrl()}/log`, {
      eventType,
      description,
      metadata: metadata || {},
    });
    console.info(`[Log sent]: ${eventType} - ${description}`, metadata);
  } catch (error) {
    console.error(`[Error sending log]: ${eventType} - ${description}`, error);
  }
};
