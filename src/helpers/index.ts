import axios from "axios";
import {
  getAIService,
  initializeAIService,
  refreshAIService,
} from "@/services/ai-service";
import type { Question } from "@/types";
import { IQuestionData } from "@/types";

// Create a cache for storing generated answers
const answerCache = new Map<string, string>();

interface UrlData {
  BASE_URL: string;
  ATTEMPT_ID: string;
}

export const extractDataFromUrl = (): UrlData => {
  const url = window.location.href;
  console.log("Current URL:", url);

  const baseRegex = /^(https:\/\/[^\/]+)/;
  const attemptRegex = /attempt\/([^\/]+)/;

  const baseMatch = url.match(baseRegex);
  const attemptMatch = url.match(attemptRegex);

  const result = {
    BASE_URL: baseMatch ? baseMatch[1] : "",
    ATTEMPT_ID: attemptMatch ? attemptMatch[1] : "",
  };

  console.log("Extracted URL data:", result);
  return result;
};

export const getExamDetails = async (baseUrl: string, attemptId: string) => {
  try {
    if (!baseUrl || !attemptId) {
      console.error("Missing baseUrl or attemptId", { baseUrl, attemptId });
      return null;
    }

    // Get auth token from localStorage
    const authToken = localStorage.getItem("auth_token");
    const jwtToken = localStorage.getItem("jwt_token");
    const token = authToken || jwtToken;

    if (!token) {
      console.error("No authentication token found in localStorage");
      console.log("Available localStorage keys:", Object.keys(localStorage));
      return null;
    }

    console.log("Using auth token for API request");

    // First try with Authentication header
    try {
      const response = await axios.get(
        `${baseUrl}/api/v1/user/write_assessment/${attemptId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authentication: token,
          },
        }
      );

      if (response.data) {
        console.log("API response received with Authentication header");
        const sectionWiseData = response.data?.exam_models || [];
        return sectionWiseData;
      }
    } catch (error) {
      console.log("First attempt failed, trying with Authorization header");
    }

    // Try with Authorization header
    try {
      const response = await axios.get(
        `${baseUrl}/api/v1/user/write_assessment/${attemptId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data) {
        console.log("API response received with Authorization header");
        const sectionWiseData = response.data?.exam_models || [];
        return sectionWiseData;
      }
    } catch (error) {
      console.log("Second attempt failed, trying with other endpoints");
    }

    // Try another common endpoint structure
    try {
      const response = await axios.get(
        `${baseUrl}/api/v1/write_assessment/${attemptId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authentication: token,
          },
        }
      );

      if (response.data) {
        console.log("API response received from alternative endpoint");
        const sectionWiseData = response.data?.exam_models || [];
        return sectionWiseData;
      }
    } catch (error) {
      console.error("All API attempts failed");
    }

    return null;
  } catch (error) {
    console.error("Error fetching exam details:", error);
    return null;
  }
};

export const generateAnswer = async (question: Question) => {
  try {
    // Generate a cache key based on the question ID or content
    const cacheKey = question.id || JSON.stringify(question.question);

    // Check if answer is already cached
    if (answerCache.has(cacheKey)) {
      console.log("Using cached answer for question:", cacheKey);
      return answerCache.get(cacheKey);
    }

    // Always refresh service to ensure we use the correct provider
    let aiService;
    try {
      aiService = getAIService();
      // Refresh to pick up any provider/key changes
      await refreshAIService();
      aiService = getAIService();
    } catch (error) {
      console.log("Initializing AI service for the first time");
      aiService = await initializeAIService();
    }

    // Generate the answer using selected provider
    const answer = await aiService.generateAnswer(question);

    // Store the answer in cache for future use
    if (answer) {
      answerCache.set(cacheKey, answer);
      console.log("Answer cached for future use:", cacheKey);
    }

    return answer;
  } catch (error) {
    console.error("Error generating answer:", error);
    return "";
  }
};
