"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// emails/constants.ts
function appUrl(path = "") {
  const base = (process.env.PUBLIC_APP_URL || "https://www.quayvox.com").replace(/\/$/, "");
  if (!path) return base;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
function trackUrl(trackingNumber) {
  return appUrl(`/track/${encodeURIComponent(trackingNumber)}`);
}
function adminShipmentUrl(shipmentId) {
  return appUrl(`/admin/shipments?highlight=${encodeURIComponent(shipmentId)}`);
}
function toneForStatus(status) {
  switch (status) {
    case "Delivered":
      return "success";
    case "Exception":
      return "danger";
    case "Pending":
    case "On Hold":
      return "warning";
    case "Customs":
      return "customs";
    default:
      return "default";
  }
}
function copyForStatus(table, status) {
  const row = table[status];
  if (row) return row;
  return {
    headline: `Shipment is now ${status}`,
    body: `This shipment status was updated to ${status}.`
  };
}
var BRAND, FONTS, CONTACT, BRANCHES, BRANCHES_LINE, TONE_ACCENT, STATUS_COLORS, STATUS_COLORS_ON_DARK, CUSTOMER_STATUS_COPY, ADMIN_STATUS_COPY;
var init_constants = __esm({
  "emails/constants.ts"() {
    "use strict";
    BRAND = {
      name: "Quayvox",
      cobalt: "#4F6DF5",
      cobaltSoft: "#6B86F7",
      navyDark: "#070A12",
      navyHeader: "#0B1220",
      navySurface: "#11182B",
      navyMid: "#171F33",
      textPrimary: "#0B1220",
      textSecondary: "#4A5568",
      textOnDark: "#F4F6FF",
      textMutedOnDark: "#A7B1C8",
      bgLight: "#F0F3F9",
      bgCanvas: "#070A12",
      surface: "#FFFFFF",
      border: "#E2E8F5",
      borderOnDark: "rgba(244, 246, 255, 0.10)",
      success: "#27C26A",
      warning: "#F59E0B",
      error: "#EF4444",
      purple: "#A78BFA",
      blue: "#60A5FA"
    };
    FONTS = {
      display: "'Sora', 'Segoe UI', Helvetica, Arial, sans-serif",
      body: "'Inter', 'Segoe UI', Helvetica, Arial, sans-serif",
      mono: "'IBM Plex Mono', 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace"
    };
    CONTACT = {
      email: "info@quayvox.com",
      phoneDisplay: "+1 972-383-9794",
      phoneE164: "+19723839794",
      telHref: "tel:+19723839794",
      whatsappHref: "https://wa.me/19723839794",
      mailtoHref: "mailto:info@quayvox.com"
    };
    BRANCHES = [
      { country: "USA", continent: "North America" },
      { country: "Mexico", continent: "North America" },
      { country: "UK", continent: "Europe" },
      { country: "Russia", continent: "Europe / Asia" },
      { country: "Egypt", continent: "Africa" },
      { country: "Japan", continent: "Asia" },
      { country: "Australia", continent: "Oceania" }
    ];
    BRANCHES_LINE = BRANCHES.map((b) => b.country).join("  \xB7  ");
    TONE_ACCENT = {
      default: BRAND.cobalt,
      success: BRAND.success,
      warning: BRAND.warning,
      danger: BRAND.error,
      customs: BRAND.purple
    };
    STATUS_COLORS = {
      Pending: { bg: "#FEF3C7", text: "#B45309", border: "#FCD34D", accent: BRAND.warning },
      "In Transit": { bg: "#DBEAFE", text: "#1D4ED8", border: "#93C5FD", accent: BRAND.cobalt },
      Customs: { bg: "#EDE9FE", text: "#6D28D9", border: "#C4B5FD", accent: BRAND.purple },
      "On Hold": { bg: "#FFEDD5", text: "#C2410C", border: "#FDBA74", accent: BRAND.warning },
      Delivered: { bg: "#D1FAE5", text: "#047857", border: "#6EE7B7", accent: BRAND.success },
      Exception: { bg: "#FEE2E2", text: "#B91C1C", border: "#FCA5A5", accent: BRAND.error }
    };
    STATUS_COLORS_ON_DARK = {
      Pending: { bg: "rgba(245, 158, 11, 0.18)", text: "#FBBF24", border: "rgba(245, 158, 11, 0.35)" },
      "In Transit": { bg: "rgba(79, 109, 245, 0.22)", text: "#A5B4FC", border: "rgba(79, 109, 245, 0.40)" },
      Customs: { bg: "rgba(167, 139, 250, 0.20)", text: "#C4B5FD", border: "rgba(167, 139, 250, 0.38)" },
      "On Hold": { bg: "rgba(249, 115, 22, 0.20)", text: "#FDBA74", border: "rgba(249, 115, 22, 0.38)" },
      Delivered: { bg: "rgba(39, 194, 106, 0.18)", text: "#6EE7B7", border: "rgba(39, 194, 106, 0.38)" },
      Exception: { bg: "rgba(239, 68, 68, 0.20)", text: "#FCA5A5", border: "rgba(239, 68, 68, 0.40)" }
    };
    CUSTOMER_STATUS_COPY = {
      Pending: {
        headline: "Your booking is confirmed",
        body: "We have registered your shipment and are preparing the first milestone. Live tracking is already available."
      },
      "In Transit": {
        headline: "Your freight is on the move",
        body: "The shipment is in transit. Open the live track page for map position, progress, and every timeline event."
      },
      Customs: {
        headline: "Customs clearance is underway",
        body: "Your shipment is with customs. We will notify you as soon as clearance completes, or if documents are required."
      },
      "On Hold": {
        headline: "Your shipment is on hold",
        body: "Movement is paused for now. We will update you as soon as the hold is released and transit resumes."
      },
      Delivered: {
        headline: "Delivered. Thank you for shipping with us.",
        body: "This shipment has reached its destination. Keep the tracking number for your records, and contact us if anything looks off."
      },
      Exception: {
        headline: "This shipment needs attention",
        body: "An exception has been logged. Our operations team is reviewing it \u2014 reply to this email or WhatsApp us so we can resolve it quickly."
      }
    };
    ADMIN_STATUS_COPY = {
      Pending: {
        headline: "Shipment is pending the next step",
        body: "Awaiting pickup or the first operational milestone. Confirm booking details if anything is still incomplete."
      },
      "In Transit": {
        headline: "Shipment is in transit",
        body: "Freight is moving on the booked route. Position and timeline remain live in admin."
      },
      Customs: {
        headline: "Shipment is at customs",
        body: "Review documentation readiness and carrier notices. Clearance delays should be flagged to the customer promptly."
      },
      "On Hold": {
        headline: "Shipment is on hold",
        body: "Transit is paused. Confirm the hold reason, next action, and keep the customer informed."
      },
      Delivered: {
        headline: "Shipment delivered",
        body: "Delivery is complete. Close the file in admin once proof of delivery is confirmed."
      },
      Exception: {
        headline: "Exception \u2014 action required",
        body: "This shipment is in exception. Review the latest event, escalate with the carrier, and keep the customer informed."
      }
    };
  }
});

// emails/components/Footer.tsx
function EmailFooter({ showUnsubscribe = false }) {
  const link = {
    color: BRAND.cobaltSoft,
    textDecoration: "none",
    fontWeight: 500
  };
  const muted = {
    color: BRAND.textMutedOnDark,
    textDecoration: "none"
  };
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("table", { width: "100%", cellPadding: 0, cellSpacing: 0, role: "presentation", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", { children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
      import_components.Text,
      {
        style: {
          margin: "0 0 6px",
          fontFamily: FONTS.display,
          fontSize: "15px",
          fontWeight: 700,
          letterSpacing: "-0.02em"
        },
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { color: BRAND.textOnDark }, children: "Quay" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { color: BRAND.cobalt }, children: "vox" })
        ]
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_components.Text,
      {
        style: {
          margin: "0 0 18px",
          fontSize: "12px",
          lineHeight: "18px",
          color: BRAND.textMutedOnDark
        },
        children: "Global freight visibility \u2014 ocean, air, rail, and road."
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_components.Text,
      {
        style: {
          margin: "0 0 6px",
          fontFamily: FONTS.mono,
          fontSize: "10px",
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: BRAND.textMutedOnDark
        },
        children: "Contact"
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_components.Text, { style: { margin: "0 0 16px", fontSize: "13px", lineHeight: "22px", color: BRAND.textMutedOnDark }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.Link, { href: CONTACT.mailtoHref, style: link, children: CONTACT.email }),
      "  \xB7  ",
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.Link, { href: CONTACT.telHref, style: link, children: CONTACT.phoneDisplay }),
      "  \xB7  ",
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.Link, { href: CONTACT.whatsappHref, style: link, children: "WhatsApp" })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_components.Text,
      {
        style: {
          margin: "0 0 6px",
          fontFamily: FONTS.mono,
          fontSize: "10px",
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: BRAND.textMutedOnDark
        },
        children: "Branches"
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.Text, { style: { margin: "0 0 20px", fontSize: "12px", lineHeight: "20px", color: BRAND.textMutedOnDark }, children: BRANCHES_LINE }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_components.Text, { style: { margin: 0, fontSize: "11px", lineHeight: "18px", color: BRAND.textMutedOnDark }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.Link, { href: appUrl("/privacy"), style: muted, children: "Privacy" }),
      "  \xB7  ",
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.Link, { href: appUrl("/terms"), style: muted, children: "Terms" }),
      showUnsubscribe ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
        "  \xB7  ",
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_components.Link, { href: appUrl("/contact"), style: muted, children: "Unsubscribe" })
      ] }) : null,
      "  \xB7  ",
      "\xA9 ",
      (/* @__PURE__ */ new Date()).getFullYear(),
      " Quayvox"
    ] })
  ] }) }) }) });
}
var import_components, import_jsx_runtime;
var init_Footer = __esm({
  "emails/components/Footer.tsx"() {
    "use strict";
    import_components = require("@react-email/components");
    init_constants();
    import_jsx_runtime = require("react/jsx-runtime");
  }
});

// emails/components/StatusBadge.tsx
function StatusBadge({
  status,
  onDark = false
}) {
  const colors = onDark ? STATUS_COLORS_ON_DARK[status] ?? STATUS_COLORS_ON_DARK.Pending : STATUS_COLORS[status] ?? STATUS_COLORS.Pending;
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
    "span",
    {
      style: {
        display: "inline-block",
        padding: "5px 11px",
        borderRadius: "999px",
        fontFamily: FONTS.mono,
        fontSize: "11px",
        fontWeight: 500,
        lineHeight: "16px",
        letterSpacing: "0.04em",
        backgroundColor: colors.bg,
        color: colors.text,
        border: `1px solid ${colors.border}`
      },
      children: status
    }
  );
}
function AudienceBadge({ label }) {
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
    import_components2.Text,
    {
      style: {
        margin: 0,
        display: "inline-block",
        padding: "5px 10px",
        borderRadius: "999px",
        fontFamily: FONTS.mono,
        fontSize: "10px",
        fontWeight: 500,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color: "#A5B4FC",
        border: "1px solid rgba(79, 109, 245, 0.38)",
        backgroundColor: "rgba(79, 109, 245, 0.12)"
      },
      children: label
    }
  );
}
var import_components2, import_jsx_runtime2;
var init_StatusBadge = __esm({
  "emails/components/StatusBadge.tsx"() {
    "use strict";
    import_components2 = require("@react-email/components");
    init_constants();
    import_jsx_runtime2 = require("react/jsx-runtime");
  }
});

// emails/components/Wordmark.tsx
function Wordmark({ size = 22 }) {
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
    import_components3.Text,
    {
      style: {
        margin: 0,
        fontFamily: FONTS.display,
        fontSize: `${size}px`,
        fontWeight: 700,
        lineHeight: `${size + 6}px`,
        letterSpacing: "-0.03em"
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { style: { color: BRAND.textOnDark }, children: "Quay" }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { style: { color: BRAND.cobalt }, children: "vox" })
      ]
    }
  );
}
var import_components3, import_jsx_runtime3;
var init_Wordmark = __esm({
  "emails/components/Wordmark.tsx"() {
    "use strict";
    import_components3 = require("@react-email/components");
    init_constants();
    import_jsx_runtime3 = require("react/jsx-runtime");
  }
});

