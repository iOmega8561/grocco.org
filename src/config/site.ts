/**
 * Everything about you that is not a project. Empty strings hide the matching link.
 */
export const site = {
  name: "Giuseppe Rocco",
  /** Canonical address, used for share links and metadata. */
  url: "https://grocco.org",
  github: "https://github.com/iOmega8561",
  /** Public e-mail address. While empty, the contact link is hidden. */
  email: "me@grocco.org",
  /** Optional: a dormant LinkedIn profile that points here is still worth linking. */
  linkedin: "https://www.linkedin.com/in/giusepperocco",
  /** Optional: the public repository of this site. While empty, the footer link is hidden. */
  sourceRepo: "",
  /** Optional: a PDF in `public/`, e.g. "/giuseppe-rocco-cv.pdf". While empty, the download button is hidden. */
  cvPdf: "",
  /**
   * Where the live status JSON is served (see `deploy/status`). Set it at build time with
   * VITE_STATUS_URL. While empty, the live section is not shown at all.
   */
  statusUrl: (import.meta.env.VITE_STATUS_URL as string | undefined) ?? "",
} as const;
