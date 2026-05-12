// src/hooks/usePlatformAgreement.js
// Fetches & manages the platform agreement status for landlord/agent.
// Used in LDSettings and LDOverview — does NOT affect any existing components.
import { useState, useEffect, useCallback } from "react";
import { API_BASE } from "../config";

const hdrs = (tk) => ({
  Authorization:  `Bearer ${tk}`,
  "Content-Type": "application/json",
});

const REQUIRED_TERMS = [
  "accurateInformation",
  "ownershipOrAuthorization",
  "noFraudOrMisleadingListings",
  "verificationConsent",
  "platformPolicies",
  "feesAndCommission",
  "policyEnforcement",
  "platformRole",
];

export function usePlatformAgreement(token) {
  const [status,   setStatus]   = useState(null);   // { hasSigned, status, signedAt, ... }
  const [loading,  setLoading]  = useState(true);
  const [signing,  setSigning]  = useState(false);
  const [error,    setError]    = useState(null);

  const fetchStatus = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res  = await fetch(`${API_BASE}/platform-agreement/status`, { headers: hdrs(token) });
      const data = await res.json();
      if (data.success) setStatus(data.data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchStatus(); }, [fetchStatus]);

  const sign = async (userSignature = "") => {
    setSigning(true); setError(null);
    try {
      const res  = await fetch(`${API_BASE}/platform-agreement/sign`, {
        method:  "POST",
        headers: hdrs(token),
        body:    JSON.stringify({ acceptedTerms: REQUIRED_TERMS, userSignature }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Signing failed");
      await fetchStatus();
      return data;
    } catch (e) {
      setError(e.message);
      throw e;
    } finally {
      setSigning(false);
    }
  };

  return { status, loading, signing, error, sign, refetch: fetchStatus, REQUIRED_TERMS };
}