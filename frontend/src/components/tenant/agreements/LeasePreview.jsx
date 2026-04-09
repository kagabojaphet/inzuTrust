// src/components/tenant/agreements/LeasePreview.jsx
// Matches the InzuTrust official lease agreement template exactly
import React from "react";
import { formatRWF, fmtDate, normaliseAgreement } from "./agreementHelpers";

// ── InzuTrust SVG logo (house icon + wordmark) ────────────────────────────────
function InzuLogo() {
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", marginBottom:"12px" }}>
      {/* House icon */}
      <svg width="52" height="48" viewBox="0 0 52 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M26 4L4 22H10V44H22V32H30V44H42V22H48L26 4Z" fill="#1a56db" stroke="#1a56db" strokeWidth="1"/>
        <rect x="20" y="32" width="12" height="12" rx="1" fill="white"/>
      </svg>
      <span style={{ fontFamily:"Arial, sans-serif", fontWeight:"900", fontSize:"22px", color:"#1a56db", letterSpacing:"0.5px" }}>
        InzuTrust
      </span>
    </div>
  );
}

// ── InzuTrust circular stamp (bottom center) ───────────────────────────────────
function InzuStamp() {
  return (
    <svg width="90" height="90" viewBox="0 0 90 90" xmlns="http://www.w3.org/2000/svg">
      <circle cx="45" cy="45" r="42" fill="none" stroke="#1a56db" strokeWidth="2.5"/>
      <circle cx="45" cy="45" r="36" fill="none" stroke="#1a56db" strokeWidth="1"/>
      {/* House icon in center */}
      <path d="M45 22L29 35H33V54H41V46H49V54H57V35H61L45 22Z" fill="#1a56db"/>
      <rect x="41" y="46" width="8" height="8" rx="0.5" fill="white"/>
      {/* Arc text: INZUTRUST */}
      <path id="topArc" d="M 10,45 A 35,35 0 0,1 80,45" fill="none"/>
      <text fontSize="7.5" fontWeight="bold" fontFamily="Arial" fill="#1a56db" letterSpacing="2">
        <textPath href="#topArc" startOffset="12%">INZUTRUST</textPath>
      </text>
      {/* Arc text: TRUSTED PROPERTY SOLUTIONS */}
      <path id="botArc" d="M 13,48 A 32,32 0 0,0 77,48" fill="none"/>
      <text fontSize="5.5" fontFamily="Arial" fill="#1a56db" letterSpacing="1">
        <textPath href="#botArc" startOffset="5%">TRUSTED PROPERTY SOLUTIONS</textPath>
      </text>
    </svg>
  );
}