// emails/styles.ts
var s;
var init_styles = __esm({
  "emails/styles.ts"() {
    "use strict";
    init_constants();
    s = {
      body: {
        margin: 0,
        padding: 0,
        backgroundColor: BRAND.bgCanvas,
        fontFamily: FONTS.body,
        WebkitFontSmoothing: "antialiased"
      },
      outerPad: {
        padding: "32px 12px 48px"
      },
      container: {
        maxWidth: "600px",
        margin: "0 auto",
        backgroundColor: BRAND.navyHeader,
        borderRadius: "20px",
        overflow: "hidden",
        border: `1px solid ${BRAND.borderOnDark}`
      },
      header: {
        backgroundColor: BRAND.navyHeader,
        padding: "28px 36px 8px"
      },
      hero: {
        backgroundColor: BRAND.navyHeader,
        padding: "8px 36px 32px"
      },
      accentBar: {
        height: "3px",
        lineHeight: "3px",
        fontSize: "0"
      },
      bodyCard: {
        backgroundColor: BRAND.surface,
        padding: "32px 36px 28px"
      },
      footer: {
        backgroundColor: BRAND.navyDark,
        padding: "28px 36px 32px",
        borderTop: `1px solid ${BRAND.borderOnDark}`
      },
      eyebrow: {
        margin: "0 0 10px",
        fontFamily: FONTS.mono,
        fontSize: "11px",
        fontWeight: 500,
        letterSpacing: "0.16em",
        textTransform: "uppercase",
        color: BRAND.cobaltSoft
      },
      headline: {
        margin: "0 0 12px",
        fontFamily: FONTS.display,
        fontSize: "26px",
        lineHeight: "34px",
        fontWeight: 700,
        letterSpacing: "-0.03em",
        color: BRAND.textOnDark
      },
      subhead: {
        margin: "0 0 18px",
        fontSize: "15px",
        lineHeight: "24px",
        color: BRAND.textMutedOnDark
      },
      bodyText: {
        margin: "0 0 16px",
        fontSize: "15px",
        lineHeight: "24px",
        color: BRAND.textSecondary
      },
      bodyTitle: {
        margin: "0 0 10px",
        fontFamily: FONTS.display,
        fontSize: "16px",
        lineHeight: "22px",
        fontWeight: 600,
        color: BRAND.textPrimary
      },
      tracking: {
        fontFamily: FONTS.mono,
        fontSize: "13px",
        letterSpacing: "0.04em",
        color: BRAND.textOnDark
      },
      label: {
        fontFamily: FONTS.mono,
        fontSize: "10px",
        fontWeight: 500,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color: BRAND.textSecondary
      }
    };
  }
});

// emails/layout/QuayvoxLayout.tsx
function QuayvoxLayout({
  preview,
  audience = "customer",
  tone = "default",
  eyebrow,
  headline,
  subhead,
  headerMeta,
  children,
  showUnsubscribe = false
}) {
  const accent = TONE_ACCENT[tone];
  const audienceLabel = audience === "admin" ? "Operations" : "Tracking";
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_components4.Html, { lang: "en", children: [
    /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_components4.Head, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("meta", { name: "color-scheme", content: "light dark" }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("meta", { name: "supported-color-schemes", content: "light dark" })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_components4.Preview, { children: preview }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_components4.Body, { style: s.body, children: /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_components4.Section, { style: s.outerPad, children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_components4.Container, { style: s.container, children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_components4.Section, { style: s.header, children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("table", { width: "100%", cellPadding: 0, cellSpacing: 0, role: "presentation", children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("tbody", { children: /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("tr", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("td", { align: "left", valign: "middle", children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Wordmark, {}) }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("td", { align: "right", valign: "middle", children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(AudienceBadge, { label: audienceLabel }) })
        ] }) }) }) }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_components4.Section, { style: s.hero, children: [
          eyebrow ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_components4.Text, { style: { ...s.eyebrow, color: accent }, children: eyebrow }) : null,
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
            import_components4.Text,
            {
              style: {
                ...s.headline,
                color: tone === "danger" ? "#FCA5A5" : BRAND.textOnDark
              },
              children: headline
            }
          ),
          subhead ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_components4.Text, { style: s.subhead, children: subhead }) : null,
          headerMeta ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("table", { cellPadding: 0, cellSpacing: 0, role: "presentation", children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("tbody", { children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("td", { children: headerMeta }) }) }) }) : null
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_components4.Section, { style: { ...s.accentBar, backgroundColor: accent }, children: "\xA0" }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_components4.Section, { style: s.bodyCard, children }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_components4.Section, { style: s.footer, children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(EmailFooter, { showUnsubscribe }) })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
        import_components4.Text,
        {
          style: {
            margin: "16px 0 0",
            textAlign: "center",
            fontFamily: FONTS.body,
            fontSize: "11px",
            color: BRAND.textMutedOnDark
          },
          children: "This is a transactional message from Quayvox."
        }
      )
    ] }) })
  ] });
}
var import_components4, import_jsx_runtime4;
var init_QuayvoxLayout = __esm({
  "emails/layout/QuayvoxLayout.tsx"() {
    "use strict";
    import_components4 = require("@react-email/components");
    init_constants();
    init_Footer();
    init_StatusBadge();
    init_Wordmark();
    init_styles();
    import_jsx_runtime4 = require("react/jsx-runtime");
  }
});

// emails/components/CtaButton.tsx
function CtaButton({
  href,
  label,
  variant = "primary"
}) {
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
    import_components5.Button,
    {
      href,
      style: {
        ...variants[variant],
        display: "inline-block",
        padding: "14px 26px",
        borderRadius: "12px",
        fontFamily: FONTS.body,
        fontSize: "14px",
        fontWeight: 600,
        lineHeight: "20px",
        textDecoration: "none",
        textAlign: "center"
      },
      children: label
    }
  );
}
function CtaRow({ children }) {
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("table", { width: "100%", cellPadding: 0, cellSpacing: 0, role: "presentation", style: { margin: "4px 0 8px" }, children: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("tbody", { children: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("td", { align: "left", style: { padding: "0 8px 12px 0" }, children }) }) }) });
}
var import_components5, import_jsx_runtime5, variants;
var init_CtaButton = __esm({
  "emails/components/CtaButton.tsx"() {
    "use strict";
    import_components5 = require("@react-email/components");
    init_constants();
    import_jsx_runtime5 = require("react/jsx-runtime");
    variants = {
      primary: {
        backgroundColor: BRAND.cobalt,
        color: "#FFFFFF",
        border: `1px solid ${BRAND.cobalt}`
      },
      secondary: {
        backgroundColor: "#FFFFFF",
        color: BRAND.textPrimary,
        border: `1px solid ${BRAND.border}`
      },
      danger: {
        backgroundColor: BRAND.error,
        color: "#FFFFFF",
        border: `1px solid ${BRAND.error}`
      }
    };
  }
});

// emails/components/ShipmentFacts.tsx
function displayMetricValue(value) {
  if (value == null || value === "") return "TBC";
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? "TBC" : value.toISOString().slice(0, 10);
  }
  return String(value);
}
function Metric({ label, value }) {
  return /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("td", { width: "50%", valign: "top", style: { padding: "0 6px 12px" }, children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
    "table",
    {
      width: "100%",
      cellPadding: 0,
      cellSpacing: 0,
      role: "presentation",
      style: {
        backgroundColor: BRAND.bgLight,
        borderRadius: "12px",
        border: `1px solid ${BRAND.border}`
      },
      children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("tbody", { children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("td", { style: { padding: "14px 16px" }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
          import_components6.Text,
          {
            style: {
              margin: "0 0 4px",
              fontFamily: FONTS.mono,
              fontSize: "10px",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: BRAND.textSecondary
            },
            children: label
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
          import_components6.Text,
          {
            style: {
              margin: 0,
              fontFamily: FONTS.display,
              fontSize: "14px",
              fontWeight: 600,
              lineHeight: "20px",
              color: BRAND.textPrimary
            },
            children: value
          }
        )
      ] }) }) })
    }
  ) });
}
function MetricGrid({
  shipment,
  extra
}) {
  const items = [
    { label: "Item", value: displayMetricValue(shipment.itemName) },
    { label: "Mode", value: displayMetricValue(shipment.mode) },
    { label: "Carrier", value: displayMetricValue(shipment.carrier) },
    { label: "Priority", value: displayMetricValue(shipment.priority) },
    { label: "ETA", value: displayMetricValue(shipment.eta) },
    ...(extra ?? []).map((item) => ({
      label: item.label,
      value: displayMetricValue(item.value)
    }))
  ];
  const rows = [];
  for (let i = 0; i < items.length; i += 2) {
    rows.push(items.slice(i, i + 2));
  }
  return /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("table", { width: "100%", cellPadding: 0, cellSpacing: 0, role: "presentation", style: { margin: "0 0 8px" }, children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("tbody", { children: rows.map((row, idx) => /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("tr", { children: [
    row.map((item) => /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(Metric, { label: item.label, value: item.value }, item.label)),
    row.length === 1 ? /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("td", { width: "50%" }) : null
  ] }, idx)) }) });
}
function Callout({
  title,
  body,
  tone = "default"
}) {
  const border = tone === "danger" ? BRAND.error : BRAND.cobalt;
  const bg = tone === "danger" ? "#FEF2F2" : BRAND.bgLight;
  return /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
    "table",
    {
      width: "100%",
      cellPadding: 0,
      cellSpacing: 0,
      role: "presentation",
      style: {
        margin: "0 0 20px",
        backgroundColor: bg,
        borderRadius: "12px",
        borderLeft: `4px solid ${border}`
      },
      children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("tbody", { children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("td", { style: { padding: "14px 18px" }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
          import_components6.Text,
          {
            style: {
              margin: "0 0 4px",
              fontFamily: FONTS.mono,
              fontSize: "10px",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: tone === "danger" ? BRAND.error : BRAND.textSecondary
            },
            children: title
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
          import_components6.Text,
          {
            style: {
              margin: 0,
              fontSize: "14px",
              lineHeight: "22px",
              color: BRAND.textPrimary,
              whiteSpace: "pre-wrap"
            },
            children: body
          }
        )
      ] }) }) })
    }
  );
}
var import_components6, import_jsx_runtime6;
var init_ShipmentFacts = __esm({
  "emails/components/ShipmentFacts.tsx"() {
    "use strict";
    import_components6 = require("@react-email/components");
    init_constants();
    import_jsx_runtime6 = require("react/jsx-runtime");
  }
});

// emails/templates/SystemEmails.tsx
var SystemEmails_exports = {};
__export(SystemEmails_exports, {
  AdminEmailDeliveryFailed: () => AdminEmailDeliveryFailed
});
function AdminEmailDeliveryFailed({
  template,
  recipient,
  trackingNumber,
  errorMessage
}) {
  return /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)(
    QuayvoxLayout,
    {
      preview: "A transactional email failed to send",
      audience: "admin",
      tone: "danger",
      eyebrow: "Delivery failure",
      headline: "A customer email did not send",
      subhead: "Resend rejected or failed this message. Check the recipient, domain verification, and the error below.",
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(Callout, { title: "Template", body: template, tone: "danger" }),
        /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(Callout, { title: "Recipient", body: recipient }),
        trackingNumber ? /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(Callout, { title: "Tracking", body: trackingNumber }) : null,
        errorMessage ? /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(Callout, { title: "Error", body: errorMessage, tone: "danger" }) : null,
        /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(CtaRow, { children: /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(CtaButton, { href: appUrl("/admin"), label: "Open admin", variant: "danger" }) })
      ]
    }
  );
}
var import_jsx_runtime11;
var init_SystemEmails = __esm({
  "emails/templates/SystemEmails.tsx"() {
    "use strict";
    init_constants();
    init_QuayvoxLayout();
    init_CtaButton();
    init_ShipmentFacts();
    import_jsx_runtime11 = require("react/jsx-runtime");
  }
});

// server/entry.ts
var entry_exports = {};
__export(entry_exports, {
  default: () => handler
});
module.exports = __toCommonJS(entry_exports);

// api/_lib/handlers/auth.ts
var import_zod = require("zod");

