/**
 * Meta Pixel / Conversions API PageView dedup.
 *
 * Shortlinks (`digital.enigmait.rs/r/<slug>`) redirect here with `?eid=<id>`,
 * the same event_id the server already sent via the Conversions API. The
 * Pixel's PageView has to carry that same id as `eventID` so Meta merges the
 * browser and server events into one instead of counting twice.
 *
 * `EID_CAPTURE_SCRIPT` runs as a plain inline `<script>` in `<head>`, before
 * the Pixel/GA4 `next/script` tags (which are `afterInteractive` and only
 * fire after hydration) - so by the time either of them runs, `eid` is
 * already stashed on `window` and stripped from the URL/history.
 */

/** window[...] key the capture script hands off to MetaPixel.tsx. */
export const META_PIXEL_EID_GLOBAL = "__enigmaEventId";

export const EID_CAPTURE_SCRIPT = `
(function () {
  try {
    var params = new URLSearchParams(window.location.search);
    var eid = params.get('eid');
    if (!eid) return;
    window.${META_PIXEL_EID_GLOBAL} = eid;
    params.delete('eid');
    var qs = params.toString();
    var newUrl =
      window.location.pathname +
      (qs ? '?' + qs : '') +
      window.location.hash;
    window.history.replaceState(null, '', newUrl);
  } catch (e) {}
})();
`;
