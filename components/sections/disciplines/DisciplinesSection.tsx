import DisciplinesShell from "./Disciplines";
import { ITEM_LIST_JSON_LD } from "./sectionCopy";

/**
 * The section's public face, and a SERVER component - which is the entire reason it exists
 * as a separate file.
 *
 * The JSON-LD has to be in the served HTML: "view-source of the production build" is an
 * acceptance criterion, and the repo's existing `next/script` pattern does not meet it -
 * `afterInteractive` injects the tag after hydration, so `.next/server/app/*.html` contains
 * zero `application/ld+json` on every page that uses it. A plain `<script>` does land in the
 * markup, but React warns when a client component renders one ("Scripts inside React
 * components are never executed when rendering on the client"), and the section shell is a
 * client component from its first line.
 *
 * So the graph is emitted here, on the server, and handed to the shell as `children` for it
 * to place at the bottom of the `<section>`. Server-rendered, in view-source, inside the
 * section, and no warning - the three things that were pulling against each other.
 */
export default function Disciplines() {
  return (
    <DisciplinesShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: ITEM_LIST_JSON_LD }}
      />
    </DisciplinesShell>
  );
}