// api/_lib/auth.ts
var import_crypto = __toESM(require("crypto"));
var import_bcryptjs = __toESM(require("bcryptjs"));
var COOKIE_NAME = "qv_session";
var MAX_AGE_SEC = 60 * 60 * 24 * 7;
function isAuthConfigured() {
  return Boolean(
    process.env.AUTH_SECRET && process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD_HASH
  );
}
function isServerConfigured() {
  return isAuthConfigured() && Boolean(process.env.DATABASE_URL);
}
function sign(body) {
  return import_crypto.default.createHmac("sha256", process.env.AUTH_SECRET).update(body).digest("base64url");
}
function signSession(email) {
  const payload = JSON.stringify({
    email,
    exp: Math.floor(Date.now() / 1e3) + MAX_AGE_SEC
  });
  const body = Buffer.from(payload).toString("base64url");
  return `${body}.${sign(body)}`;
}
function verifySession(token) {
  if (!process.env.AUTH_SECRET) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = sign(body);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !import_crypto.default.timingSafeEqual(a, b)) return null;
  try {
    const data = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    if (!data.email || !data.exp || data.exp < Math.floor(Date.now() / 1e3)) return null;
    return { email: data.email };
  } catch {
    return null;
  }
}
function parseCookies(req) {
  const header = req.headers.cookie;
  if (!header) return {};
  return Object.fromEntries(
    header.split(";").map((part) => {
      const [k, ...rest] = part.trim().split("=");
      return [k, decodeURIComponent(rest.join("=") || "")];
    })
  );
}
function getSession(req) {
  const token = parseCookies(req)[COOKIE_NAME];
  if (!token) return null;
  return verifySession(token);
}
function requireAdmin(req, res) {
  const session = getSession(req);
  if (!session) {
    res.status(401).json({ error: "Unauthorized" });
    return null;
  }
  return session;
}
function cookieFlags() {
  const parts = ["Path=/", "HttpOnly", "SameSite=Lax", `Max-Age=${MAX_AGE_SEC}`];
  if (process.env.VERCEL_ENV === "production") parts.push("Secure");
  return parts.join("; ");
}
function setSessionCookie(res, token) {
  res.setHeader("Set-Cookie", `${COOKIE_NAME}=${encodeURIComponent(token)}; ${cookieFlags()}`);
}
function clearSessionCookie(res) {
  const parts = ["Path=/", "HttpOnly", "SameSite=Lax", "Max-Age=0"];
  if (process.env.VERCEL_ENV === "production") parts.push("Secure");
  res.setHeader("Set-Cookie", `${COOKIE_NAME}=; ${parts.join("; ")}`);
}
async function verifyAdminPassword(email, password) {
  const adminEmail = process.env.ADMIN_EMAIL;
  const hash = (process.env.ADMIN_PASSWORD_HASH || "").replace(/^['"]|['"]$/g, "");
  if (!hash) return false;
  if (email.trim().toLowerCase() !== adminEmail.trim().toLowerCase()) return false;
  return import_bcryptjs.default.compare(password, hash);
}

// api/_lib/db.ts
var import_serverless = require("@neondatabase/serverless");
function isDbConfigured() {
  return Boolean(process.env.DATABASE_URL);
}
function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not configured");
  }
  return (0, import_serverless.neon)(url);
}

// api/_lib/http.ts
function setCors(res, methods) {
  res.setHeader("Access-Control-Allow-Origin", process.env.PUBLIC_APP_URL || "*");
  res.setHeader("Access-Control-Allow-Methods", methods);
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Credentials", "true");
}
function handleOptions(req, res, methods) {
  setCors(res, methods);
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return true;
  }
  return false;
}

// api/_lib/handlers/auth.ts
async function handleAuthMe(req, res) {
  if (handleOptions(req, res, "GET, OPTIONS")) return;
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  const configured = isServerConfigured();
  if (!configured) {
    res.status(503).json({
      configured: false,
      authConfigured: isAuthConfigured(),
      dbConfigured: isDbConfigured(),
      user: null,
      role: null
    });
    return;
  }
  const session = getSession(req);
  if (!session) {
    res.status(200).json({
      configured: true,
      user: null,
      role: null
    });
    return;
  }
  res.status(200).json({
    configured: true,
    user: { email: session.email },
    role: "admin"
  });
}
var loginSchema = import_zod.z.object({
  email: import_zod.z.string().trim().email(),
  password: import_zod.z.string().min(1).max(200)
});
async function handleAuthLogin(req, res) {
  if (handleOptions(req, res, "POST, OPTIONS")) return;
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  if (!isAuthConfigured()) {
    res.status(503).json({
      error: "Auth is not configured",
      configured: false
    });
    return;
  }
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid credentials payload" });
    return;
  }
  const { email, password } = parsed.data;
  const ok = await verifyAdminPassword(email, password);
  if (!ok) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }
  const token = signSession(email.trim().toLowerCase());
  setSessionCookie(res, token);
  res.status(200).json({
    ok: true,
    user: { email: email.trim().toLowerCase() },
    role: "admin"
  });
}
async function handleAuthLogout(req, res) {
  if (handleOptions(req, res, "POST, OPTIONS")) return;
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  clearSessionCookie(res);
  res.status(200).json({ ok: true });
}

// api/_lib/handlers/contact.ts
var import_zod2 = require("zod");

// emails/templates/ContactEmails.tsx
var import_components7 = require("@react-email/components");
init_constants();
init_QuayvoxLayout();
init_CtaButton();
init_ShipmentFacts();
var import_jsx_runtime7 = require("react/jsx-runtime");
function IdentityRow({ label, value }) {
  return /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("tr", { children: [
    /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
      "td",
      {
        style: {
          padding: "10px 0",
          width: "34%",
          fontFamily: FONTS.mono,
          fontSize: "10px",
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: BRAND.textSecondary,
          verticalAlign: "top"
        },
        children: label
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
      "td",
      {
        style: {
          padding: "10px 0",
          fontFamily: FONTS.body,
          fontSize: "14px",
          fontWeight: 500,
          color: BRAND.textPrimary,
          verticalAlign: "top"
        },
        children: value
      }
    )
  ] });
}
function CustomerContactConfirmation({ data }) {
  return /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)(
    QuayvoxLayout,
    {
      preview: "We received your message \u2014 the Quayvox team will reply shortly",
      audience: "customer",
      tone: "default",
      eyebrow: "Message received",
      headline: `Thanks, ${data.name.split(" ")[0] || data.name}.`,
      subhead: "A member of the Quayvox team will reply by email. If this is time-critical, call or WhatsApp us using the details below.",
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(Callout, { title: "Your message", body: data.message }),
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(CtaRow, { children: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(CtaButton, { href: appUrl("/track"), label: "Track a shipment" }) }),
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(CtaRow, { children: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(CtaButton, { href: CONTACT.whatsappHref, label: "WhatsApp the team", variant: "secondary" }) }),
        /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)(import_components7.Text, { style: { margin: "0 0 24px", fontSize: "13px", lineHeight: "20px", color: BRAND.textSecondary }, children: [
          CONTACT.email,
          " \xB7 ",
          CONTACT.phoneDisplay
        ] })
      ]
    }
  );
}
function AdminContactReceived({ data }) {
  return /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)(
    QuayvoxLayout,
    {
      preview: `New contact from ${data.name}${data.company ? ` \xB7 ${data.company}` : ""}`,
      audience: "admin",
      tone: "default",
      eyebrow: "New inquiry",
      headline: "A visitor wrote in from quayvox.com",
      subhead: "Reply from this thread to keep the conversation in one place.",
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
          "table",
          {
            width: "100%",
            cellPadding: 0,
            cellSpacing: 0,
            role: "presentation",
            style: {
              margin: "0 0 16px",
              backgroundColor: BRAND.bgLight,
              borderRadius: "14px",
              border: `1px solid ${BRAND.border}`
            },
            children: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("tbody", { children: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("td", { style: { padding: "8px 20px" }, children: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("table", { width: "100%", cellPadding: 0, cellSpacing: 0, role: "presentation", children: /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("tbody", { children: [
              /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(IdentityRow, { label: "Name", value: data.name }),
              /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(IdentityRow, { label: "Email", value: data.email }),
              data.company ? /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(IdentityRow, { label: "Company", value: data.company }) : null
            ] }) }) }) }) })
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(Callout, { title: "Message", body: data.message }),
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(CtaRow, { children: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(CtaButton, { href: `mailto:${data.email}`, label: "Reply to sender" }) })
      ]
    }
  );
}

// emails/templates/ShipmentEmails.tsx
var import_components10 = require("@react-email/components");
init_constants();
init_QuayvoxLayout();
init_CtaButton();
init_ShipmentFacts();

// emails/components/ProgressBar.tsx
var import_components8 = require("@react-email/components");
init_constants();
var import_jsx_runtime8 = require("react/jsx-runtime");
function ProgressBar({
  progress,
  accent = BRAND.cobalt
}) {
  const pct = Math.max(0, Math.min(100, Math.round(progress)));
  const rest = 100 - pct;
  return /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("table", { width: "100%", cellPadding: 0, cellSpacing: 0, role: "presentation", style: { margin: "0 0 20px" }, children: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("tbody", { children: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("td", { children: [
    /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("table", { width: "100%", cellPadding: 0, cellSpacing: 0, role: "presentation", children: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("tbody", { children: /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("tr", { children: [
      /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
        import_components8.Text,
        {
          style: {
            margin: 0,
            fontFamily: FONTS.mono,
            fontSize: "10px",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: BRAND.textSecondary
          },
          children: "Progress"
        }
      ) }),
      /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("td", { align: "right", children: /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)(
        import_components8.Text,
        {
          style: {
            margin: 0,
            fontFamily: FONTS.mono,
            fontSize: "12px",
            fontWeight: 500,
            color: BRAND.textPrimary
          },
          children: [
            pct,
            "%"
          ]
        }
      ) })
    ] }) }) }),
    /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
      "table",
      {
        width: "100%",
        cellPadding: 0,
        cellSpacing: 0,
        role: "presentation",
        style: { marginTop: "8px", borderRadius: "999px", overflow: "hidden" },
        children: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("tbody", { children: /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("tr", { children: [
          pct > 0 ? /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
            "td",
            {
              width: `${pct}%`,
              height: 8,
              style: {
                backgroundColor: accent,
                height: "8px",
                fontSize: 0,
                lineHeight: "8px"
              },
              children: "\xA0"
            }
          ) : null,
          rest > 0 ? /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
            "td",
            {
              width: `${rest}%`,
              height: 8,
              style: {
                backgroundColor: BRAND.border,
                height: "8px",
                fontSize: 0,
                lineHeight: "8px"
              },
              children: "\xA0"
            }
          ) : null
        ] }) })
      }
    )
  ] }) }) }) });
}

// emails/components/RouteCard.tsx
var import_components9 = require("@react-email/components");
init_constants();
var import_jsx_runtime9 = require("react/jsx-runtime");
function cityLine(place) {
  const [city, ...rest] = place.split(",").map((p) => p.trim());
  return { city: city || place, rest: rest.join(", ") };
}
function RouteCard({ origin, destination }) {
  const from = cityLine(origin);
  const to = cityLine(destination);
  return /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
    "table",
    {
      width: "100%",
      cellPadding: 0,
      cellSpacing: 0,
      role: "presentation",
      style: {
        margin: "0 0 16px",
        backgroundColor: BRAND.bgLight,
        borderRadius: "14px",
        border: `1px solid ${BRAND.border}`
      },
      children: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("tbody", { children: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("td", { style: { padding: "20px 22px 18px" }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("table", { width: "100%", cellPadding: 0, cellSpacing: 0, role: "presentation", children: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("tbody", { children: /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("tr", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("td", { width: "46%", valign: "top", children: [
            /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
              import_components9.Text,
              {
                style: {
                  margin: "0 0 4px",
                  fontFamily: FONTS.mono,
                  fontSize: "10px",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: BRAND.textSecondary
                },
                children: "Origin"
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
              import_components9.Text,
              {
                style: {
                  margin: 0,
                  fontFamily: FONTS.display,
                  fontSize: "16px",
                  fontWeight: 600,
                  lineHeight: "22px",
                  color: BRAND.textPrimary
                },
                children: from.city
              }
            ),
            from.rest ? /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(import_components9.Text, { style: { margin: "2px 0 0", fontSize: "12px", color: BRAND.textSecondary }, children: from.rest }) : null
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("td", { width: "8%", align: "center", valign: "middle", children: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
            import_components9.Text,
            {
              style: {
                margin: 0,
                fontSize: "18px",
                color: BRAND.cobalt,
                lineHeight: "18px"
              },
              children: "\u2192"
            }
          ) }),
          /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("td", { width: "46%", align: "right", valign: "top", children: [
            /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
              import_components9.Text,
              {
                style: {
                  margin: "0 0 4px",
                  fontFamily: FONTS.mono,
                  fontSize: "10px",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: BRAND.textSecondary
                },
                children: "Destination"
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
              import_components9.Text,
              {
                style: {
                  margin: 0,
                  fontFamily: FONTS.display,
                  fontSize: "16px",
                  fontWeight: 600,
                  lineHeight: "22px",
                  color: BRAND.textPrimary
                },
                children: to.city
              }
            ),
            to.rest ? /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(import_components9.Text, { style: { margin: "2px 0 0", fontSize: "12px", color: BRAND.textSecondary }, children: to.rest }) : null
          ] })
        ] }) }) }),
        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("table", { width: "100%", cellPadding: 0, cellSpacing: 0, role: "presentation", style: { marginTop: "16px" }, children: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("tbody", { children: /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("tr", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("td", { width: "12", height: "12", bgcolor: BRAND.cobalt, style: { borderRadius: "50%", fontSize: 0, lineHeight: "12px" }, children: "\xA0" }),
          /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("td", { height: "12", style: { padding: "0 6px" }, children: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("table", { width: "100%", cellPadding: 0, cellSpacing: 0, role: "presentation", children: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("tbody", { children: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("td", { height: "2", bgcolor: BRAND.cobalt, style: { fontSize: 0, lineHeight: "2px" }, children: "\xA0" }) }) }) }) }),
          /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
            "td",
            {
              width: "12",
              height: "12",
              bgcolor: "#FFFFFF",
              style: {
                borderRadius: "50%",
                border: `2px solid ${BRAND.cobalt}`,
                fontSize: 0,
                lineHeight: "12px"
              },
              children: "\xA0"
            }
          )
        ] }) }) })
      ] }) }) })
    }
  );
}

