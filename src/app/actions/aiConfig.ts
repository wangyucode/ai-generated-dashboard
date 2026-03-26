"use server";

import { revalidatePath } from "next/cache";
import { getMetaDbInstance, initDatabase } from "@/lib/db";
import logger from "@/lib/logger";

export interface AIConfig {
  id: number;
  base_url: string;
  model_id: string;
  api_key: string;
  is_active: boolean;
}

export async function getAIConfig(mask = true): Promise<AIConfig | null> {
  try {
    await initDatabase();
    const db = getMetaDbInstance();
    const config = await db<AIConfig>("ai_configs")
      .where("is_active", true)
      .first();

    if (mask && config && config.api_key) {
      // Desensitization: sk-....xxxx
      const key = config.api_key;
      if (key.length > 8) {
        config.api_key = `${key.slice(0, 3)}****************${key.slice(-4)}`;
      } else {
        config.api_key = "****************";
      }
    }

    return config || null;
  } catch (error) {
    logger.error({ error }, "Failed to get AI config");
    return null;
  }
}

export async function saveAIConfig(payload: {
  baseUrl: string;
  modelId: string;
  apiKey: string;
}): Promise<{ success: boolean; message: string }> {
  try {
    logger.info("Saving AI config", {
      baseUrl: payload.baseUrl,
      modelId: payload.modelId,
    });

    const db = getMetaDbInstance();
    await initDatabase();

    const existingConfig = await db<AIConfig>("ai_configs").first();

    // if API Key contains masked characters, we assume the user hasn't modified it, and we don't update the api_key field in the database
    const isMasked = payload.apiKey.includes("****");

    if (existingConfig) {
      const updateData: Partial<AIConfig> = {
        base_url: payload.baseUrl,
        model_id: payload.modelId,
        is_active: true,
      };

      if (!isMasked) {
        updateData.api_key = payload.apiKey;
      }

      await db("ai_configs").where("id", existingConfig.id).update(updateData);
    } else {
      // if it's the first time saving, and it API Key contains masked characters, we assume the user is saving a new config
      if (isMasked) {
        return { success: false, message: "Invalid API Key" };
      }

      await db("ai_configs").insert({
        base_url: payload.baseUrl,
        model_id: payload.modelId,
        api_key: payload.apiKey,
        is_active: true,
      });
    }

    revalidatePath("/");
    return { success: true, message: "AI config saved successfully" };
  } catch (error) {
    logger.error({ error }, "Failed to save AI config");
    return { success: false, message: "Failed to save AI config" };
  }
}
