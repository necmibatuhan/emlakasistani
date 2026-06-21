import { useContext, useCallback } from 'react';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import { v4 as uuidv4 } from 'uuid';

export const EVENTS = {
  // Onboarding
  ONBOARDING_STARTED: 'onboarding_started',
  ONBOARDING_STEP_COMPLETED: 'onboarding_step_completed',
  ONBOARDING_COMPLETED: 'onboarding_completed',
  ONBOARDING_SKIPPED: 'onboarding_skipped',

  // Müşteri aksiyonları
  CUSTOMER_ADDED: 'customer_added',
  CUSTOMER_QUICK_ADD: 'customer_quick_add',
  SCORE_VIEWED: 'score_viewed',
  SCORE_REASON_VIEWED: 'score_reason_viewed',

  // Engagement
  WHATSAPP_CLICKED: 'whatsapp_clicked',
  TEMPLATE_USED: 'template_used',
  PRIORITIES_WIDGET_VIEWED: 'priorities_widget_viewed',

  // Retention
  DAY_1_RETURN: 'day_1_return',
  DAY_7_RETURN: 'day_7_return',
};

// Simple local session ID
const getSessionId = () => {
  let sessionId = sessionStorage.getItem('analytics_session_id');
  if (!sessionId) {
    sessionId = uuidv4();
    sessionStorage.setItem('analytics_session_id', sessionId);
  }
  return sessionId;
};

export const useAnalytics = () => {
  const { token, user } = useContext(AuthContext);

  const track = useCallback(async (eventName, properties = {}) => {
    if (!token || !user) return; // Only track authenticated users

    try {
      const sessionId = getSessionId();
      await axios.post(
        `${(import.meta.env.VITE_API_URL ?? 'http://localhost:5001')}/api/analytics/event`,
        { event_name: eventName, properties, session_id: sessionId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (e) {
      console.warn('Analytics event failed to send:', eventName);
    }
  }, [token, user]);

  return { track, EVENTS };
};