// emails/templates/ShipmentEmails.tsx
init_StatusBadge();
var import_jsx_runtime10 = require("react/jsx-runtime");
function customerEyebrow(ctx) {
  switch (ctx.kind) {
    case "created":
      return "Booking confirmed";
    case "location":
      return "Live position";
    case "eta":
      return "Schedule change";
    case "timeline":
      return "Milestone";
    case "status":
      return ctx.shipment.status;
    default:
      return "Shipment update";
  }
}
function headlineForCustomer(ctx) {
  switch (ctx.kind) {
    case "created":
      return "Your shipment is ready to track";
    case "location":
      return "A new location has been logged";
    case "eta":
      return "The estimated arrival has changed";
    case "timeline":
      return "A new milestone was added";
    case "status":
      return copyForStatus(CUSTOMER_STATUS_COPY, ctx.shipment.status).headline;
    default:
      return "Your shipment was updated";
  }
}
function bodyForCustomer(ctx) {
  switch (ctx.kind) {
    case "created":
      return "Tracking is now live. Use the page below for map position, progress, and every event on this booking.";
    case "location": {
      const label = ctx.shipment.positionLabel || ctx.eventLocation;
      return label ? `Latest reported position: ${label}. Open the live map for the full trail.` : "The live map position was updated. Open your track page for the latest location.";
    }
    case "eta":
      return `Estimated arrival moved from ${ctx.previousEta ?? "TBC"} to ${ctx.shipment.eta ?? "TBC"}. We will keep you posted if it changes again.`;
    case "timeline":
      return ctx.eventMessage || "A new event was added to your shipment timeline.";
    case "status":
      return copyForStatus(CUSTOMER_STATUS_COPY, ctx.shipment.status).body;
    default:
      return "View the latest details on your track page.";
  }
}
function adminEyebrow(ctx) {
  switch (ctx.kind) {
    case "created":
      return "New booking";
    case "location":
      return "Position update";
    case "eta":
      return "ETA change";
    case "timeline":
      return "Timeline event";
    case "status":
      return `Status \xB7 ${ctx.shipment.status}`;
    default:
      return "Operations";
  }
}
function headlineForAdmin(ctx) {
  switch (ctx.kind) {
    case "created":
      return "A new shipment was created";
    case "location":
      return "Map position was updated";
    case "eta":
      return "ETA was revised";
    case "timeline":
      return "A timeline event was logged";
    case "status":
      return copyForStatus(ADMIN_STATUS_COPY, ctx.shipment.status).headline;
    default:
      return "Shipment updated";
  }
}
function bodyForAdmin(ctx) {
  switch (ctx.kind) {
    case "created":
      return "Review route, customer email, and the opening status. Tracking is already available to the customer if an email was provided.";
    case "location": {
      const label = ctx.shipment.positionLabel || ctx.eventLocation;
      const coords = ctx.shipment.currentLat != null && ctx.shipment.currentLng != null ? `${ctx.shipment.currentLat.toFixed(4)}, ${ctx.shipment.currentLng.toFixed(4)}` : null;
      return [label, coords].filter(Boolean).join(" \xB7 ") || "Map position was updated in admin.";
    }
    case "eta":
      return `ETA changed from ${ctx.previousEta ?? "TBC"} to ${ctx.shipment.eta ?? "TBC"}.`;
    case "timeline":
      return ctx.eventMessage || "A timeline event was recorded.";
    case "status": {
      const prev = ctx.previousStatus ? `Previous status: ${ctx.previousStatus}. ` : "";
      return `${prev}${copyForStatus(ADMIN_STATUS_COPY, ctx.shipment.status).body}`;
    }
    default:
      return "Open admin to review this shipment.";
  }
}
function extraMetrics(ctx) {
  const rows = [];
  if (ctx.kind === "location") {
    if (ctx.shipment.positionLabel || ctx.eventLocation) {
      rows.push({ label: "Location", value: ctx.shipment.positionLabel || ctx.eventLocation || "\u2014" });
    }
    if (ctx.shipment.currentLat != null && ctx.shipment.currentLng != null) {
      rows.push({
        label: "Coordinates",
        value: `${ctx.shipment.currentLat.toFixed(4)}, ${ctx.shipment.currentLng.toFixed(4)}`
      });
    }
  }
  if (ctx.kind === "timeline" && ctx.eventLocation) {
    rows.push({ label: "Event location", value: ctx.eventLocation });
  }
  return rows;
}
function toneForContext(ctx) {
  if (ctx.kind === "status" || ctx.shipment.status === "Exception") {
    return toneForStatus(ctx.shipment.status);
  }
  if (ctx.kind === "eta") return "warning";
  if (ctx.kind === "created") return "default";
  return "default";
}
function HeaderMeta({
  status,
  trackingNumber
}) {
  return /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("table", { cellPadding: 0, cellSpacing: 0, role: "presentation", children: /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("tbody", { children: /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("tr", { children: [
    /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("td", { valign: "middle", style: { paddingRight: "10px" }, children: /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(StatusBadge, { status, onDark: true }) }),
    /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("td", { valign: "middle", children: /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
      import_components10.Text,
      {
        style: {
          margin: 0,
          fontFamily: FONTS.mono,
          fontSize: "13px",
          letterSpacing: "0.04em",
          color: BRAND.textOnDark
        },
        children: trackingNumber
      }
    ) })
  ] }) }) });
}
function ShipmentBody({
  ctx,
  isAdmin
}) {
  const isException = ctx.shipment.status === "Exception" && ctx.kind === "status";
  const accent = toneForStatus(ctx.shipment.status);
  const accentColor = accent === "success" ? BRAND.success : accent === "danger" ? BRAND.error : accent === "warning" ? BRAND.warning : accent === "customs" ? BRAND.purple : BRAND.cobalt;
  return /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)(import_jsx_runtime10.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(RouteCard, { origin: ctx.shipment.origin, destination: ctx.shipment.destination }),
    /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(ProgressBar, { progress: ctx.shipment.progress, accent: accentColor }),
    ctx.kind === "timeline" && ctx.eventMessage ? /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(Callout, { title: "Latest event", body: ctx.eventMessage }) : null,
    isAdmin && ctx.shipment.customerEmail ? /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(Callout, { title: "Customer email", body: ctx.shipment.customerEmail }) : null,
    isException ? /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
      Callout,
      {
        title: "Exception",
        body: isAdmin ? bodyForAdmin(ctx) : bodyForCustomer(ctx),
        tone: "danger"
      }
    ) : null,
    /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(MetricGrid, { shipment: ctx.shipment, extra: extraMetrics(ctx) }),
    isAdmin ? /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(CtaRow, { children: /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
      CtaButton,
      {
        href: adminShipmentUrl(ctx.shipment.id),
        label: "Open in admin",
        variant: isException ? "danger" : "primary"
      }
    ) }) : /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)(import_jsx_runtime10.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(CtaRow, { children: /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
        CtaButton,
        {
          href: trackUrl(ctx.shipment.trackingNumber),
          label: "Track shipment",
          variant: isException ? "danger" : "primary"
        }
      ) }),
      isException ? /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(CtaRow, { children: /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(CtaButton, { href: CONTACT.whatsappHref, label: "WhatsApp support", variant: "secondary" }) }) : /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)(
        import_components10.Text,
        {
          style: {
            margin: "0 0 24px",
            fontSize: "13px",
            lineHeight: "20px",
            color: BRAND.textSecondary
          },
          children: [
            "Questions? ",
            CONTACT.email,
            " \xB7 ",
            CONTACT.phoneDisplay
          ]
        }
      )
    ] })
  ] });
}
function CustomerShipmentEmail({ ctx }) {
  const preview = `${ctx.shipment.trackingNumber} \u2014 ${headlineForCustomer(ctx)}`;
  return /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
    QuayvoxLayout,
    {
      preview,
      audience: "customer",
      tone: toneForContext(ctx),
      eyebrow: customerEyebrow(ctx),
      headline: headlineForCustomer(ctx),
      subhead: ctx.kind === "status" && ctx.shipment.status === "Exception" ? void 0 : bodyForCustomer(ctx),
      headerMeta: /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(HeaderMeta, { status: ctx.shipment.status, trackingNumber: ctx.shipment.trackingNumber }),
      children: /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(ShipmentBody, { ctx, isAdmin: false })
    }
  );
}
function AdminShipmentEmail({ ctx }) {
  const preview = `[Admin] ${ctx.shipment.trackingNumber} \u2014 ${headlineForAdmin(ctx)}`;
  return /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
    QuayvoxLayout,
    {
      preview,
      audience: "admin",
      tone: toneForContext(ctx),
      eyebrow: adminEyebrow(ctx),
      headline: headlineForAdmin(ctx),
      subhead: ctx.kind === "status" && ctx.shipment.status === "Exception" ? void 0 : bodyForAdmin(ctx),
      headerMeta: /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(HeaderMeta, { status: ctx.shipment.status, trackingNumber: ctx.shipment.trackingNumber }),
      children: /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(ShipmentBody, { ctx, isAdmin: true })
    }
  );
}
function customerShipmentSubject(ctx) {
  const tn = ctx.shipment.trackingNumber;
  switch (ctx.kind) {
    case "created":
      return `Tracking ready \u2014 ${tn}`;
    case "location":
      return `Location update \u2014 ${tn}`;
    case "eta":
      return `ETA revised \u2014 ${tn}`;
    case "timeline":
      return `Shipment update \u2014 ${tn}`;
    case "status":
      return `${tn} is now ${ctx.shipment.status}`;
    default:
      return `Shipment update \u2014 ${tn}`;
  }
}
function adminShipmentSubject(ctx) {
  const tn = ctx.shipment.trackingNumber;
  const urgent = ctx.shipment.status === "Exception" ? "\u26A0 " : "";
  switch (ctx.kind) {
    case "created":
      return `${urgent}[Admin] New shipment ${tn}`;
    case "location":
      return `${urgent}[Admin] Position updated \u2014 ${tn}`;
    case "eta":
      return `${urgent}[Admin] ETA changed \u2014 ${tn}`;
    case "timeline":
      return `${urgent}[Admin] Timeline event \u2014 ${tn}`;
    case "status":
      return `${urgent}[Admin] ${tn} \u2192 ${ctx.shipment.status}`;
    default:
      return `${urgent}[Admin] Shipment update \u2014 ${tn}`;
  }
}

