export const RECURRING_DESC_PREFIX = "[Tekrarlayan]";

/** Açıklamada tekrarlayan önekini kalın gösterir (İşlemler tablosu vb.). */
export function TransactionDescriptionText({
  description,
}: {
  description: string | null;
}) {
  if (description == null || description === "") {
    return "—";
  }
  if (description.startsWith(RECURRING_DESC_PREFIX)) {
    const rest = description.slice(RECURRING_DESC_PREFIX.length).trimStart();
    return (
      <>
        <span className="font-bold">{RECURRING_DESC_PREFIX}</span>
        {rest ? <> {rest}</> : null}
      </>
    );
  }
  return description;
}
