import { useEffect } from "react";

const SITE_TITLE = "Holidaze — Find Your Perfect Stay";

/**
 * Names the browser tab after the page. Every route used to share the site
 * title, so tabs, history entries and a screen reader's announcement on
 * navigation could not tell one page from another.
 *
 * Pass nothing (or undefined while data loads) for the plain site title.
 */
export function useDocumentTitle(pageTitle?: string) {
  useEffect(() => {
    document.title = pageTitle ? `${pageTitle} · Holidaze` : SITE_TITLE;
  }, [pageTitle]);
}