// api/_lib/mail.ts
var import_resend = require("resend");
var import_render = require("@react-email/render");
function fromAddress() {
  return process.env.RESEND_FROM_EMAIL || "Quayvox <info@quayvox.com>";
}
function isMailConfigured() {
  return Boolean(process.env.RESEND_API_KEY);
}
function adminNotifyEmail() {
  return process.env.ADMIN_EMAIL || process.env.CONTACT_TO_EMAIL || null;
}
async function sendEmail(options) {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    return { ok: true, emailSent: false, error: "RESEND_API_KEY missing" };
  }
  const to = Array.isArray(options.to) ? options.to : [options.to];
  if (!to.length || !to[0]) {
    return { ok: false, emailSent: false, error: "No recipient" };
  }
  try {
    const html = await (0, import_render.render)(options.react);
    const resend = new import_resend.Resend(resendKey);
    const result = await resend.emails.send({
      from: fromAddress(),
      to,
      subject: options.subject,
      html,
      replyTo: options.replyTo
    });
    if (result.error) {
      return { ok: false, emailSent: false, error: result.error.message };
    }
    return { ok: true, emailSent: true, id: result.data?.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to send email";
    console.error("sendEmail", err);
    return { ok: false, emailSent: false, error: message };
  }
}
async function sendEmailSafe(options, meta) {
  const result = await sendEmail(options);
  if (!result.emailSent && result.error && isMailConfigured()) {
    const admin = adminNotifyEmail();
    if (admin) {
      const { AdminEmailDeliveryFailed: AdminEmailDeliveryFailed2 } = await Promise.resolve().then(() => (init_SystemEmails(), SystemEmails_exports));
      await sendEmail({
        to: admin,
        subject: "[Admin] Email delivery failed",
        react: AdminEmailDeliveryFailed2({
          template: meta?.template ?? options.subject,
          recipient: Array.isArray(options.to) ? options.to.join(", ") : options.to,
          trackingNumber: meta?.trackingNumber,
          errorMessage: result.error
        })
      });
    }
  }
  return result;
}

// api/_lib/shipmentNotifications.ts
function formatEmailDate(value) {
  if (value == null || value === "") return null;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value.toISOString().slice(0, 10);
  }
  const s2 = String(value).trim();
  return s2 ? s2.slice(0, 10) : null;
}
function rowToShipmentEmailData(row, extras) {
  const lat = row.current_lat != null ? Number(row.current_lat) : null;
  const lng = row.current_lng != null ? Number(row.current_lng) : null;
  return {
    id: String(row.id),
    trackingNumber: String(row.tracking_number),
    status: String(row.status ?? "").trim(),
    origin: String(row.origin),
    destination: String(row.destination),
    carrier: String(row.carrier),
    mode: String(row.mode),
    priority: String(row.priority),
    eta: formatEmailDate(row.eta),
    progress: Number(row.progress) || 0,
    shipper: String(row.shipper),
    consignee: String(row.consignee),
    customerEmail: row.customer_email ?? null,
    senderEmail: row.sender_email ?? null,
    receiverEmail: row.receiver_email ?? row.customer_email ?? null,
    itemName: row.item_name != null && String(row.item_name).trim() ? String(row.item_name) : null,
    currentLat: Number.isFinite(lat) ? lat : null,
    currentLng: Number.isFinite(lng) ? lng : null,
    positionLabel: extras?.positionLabel ?? null
  };
}
function detectShipmentChanges(before, after, patch, eventMessage) {
  const prevStatus = before.status;
  const nextStatus = after.status;
  const statusChanged = Object.prototype.hasOwnProperty.call(patch, "status") && prevStatus !== nextStatus;
  const prevLat = before.current_lat != null ? Number(before.current_lat) : null;
  const prevLng = before.current_lng != null ? Number(before.current_lng) : null;
  const nextLat = after.current_lat != null ? Number(after.current_lat) : null;
  const nextLng = after.current_lng != null ? Number(after.current_lng) : null;
  const addressInPatch = Object.prototype.hasOwnProperty.call(patch, "current_address");
  const coordsInPatch = Object.prototype.hasOwnProperty.call(patch, "current_lat") || Object.prototype.hasOwnProperty.call(patch, "current_lng");
  const coordsChanged = nextLat != null && nextLng != null && (prevLat !== nextLat || prevLng !== nextLng) && (coordsInPatch || addressInPatch);
  const addressChanged = addressInPatch && String(before.current_address ?? "").trim() !== String(after.current_address ?? "").trim();
  const positionChanged = coordsChanged || addressChanged;
  const prevEta = formatEmailDate(before.eta);
  const nextEta = formatEmailDate(after.eta);
  const etaChanged = Object.prototype.hasOwnProperty.call(patch, "eta") && prevEta !== nextEta;
  const prevProgress = Number(before.progress) || 0;
  const nextProgress = Number(after.progress) || 0;
  const progressChanged = Object.prototype.hasOwnProperty.call(patch, "progress") && prevProgress !== nextProgress;
  const timelineOnly = Boolean(eventMessage) && !statusChanged && !positionChanged && !etaChanged && !progressChanged;
  return {
    statusChanged,
    positionChanged,
    etaChanged,
    progressChanged,
    timelineOnly,
    previousStatus: statusChanged ? prevStatus : void 0,
    previousEta: etaChanged ? prevEta : void 0
  };
}
function buildContexts(shipment, changes, eventMessage, eventLocation) {
  const contexts = [];
  if (changes.statusChanged) {
    contexts.push({
      shipment,
      kind: "status",
      previousStatus: changes.previousStatus,
      eventMessage,
      eventLocation
    });
  }
  if (changes.positionChanged) {
    contexts.push({
      shipment,
      kind: "location",
      eventMessage,
      eventLocation
    });
  }
  if (changes.etaChanged) {
    contexts.push({
      shipment,
      kind: "eta",
      previousEta: changes.previousEta,
      eventMessage,
      eventLocation
    });
  }
  if (changes.progressChanged && !changes.statusChanged) {
    contexts.push({
      shipment,
      kind: "timeline",
      eventMessage: eventMessage || `Progress updated to ${shipment.progress}%`,
      eventLocation
    });
  }
  if (changes.timelineOnly) {
    contexts.push({
      shipment,
      kind: "timeline",
      eventMessage,
      eventLocation
    });
  }
  if (!contexts.length) {
    contexts.push({
      shipment,
      kind: "timeline",
      eventMessage: eventMessage || "Shipment updated",
      eventLocation
    });
  }
  return contexts;
}
var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function pushEmail(out, seen, raw) {
  const email = typeof raw === "string" ? raw.trim() : "";
  if (!email || !EMAIL_RE.test(email)) return;
  const key = email.toLowerCase();
  if (seen.has(key)) return;
  seen.add(key);
  out.push(email);
}
function collectPartyEmails(...sources) {
  const seen = /* @__PURE__ */ new Set();
  const out = [];
  for (const source of sources) {
    if (!source) continue;
    const rec = source;
    pushEmail(out, seen, rec.senderEmail ?? rec.sender_email);
    pushEmail(out, seen, rec.receiverEmail ?? rec.receiver_email);
    pushEmail(out, seen, rec.customerEmail ?? rec.customer_email);
  }
  return out;
}
function getPartyNotificationEmails(shipment) {
  return collectPartyEmails(shipment);
}
function shouldNotifyCustomer(_ctx, notifyCustomer, _customerEmail) {
  return notifyCustomer !== false;
}
function shouldNotifyAdmin(_ctx) {
  return true;
}

// api/_lib/notify.ts
async function sendContactEmails(data) {
  const admin = adminNotifyEmail();
  let customerSent = false;
  let adminSent = false;
  const customerResult = await sendEmailSafe({
    to: data.email,
    subject: "We received your message \u2014 Quayvox",
    react: CustomerContactConfirmation({ data }),
    replyTo: admin ?? void 0
  });
  customerSent = customerResult.emailSent;
  if (admin) {
    const adminResult = await sendEmailSafe({
      to: admin,
      subject: `Quayvox contact from ${data.name}`,
      react: AdminContactReceived({ data }),
      replyTo: data.email
    });
    adminSent = adminResult.emailSent;
  }
  return { customerSent, adminSent };
}
async function sendShipmentCreatedEmails(row) {
  const shipment = rowToShipmentEmailData(row);
  const ctx = { shipment, kind: "created" };
  return dispatchShipmentContexts([ctx], {
    notifyCustomer: true,
    partyEmails: collectPartyEmails(row, shipment)
  });
}
async function sendShipmentUpdateEmails(before, after, patch, options = {}) {
  const shipment = rowToShipmentEmailData(after, { positionLabel: options.positionLabel });
  const fallbackMessage = options.eventMessage?.trim() || (Object.prototype.hasOwnProperty.call(patch, "status") ? `Status updated to ${shipment.status}` : "Shipment updated");
  const changes = detectShipmentChanges(before, after, patch, fallbackMessage);
  const contexts = buildContexts(
    shipment,
    changes,
    fallbackMessage,
    options.eventLocation
  );
  const partyEmails = collectPartyEmails(before, after, shipment);
  const admin = adminNotifyEmail();
  if (!partyEmails.length) {
    console.warn(
      "shipment update emails: no sender/receiver emails on file",
      shipment.trackingNumber,
      {
        sender: after.sender_email ?? before.sender_email,
        receiver: after.receiver_email ?? before.receiver_email,
        customer: after.customer_email ?? before.customer_email
      }
    );
  }
  if (!admin) {
    console.warn("shipment update emails: ADMIN_EMAIL / CONTACT_TO_EMAIL not configured");
  }
  const result = await dispatchShipmentContexts(contexts, {
    notifyCustomer: options.notifyCustomer ?? true,
    partyEmails
  });
  return {
    ...result,
    contexts: contexts.length,
    partyEmails,
    adminEmail: admin
  };
}
async function dispatchShipmentContexts(contexts, options) {
  const admin = adminNotifyEmail();
  let customerSent = false;
  let adminSent = false;
  const failures = [];
  for (const ctx of contexts) {
    const partyEmails = options.partyEmails ?? collectPartyEmails(ctx.shipment);
    const partyJobs = partyEmails.filter((email) => shouldNotifyCustomer(ctx, options.notifyCustomer, email)).map(async (email) => {
      const result = await sendEmailSafe(
        {
          to: email,
          subject: customerShipmentSubject(ctx),
          react: CustomerShipmentEmail({ ctx })
        },
        { template: `customer/${ctx.kind}`, trackingNumber: ctx.shipment.trackingNumber }
      );
      if (result.emailSent) {
        customerSent = true;
        return;
      }
      const error = result.error || "Email was not sent";
      console.error("party shipment email failed", {
        to: email,
        trackingNumber: ctx.shipment.trackingNumber,
        kind: ctx.kind,
        error
      });
      failures.push({ to: email, error });
    });
    await Promise.all(partyJobs);
    if (shouldNotifyAdmin(ctx) && admin) {
      const result = await sendEmailSafe(
        {
          to: admin,
          subject: adminShipmentSubject(ctx),
          react: AdminShipmentEmail({ ctx })
        },
        { template: `admin/${ctx.kind}`, trackingNumber: ctx.shipment.trackingNumber }
      );
      if (result.emailSent) {
        adminSent = true;
      } else {
        const error = result.error || "Email was not sent";
        console.error("admin shipment email failed", {
          to: admin,
          trackingNumber: ctx.shipment.trackingNumber,
          kind: ctx.kind,
          error
        });
        failures.push({ to: admin, error });
      }
    }
  }
  return { customerSent, adminSent, failures };
}

// api/_lib/geoPorts.ts
var PORT_COORDINATES = {
  "Shanghai, CN": [31.2, 121.5],
  "Rotterdam, NL": [51.9, 4.5],
  "Singapore, SG": [1.3, 103.8],
  "Hamburg, DE": [53.5, 9.9],
  "Tokyo, JP": [35.7, 139.7],
  "Mumbai, IN": [19.1, 72.9],
  "Sao Paulo, BR": [-23.5, -46.6],
  "Busan, KR": [35.2, 129.1],
  "Melbourne, AU": [-37.8, 144.9],
  "Dubai, AE": [25.2, 55.3],
  "Los Angeles, US": [34.1, -118.2],
  "New York, US": [40.7, -74],
  "Sydney, AU": [-33.9, 151.2],
  "London, UK": [51.5, -0.1],
  "Nairobi, KE": [-1.3, 36.8],
  "Miami, US": [25.8, -80.2],
  "Auckland, NZ": [-36.8, 174.8],
  "Lagos, NG": [6.5, 3.4]
};
function lookupPortCoords(place) {
  const trimmed = place.trim();
  if (!trimmed) return null;
  const exact = Object.keys(PORT_COORDINATES).find(
    (key) => key.toLowerCase() === trimmed.toLowerCase()
  );
  if (exact) return PORT_COORDINATES[exact];
  const lower = trimmed.toLowerCase();
  for (const [key, coord] of Object.entries(PORT_COORDINATES)) {
    const city = key.split(",")[0]?.trim().toLowerCase();
    if (city && lower.includes(city)) return coord;
  }
  return null;
}

