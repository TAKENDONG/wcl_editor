// Ecran vide ASSUME. Le portail ne fabrique jamais de chiffre : tant que la
// sonde de lecture n'a pas tourne, les modules E et F restent vides et disent
// pourquoi. Un graphique de demonstration serait la premiere chose qu'un
// editeur prendrait pour un engagement.
export function EmptyState({ title, explanation }: { title: string; explanation: string }) {
  return (
    <div className="notice notice--empty">
      <strong>{title}</strong>
      <p style={{ margin: '0.4rem 0 0' }}>{explanation}</p>
    </div>
  );
}