// ── Section header (blue pill label) ─────────────────────────────────────────
function SectionHeader({ children }) {
  return (
    <div style={{
      background: "linear-gradient(90deg, #1a56db 0%, #1a56db 180px, #e8eef8 180px)",
      borderRadius:"4px", padding:"6px 14px", marginBottom:"12px",
      display:"flex", alignItems:"center",
    }}>
      <span style={{ color:"white", fontFamily:"Arial,sans-serif", fontWeight:"800", fontSize:"11px", textTransform:"uppercase", letterSpacing:"1px" }}>
        {children}
      </span>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function LeasePreview({ agreement: a, tenantName, tenantSig }) {
  const { propertyTitle, propertyDistrict, landlordName, docLabel } = normaliseAgreement(a);

  // Build address display
  const fullAddress = [propertyTitle, propertyDistrict, "Rwanda"].filter(Boolean).join(", ");

  // Landlord info from agreement
  const landlordPhone = a.landlord?.phone || a.landlordPhone || "+250 7XX XXX XXX";
  const tenantPhone   = a.tenantPhone  || a.tenant?.phone  || "+250 7XX XXX XXX";
  const tenantId      = a.tenantNationalId  || a.tenantIdNo  || "—";
  const landlordId    = a.landlordNationalId || a.landlordIdNo || "—";
  const propType      = a.property?.type || a.propertyType || "House";

  const signDate = a.signedAt
    ? new Date(a.signedAt).toLocaleDateString("en-GB", { day:"2-digit", month:"2-digit", year:"numeric" })
    : new Date().toLocaleDateString("en-GB", { day:"2-digit", month:"2-digit", year:"numeric" });

  const payDueDay = a.paymentDueDay || "5th";

  const terms = [
    { label:"Utilities",     text:"Tenant is responsible for water and electricity bills." },
    { label:"Maintenance",   text:"Landlord will handle major repairs.", bold:true },
    { label:null,            text:"No subletting allowed without landlord's consent." },
    { label:"Notice Period", text:"30 days notice required for termination.", bold:true },
  ];

  return (
    <div style={{
      fontFamily:"Arial, Helvetica, sans-serif",
      fontSize:"12px",
      color:"#1a1a1a",
      background:"white",
      maxWidth:"760px",
      margin:"0 auto",
      lineHeight:"1.6",
      border:"1px solid #ddd",
      borderRadius:"4px",
      overflow:"hidden",
    }}>
      {/* ── Top white section ── */}
      <div style={{ padding:"32px 40px 0" }}>

        {/* Logo */}
        <div style={{ textAlign:"center", marginBottom:"4px" }}>
          <InzuLogo/>
        </div>

        <hr style={{ border:"none", borderTop:"2px solid #1a56db", margin:"10px 0 20px" }}/>

        {/* Title */}
        <h1 style={{
          textAlign:"center", color:"#1a56db", fontFamily:"Arial,sans-serif",
          fontWeight:"900", fontSize:"20px", textTransform:"uppercase",
          letterSpacing:"2px", margin:"0 0 8px",
        }}>
          RESIDENTIAL LEASE AGREEMENT
        </h1>
        <div style={{ textAlign:"center", color:"#888", fontSize:"11px", marginBottom:"20px", display:"flex", alignItems:"center", justifyContent:"center", gap:"12px" }}>
          <div style={{ flex:1, height:"1px", background:"#ddd", maxWidth:"120px" }}/>
          <span>THIS AGREEMENT IS MADE ON: <strong>{signDate}</strong></span>
          <div style={{ flex:1, height:"1px", background:"#ddd", maxWidth:"120px" }}/>
        </div>

        <hr style={{ border:"none", borderTop:"1px solid #ddd", margin:"0 0 20px" }}/>

        {/* PARTIES */}
        <div style={{ marginBottom:"18px" }}>
          <h2 style={{ fontWeight:"900", fontSize:"13px", color:"#1a1a1a", marginBottom:"6px", textTransform:"uppercase" }}>PARTIES</h2>
          <hr style={{ border:"none", borderTop:"1px solid #ccc", marginBottom:"10px" }}/>
          <p style={{ color:"#555", marginBottom:"12px" }}>This Lease Agreement is entered into between:</p>

          {/* LANDLORD block */}
          <SectionHeader>LANDLORD:</SectionHeader>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 40px", paddingLeft:"8px", marginBottom:"16px" }}>
            <div>
              <p style={{ fontWeight:"900", fontSize:"13px", marginBottom:"4px" }}>{landlordName}</p>
              <p style={{ color:"#555", margin:"2px 0" }}>ID No: {landlordId}</p>
              <p style={{ color:"#555", margin:"2px 0" }}>Phone: {landlordPhone}</p>
            </div>
            <div>
              <p style={{ fontWeight:"900", fontSize:"13px", marginBottom:"4px" }}>{tenantName || "Tenant Name"}</p>
              <p style={{ color:"#555", margin:"2px 0" }}>ID No: {tenantId}</p>
              <p style={{ color:"#555", margin:"2px 0" }}>Phone: {tenantPhone}</p>
            </div>
          </div>
        </div>

        {/* PROPERTY DETAILS */}
        <div style={{ marginBottom:"18px" }}>
          <SectionHeader>PROPERTY DETAILS</SectionHeader>
          <div style={{ paddingLeft:"8px", lineHeight:"1.9" }}>
            <p><span style={{ color:"#555" }}>Rental Property: </span><strong>{fullAddress}</strong></p>
            <p><span style={{ color:"#555" }}>Type of Property: </span><strong style={{ textTransform:"capitalize" }}>{propType}</strong>.</p>
            <p>
              <span style={{ color:"#555" }}>Lease Term: </span>
              <span style={{ marginLeft:"8px" }}>Start Date: </span>
              <strong>{fmtDate(a.startDate)}</strong>
              <span style={{ marginLeft:"20px" }}>End Date: </span>
              <strong>{fmtDate(a.endDate)}</strong>
            </p>
          </div>
        </div>

        {/* RENT & DEPOSIT */}
        <div style={{ marginBottom:"18px" }}>
          <SectionHeader>RENT &amp; DEPOSIT</SectionHeader>
          <div style={{ paddingLeft:"8px", lineHeight:"1.9" }}>
            <p><span style={{ color:"#555" }}>Monthly Rent: </span><strong>{formatRWF(a.rentAmount)}</strong></p>
            <p><span style={{ color:"#555" }}>Security Deposit: </span><strong>{formatRWF(a.securityDeposit || a.rentAmount)}</strong></p>
            <p><span style={{ color:"#555" }}>Payment Due Date: </span><strong>{payDueDay} of each month</strong></p>
          </div>
        </div>

        {/* TERMS & CONDITIONS */}
        <div style={{ marginBottom:"24px" }}>
          <SectionHeader>TERMS &amp; CONDITIONS</SectionHeader>
          <div style={{ paddingLeft:"8px", lineHeight:"1.9" }}>
            {terms.map((t, i) => (
              <p key={i} style={{ margin:"2px 0" }}>
                {"- "}
                {t.label && <><strong>{t.label}:</strong>{" "}</>}
                {t.bold ? <strong>{t.text}</strong> : t.text}
              </p>
            ))}
            {a.additionalTerms && (
              <p style={{ margin:"2px 0" }}>- <strong>Additional Terms:</strong> {a.additionalTerms}</p>
            )}
          </div>
        </div>

        {/* ── Signature section ── */}
        <div style={{
          display:"grid", gridTemplateColumns:"1fr auto 1fr",
          alignItems:"end", gap:"20px",
          paddingBottom:"24px", paddingTop:"10px",
        }}>
          {/* Landlord signature */}
          <div style={{ textAlign:"center" }}>
            <div style={{
              minHeight:"54px", borderBottom:"2px solid #333",
              display:"flex", alignItems:"flex-end", justifyContent:"center",
              paddingBottom:"4px", marginBottom:"6px",
            }}>
              {a.landlordSignature ? (
                <img src={a.landlordSignature} alt="landlord-sig" style={{ maxHeight:"50px", maxWidth:"100%" }}/>
              ) : a.landlordSigned ? (
                <span style={{ fontStyle:"italic", fontSize:"11px", color:"#555" }}>{landlordName} ✓</span>
              ) : null}
            </div>
            <p style={{ fontWeight:"900", fontSize:"12px", marginBottom:"2px" }}>{landlordName}</p>
            <p style={{ color:"#888", fontSize:"11px" }}>Landlord</p>
          </div>

          {/* Center stamp */}
          <div style={{ textAlign:"center", paddingBottom:"12px" }}>
            <InzuStamp/>
          </div>

          {/* Tenant signature */}
          <div style={{ textAlign:"center" }}>
            <div style={{
              minHeight:"54px", borderBottom:"2px solid #333",
              display:"flex", alignItems:"flex-end", justifyContent:"center",
              paddingBottom:"4px", marginBottom:"6px",
            }}>
              {tenantSig ? (
                <img src={tenantSig} alt="tenant-sig" style={{ maxHeight:"50px", maxWidth:"100%" }}/>
              ) : a.tenantSignature ? (
                <img src={a.tenantSignature} alt="tenant-sig" style={{ maxHeight:"50px", maxWidth:"100%" }}/>
              ) : null}
            </div>
            <p style={{ fontWeight:"900", fontSize:"12px", marginBottom:"2px" }}>{tenantName || "Tenant Name"}</p>
            <p style={{ color:"#888", fontSize:"11px" }}>Tenant</p>
          </div>
        </div>
      </div>

      {/* ── Blue footer strip ── */}
      <div style={{
        background:"#1a56db", padding:"12px 40px",
        textAlign:"center", color:"white",
        fontSize:"11px", fontWeight:"600",
        letterSpacing:"0.5px",
      }}>
        www.inzutrust.com | Email: info@inzutrust.com
      </div>
    </div>
  );
}