// api/_lib/geocode.ts
var cache = /* @__PURE__ */ new Map();
var lastRemoteAt = 0;
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
async function throttleRemote() {
  const elapsed = Date.now() - lastRemoteAt;
  if (elapsed < 1100) {
    await sleep(1100 - elapsed);
  }
  lastRemoteAt = Date.now();
}
function parseCoordPair(input) {
  const trimmed = input.trim();
  const match = trimmed.match(
    /^(-?\d{1,2}(?:\.\d+)?)\s*[, ]\s*(-?\d{1,3}(?:\.\d+)?)$/
  );
  if (!match) return null;
  const lat = Number(match[1]);
  const lng = Number(match[2]);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;
  return [lat, lng];
}
async function geocodeWithNominatim(address) {
  await throttleRemote();
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", address);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "1");
  const res = await fetch(url.toString(), {
    headers: {
      Accept: "application/json",
      "User-Agent": "QuayvoxLogistics/1.0 (shipment-tracking; https://quayvox.com)"
    }
  });
  if (!res.ok) {
    console.warn("geocode nominatim failed", res.status, address);
    return null;
  }
  const data = await res.json();
  const hit = data[0];
  if (!hit?.lat || !hit?.lon) return null;
  const lat = Number(hit.lat);
  const lng = Number(hit.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return [lat, lng];
}
async function geocodeWithPhoton(address) {
  await throttleRemote();
  const url = new URL("https://photon.komoot.io/api/");
  url.searchParams.set("q", address);
  url.searchParams.set("limit", "1");
  const res = await fetch(url.toString(), {
    headers: { Accept: "application/json" }
  });
  if (!res.ok) {
    console.warn("geocode photon failed", res.status, address);
    return null;
  }
  const data = await res.json();
  const coords = data.features?.[0]?.geometry?.coordinates;
  if (!coords || coords.length < 2) return null;
  const lng = Number(coords[0]);
  const lat = Number(coords[1]);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;
  return [lat, lng];
}
async function geocodeAddress(address) {
  const trimmed = address.trim();
  if (!trimmed) return null;
  const key = trimmed.toLowerCase();
  if (cache.has(key)) return cache.get(key) ?? null;
  const port = lookupPortCoords(trimmed);
  if (port) {
    cache.set(key, port);
    return port;
  }
  const parsed = parseCoordPair(trimmed);
  if (parsed) {
    cache.set(key, parsed);
    return parsed;
  }
  try {
    let remote = await geocodeWithNominatim(trimmed);
    if (!remote) {
      remote = await geocodeWithPhoton(trimmed);
    }
    cache.set(key, remote);
    return remote;
  } catch (err) {
    console.warn("geocode error", err);
    try {
      const fallback = await geocodeWithPhoton(trimmed);
      cache.set(key, fallback);
      return fallback;
    } catch (fallbackErr) {
      console.warn("geocode fallback error", fallbackErr);
      cache.set(key, null);
      return null;
    }
  }
}
function asNullableNumber(value) {
  if (value === null || value === void 0 || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}
function asNullableString(value) {
  if (value === null || value === void 0) return null;
  const s2 = String(value).trim();
  return s2.length ? s2 : null;
}
function needsGeoEnrichment(row) {
  const originText = asNullableString(row.sender_address) || asNullableString(row.origin) || "";
  const destinationText = asNullableString(row.receiver_address) || asNullableString(row.destination) || "";
  const currentText = asNullableString(row.current_address);
  const missingOrigin = Boolean(originText) && (asNullableNumber(row.origin_lat) == null || asNullableNumber(row.origin_lng) == null);
  const missingDestination = Boolean(destinationText) && (asNullableNumber(row.destination_lat) == null || asNullableNumber(row.destination_lng) == null);
  const missingCurrent = Boolean(currentText) && (asNullableNumber(row.current_lat) == null || asNullableNumber(row.current_lng) == null);
  return missingOrigin || missingDestination || missingCurrent;
}
async function enrichShipmentGeo(payload, options) {
  const next = { ...payload };
  const originText = asNullableString(next.sender_address) || asNullableString(next.origin) || "";
  const destinationText = asNullableString(next.receiver_address) || asNullableString(next.destination) || "";
  const currentText = asNullableString(next.current_address);
  if (asNullableNumber(next.origin_lat) == null || asNullableNumber(next.origin_lng) == null) {
    if (originText) {
      const coords = await geocodeAddress(originText);
      if (coords) {
        next.origin_lat = coords[0];
        next.origin_lng = coords[1];
      }
    }
  }
  if (asNullableNumber(next.destination_lat) == null || asNullableNumber(next.destination_lng) == null) {
    if (destinationText) {
      const coords = await geocodeAddress(destinationText);
      if (coords) {
        next.destination_lat = coords[0];
        next.destination_lng = coords[1];
      }
    }
  }
  if (!currentText) {
    if (Object.prototype.hasOwnProperty.call(payload, "current_address")) {
      next.current_lat = null;
      next.current_lng = null;
    }
    return next;
  }
  const shouldGeocodeCurrent = options?.forceCurrent || asNullableNumber(next.current_lat) == null || asNullableNumber(next.current_lng) == null;
  if (shouldGeocodeCurrent) {
    const coords = await geocodeAddress(currentText);
    if (coords) {
      next.current_lat = coords[0];
      next.current_lng = coords[1];
    }
  }
  return next;
}

// api/_lib/shipments.ts
var UPDATE_COLUMNS = /* @__PURE__ */ new Set([
  "tracking_number",
  "origin",
  "destination",
  "carrier",
  "status",
  "weight",
  "dim_l",
  "dim_w",
  "dim_h",
  "cost",
  "eta",
  "progress",
  "mode",
  "priority",
  "shipper",
  "consignee",
  "documents",
  "tags",
  "customer_email",
  "notes",
  "item_name",
  "sender_name",
  "sender_phone",
  "sender_email",
  "sender_street",
  "sender_city",
  "sender_state",
  "sender_postal",
  "sender_country",
  "sender_address",
  "receiver_name",
  "receiver_phone",
  "receiver_email",
  "receiver_street",
  "receiver_city",
  "receiver_state",
  "receiver_postal",
  "receiver_country",
  "receiver_address",
  "current_address",
  "departure_at",
  "delivery_at",
  "volume",
  "payment_method",
  "origin_lat",
  "origin_lng",
  "destination_lat",
  "destination_lng",
  "current_lat",
  "current_lng",
  "current_location_updated_at"
]);
function asNullableNumber2(value) {
  if (value === null || value === void 0 || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}
function asNullableString2(value) {
  if (value === null || value === void 0) return null;
  const s2 = String(value).trim();
  return s2.length ? s2 : null;
}
function asString(value, fallback = "") {
  if (value === null || value === void 0) return fallback;
  return String(value);
}
function asNullableDate(value) {
  if (value === null || value === void 0 || value === "") return null;
  const d = new Date(String(value));
  return Number.isNaN(d.getTime()) ? null : d;
}
function resolveGeoDefaults(payload) {
  const next = { ...payload };
  const origin = typeof next.origin === "string" ? next.origin : "";
  const destination = typeof next.destination === "string" ? next.destination : "";
  if (asNullableNumber2(next.origin_lat) == null || asNullableNumber2(next.origin_lng) == null) {
    const o = lookupPortCoords(origin);
    if (o) {
      next.origin_lat = o[0];
      next.origin_lng = o[1];
    }
  }
  if (asNullableNumber2(next.destination_lat) == null || asNullableNumber2(next.destination_lng) == null) {
    const d = lookupPortCoords(destination);
    if (d) {
      next.destination_lat = d[0];
      next.destination_lng = d[1];
    }
  }
  return next;
}
async function listShipments() {
  const sql = getSql();
  const rows = await sql`select * from public.shipments order by created_at desc`;
  const enriched = [];
  let backfilled = 0;
  for (const row of rows) {
    if (backfilled < 1 && needsGeoEnrichment(row)) {
      enriched.push(await persistMissingShipmentGeo(row));
      backfilled += 1;
    } else {
      enriched.push(row);
    }
  }
  return enriched;
}
async function persistMissingShipmentGeo(row) {
  if (!needsGeoEnrichment(row)) return row;
  const enriched = await enrichShipmentGeo(row);
  const id = String(row.id);
  const originLat = asNullableNumber2(enriched.origin_lat);
  const originLng = asNullableNumber2(enriched.origin_lng);
  const destinationLat = asNullableNumber2(enriched.destination_lat);
  const destinationLng = asNullableNumber2(enriched.destination_lng);
  const currentLat = asNullableNumber2(enriched.current_lat);
  const currentLng = asNullableNumber2(enriched.current_lng);
  const changed = originLat !== asNullableNumber2(row.origin_lat) || originLng !== asNullableNumber2(row.origin_lng) || destinationLat !== asNullableNumber2(row.destination_lat) || destinationLng !== asNullableNumber2(row.destination_lng) || currentLat !== asNullableNumber2(row.current_lat) || currentLng !== asNullableNumber2(row.current_lng);
  if (!changed) return row;
  const currentUpdated = currentLat != null && currentLng != null && (currentLat !== asNullableNumber2(row.current_lat) || currentLng !== asNullableNumber2(row.current_lng));
  const sql = getSql();
  const updated = await sql`
    update public.shipments set
      origin_lat = ${originLat},
      origin_lng = ${originLng},
      destination_lat = ${destinationLat},
      destination_lng = ${destinationLng},
      current_lat = ${currentLat},
      current_lng = ${currentLng},
      current_location_updated_at = ${currentUpdated ? /* @__PURE__ */ new Date() : row.current_location_updated_at ? new Date(String(row.current_location_updated_at)) : null}
    where id = ${id}
    returning *
  `;
  const next = updated[0] ?? {
    ...row,
    origin_lat: originLat,
    origin_lng: originLng,
    destination_lat: destinationLat,
    destination_lng: destinationLng,
    current_lat: currentLat,
    current_lng: currentLng
  };
  if (currentUpdated && currentLat != null && currentLng != null && asNullableString2(row.current_address)) {
    await insertShipmentPosition({
      shipment_id: id,
      lat: currentLat,
      lng: currentLng,
      label: asNullableString2(row.current_address)
    });
  }
  return next;
}
async function getShipmentById(id) {
  const sql = getSql();
  const rows = await sql`select * from public.shipments where id = ${id} limit 1`;
  return rows[0] ?? null;
}
async function getShipmentByTracking(tracking) {
  const sql = getSql();
  const trimmed = tracking.trim();
  const rows = await sql`
    select * from public.shipments
    where tracking_number = ${trimmed}
       or tracking_number = ${trimmed.toUpperCase()}
    limit 1
  `;
  const row = rows[0] ?? null;
  if (!row) return null;
  return persistMissingShipmentGeo(row);
}
async function getEventsByTracking(tracking) {
  const sql = getSql();
  const trimmed = tracking.trim();
  return sql`
    select e.*
    from public.shipment_events e
    join public.shipments s on s.id = e.shipment_id
    where s.tracking_number = ${trimmed}
       or s.tracking_number = ${trimmed.toUpperCase()}
    order by e.occurred_at desc
  `;
}
async function listShipmentPositions(shipmentId, limit = 50) {
  const sql = getSql();
  const capped = Math.min(Math.max(limit, 1), 200);
  return sql`
    select * from public.shipment_positions
    where shipment_id = ${shipmentId}
    order by recorded_at desc
    limit ${capped}
  `;
}
async function insertShipmentPosition(input) {
  const sql = getSql();
  const rows = await sql`
    insert into public.shipment_positions (shipment_id, lat, lng, label, recorded_at)
    values (
      ${input.shipment_id},
      ${input.lat},
      ${input.lng},
      ${input.label ?? null},
      ${input.recorded_at ? new Date(input.recorded_at) : /* @__PURE__ */ new Date()}
    )
    returning *
  `;
  return rows[0] ?? null;
}
async function insertShipment(payload) {
  const sql = getSql();
  const resolved = await enrichShipmentGeo(resolveGeoDefaults(payload), { forceCurrent: true });
  const senderName = asString(resolved.sender_name ?? resolved.shipper);
  const receiverName = asString(resolved.receiver_name ?? resolved.consignee);
  const receiverEmail = asNullableString2(resolved.receiver_email ?? resolved.customer_email);
  const senderAddress = asString(resolved.sender_address ?? resolved.origin);
  const receiverAddress = asString(resolved.receiver_address ?? resolved.destination);
  const rows = await sql`
    insert into public.shipments (
      tracking_number, origin, destination, carrier, status, weight,
      dim_l, dim_w, dim_h, cost, eta, progress, mode, priority,
      shipper, consignee, documents, tags, customer_email, notes, item_name,
      sender_name, sender_phone, sender_email, sender_address,
      sender_street, sender_city, sender_state, sender_postal, sender_country,
      receiver_name, receiver_phone, receiver_email, receiver_address,
      receiver_street, receiver_city, receiver_state, receiver_postal, receiver_country,
      departure_at, delivery_at, volume, payment_method, current_address,
      origin_lat, origin_lng, destination_lat, destination_lng,
      current_lat, current_lng, current_location_updated_at
    ) values (
      ${resolved.tracking_number},
      ${senderAddress},
      ${receiverAddress},
      ${resolved.carrier},
      ${resolved.status},
      ${resolved.weight},
      ${resolved.dim_l},
      ${resolved.dim_w},
      ${resolved.dim_h},
      ${resolved.cost},
      ${resolved.eta},
      ${resolved.progress},
      ${resolved.mode},
      ${resolved.priority},
      ${senderName},
      ${receiverName},
      ${resolved.documents},
      ${resolved.tags},
      ${receiverEmail},
      ${asNullableString2(resolved.notes)},
      ${asString(resolved.item_name)},
      ${senderName},
      ${asString(resolved.sender_phone)},
      ${asNullableString2(resolved.sender_email)},
      ${senderAddress},
      ${""},
      ${""},
      ${null},
      ${null},
      ${""},
      ${receiverName},
      ${asString(resolved.receiver_phone)},
      ${receiverEmail},
      ${receiverAddress},
      ${""},
      ${""},
      ${null},
      ${null},
      ${""},
      ${asNullableDate(resolved.departure_at)},
      ${asNullableDate(resolved.delivery_at)},
      ${Number(resolved.volume ?? 0)},
      ${asString(resolved.payment_method)},
      ${asNullableString2(resolved.current_address)},
      ${asNullableNumber2(resolved.origin_lat)},
      ${asNullableNumber2(resolved.origin_lng)},
      ${asNullableNumber2(resolved.destination_lat)},
      ${asNullableNumber2(resolved.destination_lng)},
      ${asNullableNumber2(resolved.current_lat)},
      ${asNullableNumber2(resolved.current_lng)},
      ${resolved.current_location_updated_at ? new Date(resolved.current_location_updated_at) : asNullableNumber2(resolved.current_lat) != null ? /* @__PURE__ */ new Date() : null}
    )
    returning *
  `;
  return rows[0] ?? null;
}
async function updateShipment(id, patch) {
  const existing = await getShipmentById(id);
  if (!existing) return null;
  const merged = { ...existing };
  for (const [key, value] of Object.entries(patch)) {
    if (UPDATE_COLUMNS.has(key)) merged[key] = value;
  }
  const addressInPatch = Object.prototype.hasOwnProperty.call(patch, "current_address");
  const previousAddress = asNullableString2(existing.current_address);
  const nextAddress = addressInPatch ? asNullableString2(patch.current_address) : previousAddress;
  const addressTextChanged = addressInPatch && previousAddress !== nextAddress;
  const withGeo = await enrichShipmentGeo(resolveGeoDefaults(merged), {
    forceCurrent: addressTextChanged
  });
  const currentChanged = Object.prototype.hasOwnProperty.call(patch, "current_lat") || Object.prototype.hasOwnProperty.call(patch, "current_lng") || addressInPatch && asNullableNumber2(withGeo.current_lat) != null && asNullableNumber2(withGeo.current_lng) != null && (addressTextChanged || asNullableNumber2(existing.current_lat) == null || asNullableNumber2(existing.current_lng) == null);
  const addressChanged = addressInPatch;
  if (currentChanged && asNullableNumber2(withGeo.current_lat) != null && asNullableNumber2(withGeo.current_lng) != null) {
    withGeo.current_location_updated_at = (/* @__PURE__ */ new Date()).toISOString();
  } else if (addressChanged && asNullableString2(withGeo.current_address)) {
    withGeo.current_location_updated_at = (/* @__PURE__ */ new Date()).toISOString();
  }
  const senderName = asString(withGeo.sender_name ?? withGeo.shipper);
  const receiverName = asString(withGeo.receiver_name ?? withGeo.consignee);
  const receiverEmail = asNullableString2(withGeo.receiver_email ?? withGeo.customer_email);
  const senderAddress = asString(withGeo.sender_address ?? withGeo.origin);
  const receiverAddress = asString(withGeo.receiver_address ?? withGeo.destination);
  const sql = getSql();
  const rows = await sql`
    update public.shipments set
      tracking_number = ${withGeo.tracking_number},
      origin = ${senderAddress},
      destination = ${receiverAddress},
      carrier = ${withGeo.carrier},
      status = ${withGeo.status},
      weight = ${withGeo.weight},
      dim_l = ${withGeo.dim_l},
      dim_w = ${withGeo.dim_w},
      dim_h = ${withGeo.dim_h},
      cost = ${withGeo.cost},
      eta = ${withGeo.eta},
      progress = ${withGeo.progress},
      mode = ${withGeo.mode},
      priority = ${withGeo.priority},
      shipper = ${senderName},
      consignee = ${receiverName},
      documents = ${withGeo.documents},
      tags = ${withGeo.tags},
      customer_email = ${receiverEmail},
      notes = ${asNullableString2(withGeo.notes)},
      item_name = ${asString(withGeo.item_name)},
      sender_name = ${senderName},
      sender_phone = ${asString(withGeo.sender_phone)},
      sender_email = ${asNullableString2(withGeo.sender_email)},
      sender_address = ${senderAddress},
      sender_street = ${""},
      sender_city = ${""},
      sender_state = ${null},
      sender_postal = ${null},
      sender_country = ${""},
      receiver_name = ${receiverName},
      receiver_phone = ${asString(withGeo.receiver_phone)},
      receiver_email = ${receiverEmail},
      receiver_address = ${receiverAddress},
      receiver_street = ${""},
      receiver_city = ${""},
      receiver_state = ${null},
      receiver_postal = ${null},
      receiver_country = ${""},
      departure_at = ${asNullableDate(withGeo.departure_at)},
      delivery_at = ${asNullableDate(withGeo.delivery_at)},
      volume = ${Number(withGeo.volume ?? 0)},
      payment_method = ${asString(withGeo.payment_method)},
      current_address = ${asNullableString2(withGeo.current_address)},
      origin_lat = ${asNullableNumber2(withGeo.origin_lat)},
      origin_lng = ${asNullableNumber2(withGeo.origin_lng)},
      destination_lat = ${asNullableNumber2(withGeo.destination_lat)},
      destination_lng = ${asNullableNumber2(withGeo.destination_lng)},
      current_lat = ${asNullableNumber2(withGeo.current_lat)},
      current_lng = ${asNullableNumber2(withGeo.current_lng)},
      current_location_updated_at = ${withGeo.current_location_updated_at ? new Date(withGeo.current_location_updated_at) : null}
    where id = ${id}
    returning *
  `;
  return rows[0] ?? null;
}
async function deleteShipment(id) {
  const sql = getSql();
  await sql`delete from public.shipments where id = ${id}`;
}
async function insertEvent(input) {
  const sql = getSql();
  const rows = await sql`
    insert into public.shipment_events (shipment_id, status, location, message)
    values (
      ${input.shipment_id},
      ${input.status},
      ${input.location},
      ${input.message}
    )
    returning *
  `;
  return rows[0] ?? null;
}
async function insertContactMessage(input) {
  const sql = getSql();
  await sql`
    insert into public.contact_messages (name, email, company, message)
    values (${input.name}, ${input.email}, ${input.company}, ${input.message})
  `;
}

// api/_lib/handlers/contact.ts
var bodySchema = import_zod2.z.object({
  name: import_zod2.z.string().trim().min(1).max(120),
  email: import_zod2.z.string().trim().email().max(200),
  company: import_zod2.z.string().trim().max(160).optional().nullable(),
  message: import_zod2.z.string().trim().min(5).max(5e3),
  website: import_zod2.z.string().optional().nullable()
});
var rateMap = /* @__PURE__ */ new Map();
function rateLimit(ip, limit = 8, windowMs = 6e4) {
  const now = Date.now();
  const entry = rateMap.get(ip);
  if (!entry || now > entry.reset) {
    rateMap.set(ip, { count: 1, reset: now + windowMs });
    return true;
  }
  if (entry.count >= limit) return false;
  entry.count += 1;
  return true;
}
async function handleContact(req, res) {
  if (handleOptions(req, res, "POST, OPTIONS")) return;
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket.remoteAddress || "unknown";
  if (!rateLimit(ip)) {
    res.status(429).json({ error: "Too many requests. Please try again shortly." });
    return;
  }
  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid form data", details: parsed.error.flatten() });
    return;
  }
  const { name, email, company, message, website } = parsed.data;
  if (website) {
    res.status(200).json({ ok: true });
    return;
  }
  if (!isDbConfigured()) {
    res.status(500).json({ error: "Server database is not configured" });
    return;
  }
  try {
    await insertContactMessage({
      name,
      email,
      company: company || null,
      message
    });
  } catch (err) {
    console.error("contact insert", err);
    res.status(500).json({ error: "Failed to save message" });
    return;
  }
  const { customerSent, adminSent } = await sendContactEmails({
    name,
    email,
    company: company || null,
    message
  });
  res.status(200).json({
    ok: true,
    emailSent: adminSent,
    customerConfirmationSent: customerSent
  });
}

// api/_lib/handlers/geocode.ts
var import_zod3 = require("zod");
var querySchema = import_zod3.z.object({
  q: import_zod3.z.string().trim().min(2).max(300)
});
async function handleGeocode(req, res) {
  if (handleOptions(req, res, "GET, OPTIONS")) return;
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  const parsed = querySchema.safeParse({
    q: typeof req.query.q === "string" ? req.query.q : ""
  });
  if (!parsed.success) {
    res.status(400).json({ error: "Missing address query (q)" });
    return;
  }
  try {
    const coords = await geocodeAddress(parsed.data.q);
    if (!coords) {
      res.status(200).json({ lat: null, lng: null, found: false });
      return;
    }
    res.status(200).json({ lat: coords[0], lng: coords[1], found: true });
  } catch (err) {
    console.error("geocode", err);
    res.status(500).json({ error: "Failed to geocode address" });
  }
}

// api/_lib/handlers/notify-shipment.ts
var import_zod4 = require("zod");
var bodySchema2 = import_zod4.z.object({
  trackingNumber: import_zod4.z.string().trim().min(3).max(64),
  status: import_zod4.z.string().trim().min(1).max(64).optional(),
  customerEmail: import_zod4.z.string().trim().email().optional(),
  notifyCustomer: import_zod4.z.boolean().optional()
});
async function handleNotifyShipment(req, res) {
  if (handleOptions(req, res, "POST, OPTIONS")) return;
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  if (!isServerConfigured()) {
    res.status(503).json({ error: "Server is not configured" });
    return;
  }
  if (!requireAdmin(req, res)) return;
  const parsed = bodySchema2.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid payload" });
    return;
  }
  const row = await getShipmentByTracking(parsed.data.trackingNumber);
  if (!row) {
    res.status(404).json({ error: "Shipment not found" });
    return;
  }
  const shipment = rowToShipmentEmailData({
    ...row,
    customer_email: parsed.data.customerEmail ?? row.customer_email,
    status: parsed.data.status ?? row.status
  });
  const ctx = {
    shipment,
    kind: "status",
    eventMessage: parsed.data.status ? `Status updated to ${parsed.data.status}` : void 0
  };
  const admin = adminNotifyEmail();
  let customerSent = false;
  let adminSent = false;
  for (const email of getPartyNotificationEmails(shipment)) {
    const result = await sendEmailSafe({
      to: email,
      subject: customerShipmentSubject(ctx),
      react: CustomerShipmentEmail({ ctx })
    });
    if (result.emailSent) customerSent = true;
  }
  if (admin) {
    const result = await sendEmailSafe({
      to: admin,
      subject: adminShipmentSubject(ctx),
      react: AdminShipmentEmail({ ctx })
    });
    adminSent = result.emailSent;
  }
  res.status(200).json({
    ok: true,
    emailSent: customerSent || adminSent,
    emails: { customerSent, adminSent }
  });
}

// api/_lib/handlers/shipments.ts
var import_zod5 = require("zod");
var nullableNumber = import_zod5.z.number().finite().nullable().optional();
var optionalEmail = import_zod5.z.union([import_zod5.z.string().email(), import_zod5.z.literal(""), import_zod5.z.null()]).optional().transform((v) => v === "" || v === void 0 ? null : v);
var partyFields = {
  sender_name: import_zod5.z.string().optional(),
  sender_phone: import_zod5.z.string().optional(),
  sender_email: optionalEmail,
  sender_address: import_zod5.z.string().optional(),
  sender_street: import_zod5.z.string().optional(),
  sender_city: import_zod5.z.string().optional(),
  sender_state: import_zod5.z.string().nullable().optional(),
  sender_postal: import_zod5.z.string().nullable().optional(),
  sender_country: import_zod5.z.string().optional(),
  receiver_name: import_zod5.z.string().optional(),
  receiver_phone: import_zod5.z.string().optional(),
  receiver_email: optionalEmail,
  receiver_address: import_zod5.z.string().optional(),
  receiver_street: import_zod5.z.string().optional(),
  receiver_city: import_zod5.z.string().optional(),
  receiver_state: import_zod5.z.string().nullable().optional(),
  receiver_postal: import_zod5.z.string().nullable().optional(),
  receiver_country: import_zod5.z.string().optional(),
  current_address: import_zod5.z.string().nullable().optional(),
  departure_at: import_zod5.z.string().nullable().optional(),
  delivery_at: import_zod5.z.string().nullable().optional(),
  volume: import_zod5.z.number().optional(),
  payment_method: import_zod5.z.string().optional()
};
var createSchema = import_zod5.z.object({
  tracking_number: import_zod5.z.string().trim().min(3).max(64),
  origin: import_zod5.z.string().trim().min(1),
  destination: import_zod5.z.string().trim().min(1),
  carrier: import_zod5.z.string().trim().min(1),
  status: import_zod5.z.enum(["Pending", "In Transit", "Customs", "On Hold", "Delivered", "Exception"]),
  weight: import_zod5.z.number(),
  dim_l: import_zod5.z.number(),
  dim_w: import_zod5.z.number(),
  dim_h: import_zod5.z.number(),
  cost: import_zod5.z.number(),
  eta: import_zod5.z.string().nullable().optional(),
  progress: import_zod5.z.number().int().min(0).max(100),
  mode: import_zod5.z.enum(["Air", "Ocean", "Rail", "Road"]),
  priority: import_zod5.z.enum(["Express", "Standard", "Economy"]),
  shipper: import_zod5.z.string(),
  consignee: import_zod5.z.string(),
  documents: import_zod5.z.array(import_zod5.z.string()).optional(),
  tags: import_zod5.z.array(import_zod5.z.string()).optional(),
  customer_email: optionalEmail,
  notes: import_zod5.z.string().nullable().optional(),
  item_name: import_zod5.z.string().trim().min(1).max(200),
  ...partyFields,
  origin_lat: nullableNumber,
  origin_lng: nullableNumber,
  destination_lat: nullableNumber,
  destination_lng: nullableNumber,
  current_lat: nullableNumber,
  current_lng: nullableNumber
});
var patchSchema = import_zod5.z.object({
  tracking_number: import_zod5.z.string().trim().min(3).max(64).optional(),
  origin: import_zod5.z.string().trim().min(1).optional(),
  destination: import_zod5.z.string().trim().min(1).optional(),
  carrier: import_zod5.z.string().trim().min(1).optional(),
  status: import_zod5.z.enum(["Pending", "In Transit", "Customs", "On Hold", "Delivered", "Exception"]).optional(),
  weight: import_zod5.z.number().optional(),
  dim_l: import_zod5.z.number().optional(),
  dim_w: import_zod5.z.number().optional(),
  dim_h: import_zod5.z.number().optional(),
  cost: import_zod5.z.number().optional(),
  eta: import_zod5.z.string().nullable().optional(),
  progress: import_zod5.z.number().int().min(0).max(100).optional(),
  mode: import_zod5.z.enum(["Air", "Ocean", "Rail", "Road"]).optional(),
  priority: import_zod5.z.enum(["Express", "Standard", "Economy"]).optional(),
  shipper: import_zod5.z.string().optional(),
  consignee: import_zod5.z.string().optional(),
  documents: import_zod5.z.array(import_zod5.z.string()).optional(),
  tags: import_zod5.z.array(import_zod5.z.string()).optional(),
  customer_email: optionalEmail,
  notes: import_zod5.z.string().nullable().optional(),
  item_name: import_zod5.z.string().trim().max(200).optional(),
  ...partyFields,
  origin_lat: nullableNumber,
  origin_lng: nullableNumber,
  destination_lat: nullableNumber,
  destination_lng: nullableNumber,
  current_lat: nullableNumber,
  current_lng: nullableNumber,
  position_label: import_zod5.z.string().trim().max(200).nullable().optional(),
  eventMessage: import_zod5.z.string().optional(),
  eventLocation: import_zod5.z.string().optional(),
  notifyCustomer: import_zod5.z.boolean().optional()
}).strict();
async function handleShipmentsCollection(req, res) {
  if (handleOptions(req, res, "GET, POST, OPTIONS")) return;
  if (!isServerConfigured()) {
    res.status(503).json({ error: "Server is not configured", configured: false });
    return;
  }
  if (!requireAdmin(req, res)) return;
  if (req.method === "GET") {
    try {
      const rows = await listShipments();
      res.status(200).json({ shipments: rows });
    } catch (err) {
      console.error("list shipments", err);
      res.status(500).json({ error: "Failed to load shipments" });
    }
    return;
  }
  if (req.method === "POST") {
    const parsed = createSchema.safeParse({
      ...req.body,
      documents: req.body?.documents ?? [],
      tags: req.body?.tags ?? [],
      customer_email: req.body?.customer_email ?? null,
      notes: req.body?.notes ?? null,
      item_name: req.body?.item_name ?? "",
      eta: req.body?.eta ?? null
    });
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid shipment payload", details: parsed.error.flatten() });
      return;
    }
    try {
      const row = await insertShipment(parsed.data);
      if (!row) {
        res.status(500).json({ error: "Failed to create shipment" });
        return;
      }
      await insertEvent({
        shipment_id: row.id,
        status: parsed.data.status,
        location: parsed.data.origin,
        message: "Shipment created"
      });
      const emailResult = await sendShipmentCreatedEmails(row);
      res.status(201).json({
        shipment: row,
        emails: {
          customerSent: emailResult.customerSent,
          adminSent: emailResult.adminSent
        }
      });
    } catch (err) {
      console.error("create shipment", err);
      res.status(500).json({ error: "Failed to create shipment" });
    }
    return;
  }
  res.status(405).json({ error: "Method not allowed" });
}
async function handleShipmentById(req, res, id) {
  if (handleOptions(req, res, "PATCH, DELETE, OPTIONS")) return;
  if (!isServerConfigured()) {
    res.status(503).json({ error: "Server is not configured", configured: false });
    return;
  }
  if (!requireAdmin(req, res)) return;
  if (!id) {
    res.status(400).json({ error: "Missing shipment id" });
    return;
  }
  if (req.method === "DELETE") {
    try {
      await deleteShipment(id);
      res.status(200).json({ ok: true });
    } catch (err) {
      console.error("delete shipment", err);
      res.status(500).json({ error: "Failed to delete shipment" });
    }
    return;
  }
  if (req.method === "PATCH") {
    const parsed = patchSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid update payload", details: parsed.error.flatten() });
      return;
    }
    const { eventMessage, eventLocation, position_label, notifyCustomer, ...patch } = parsed.data;
    const hasCurrentLat = Object.prototype.hasOwnProperty.call(parsed.data, "current_lat");
    const hasCurrentLng = Object.prototype.hasOwnProperty.call(parsed.data, "current_lng");
    if ((hasCurrentLat || hasCurrentLng) && !(hasCurrentLat && hasCurrentLng)) {
      res.status(400).json({ error: "current_lat and current_lng must be set together" });
      return;
    }
    if (hasCurrentLat && hasCurrentLng && parsed.data.current_lat != null && parsed.data.current_lng == null) {
      res.status(400).json({ error: "current_lat and current_lng must both be numbers or both null" });
      return;
    }
    try {
      const before = await getShipmentById(id);
      if (!before) {
        res.status(404).json({ error: "Shipment not found" });
        return;
      }
      const row = await updateShipment(id, patch);
      if (!row) {
        res.status(404).json({ error: "Shipment not found" });
        return;
      }
      const beforeLat = before.current_lat != null ? Number(before.current_lat) : null;
      const beforeLng = before.current_lng != null ? Number(before.current_lng) : null;
      const lat = row.current_lat != null ? Number(row.current_lat) : null;
      const lng = row.current_lng != null ? Number(row.current_lng) : null;
      const coordsValid = lat != null && lng != null && Number.isFinite(lat) && Number.isFinite(lng);
      const coordsChanged = coordsValid && (beforeLat !== lat || beforeLng !== lng);
      const addressUpdated = Object.prototype.hasOwnProperty.call(parsed.data, "current_address");
      if (coordsValid && (hasCurrentLat || addressUpdated || coordsChanged)) {
        await insertShipmentPosition({
          shipment_id: id,
          lat,
          lng,
          label: position_label ?? eventLocation ?? (typeof row.current_address === "string" ? row.current_address : null)
        });
      }
      if (eventMessage || parsed.data.status) {
        await insertEvent({
          shipment_id: id,
          status: row.status || null,
          location: eventLocation || position_label || row.current_address || (lat != null && lng != null ? `${lat.toFixed(4)}, ${lng.toFixed(4)}` : null) || row.destination || null,
          message: eventMessage || `Status updated to ${row.status}`
        });
      }
      const emailResult = await sendShipmentUpdateEmails(
        before,
        row,
        patch,
        {
          notifyCustomer: true,
          eventMessage: eventMessage?.trim() || (parsed.data.status ? `Status updated to ${String(row.status)}` : "Shipment updated"),
          eventLocation: eventLocation || position_label || (typeof row.current_address === "string" ? row.current_address : null),
          positionLabel: position_label
        }
      );
      res.status(200).json({
        shipment: row,
        emails: {
          customerSent: emailResult.customerSent,
          adminSent: emailResult.adminSent,
          contexts: emailResult.contexts,
          partyEmails: emailResult.partyEmails,
          adminEmail: emailResult.adminEmail,
          failures: emailResult.failures
        }
      });
    } catch (err) {
      console.error("update shipment", err);
      res.status(500).json({ error: "Failed to update shipment" });
    }
    return;
  }
  res.status(405).json({ error: "Method not allowed" });
}

// api/_lib/handlers/track.ts
async function handleTrack(req, res, trackingNumber) {
  if (handleOptions(req, res, "GET, OPTIONS")) return;
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  if (!isDbConfigured()) {
    res.status(503).json({ error: "Database is not configured" });
    return;
  }
  const trimmed = trackingNumber.trim();
  if (!trimmed) {
    res.status(400).json({ error: "Tracking number required" });
    return;
  }
  try {
    const shipment = await getShipmentByTracking(trimmed);
    if (!shipment) {
      res.status(404).json({ error: "Not found", shipment: null, events: [], positions: [] });
      return;
    }
    const events = await getEventsByTracking(trimmed);
    const positions = await listShipmentPositions(shipment.id, 50);
    const trail = [...positions].reverse();
    res.status(200).json({ shipment, events, positions: trail });
  } catch (err) {
    console.error("track", err);
    res.status(500).json({ error: "Failed to load tracking data" });
  }
}

// api/_lib/router.ts
function pathSegments(req) {
  const raw = req.query.path;
  if (Array.isArray(raw)) {
    return raw.flatMap((part) => String(part).split("/").filter(Boolean));
  }
  if (typeof raw === "string" && raw.length > 0) {
    return raw.split("/").filter(Boolean);
  }
  const url = req.url || "";
  const match = url.match(/\/api\/([^?#]*)/);
  if (match?.[1]) {
    return match[1].split("/").filter(Boolean);
  }
  return [];
}
async function routeRequest(req, res) {
  const segments = pathSegments(req);
  const [root, second] = segments;
  if (root === "auth" && second === "me") {
    await handleAuthMe(req, res);
    return;
  }
  if (root === "auth" && second === "login") {
    await handleAuthLogin(req, res);
    return;
  }
  if (root === "auth" && second === "logout") {
    await handleAuthLogout(req, res);
    return;
  }
  if (root === "shipments" && !second) {
    await handleShipmentsCollection(req, res);
    return;
  }
  if (root === "shipments" && second) {
    await handleShipmentById(req, res, second);
    return;
  }
  if (root === "track" && second) {
    await handleTrack(req, res, second);
    return;
  }
  if (root === "geocode" && !second) {
    await handleGeocode(req, res);
    return;
  }
  if (root === "contact" && !second) {
    await handleContact(req, res);
    return;
  }
  if (root === "notify-shipment" && !second) {
    await handleNotifyShipment(req, res);
    return;
  }
  res.status(404).json({ error: "Not found" });
}

// server/entry.ts
async function handler(req, res) {
  try {
    await routeRequest(req, res);
  } catch (err) {
    console.error("api router", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
