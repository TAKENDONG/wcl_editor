/// Traduit un code d'erreur serveur en phrase utile.
///
/// Les RPC levent des codes (`file_required`, `forbidden`, ...). Affiches tels
/// quels, ils ne disent rien : un valideur qui lit « file_required » ne sait
/// pas si le defaut vient de lui, de l'editeur, ou de la plateforme. La table
/// des messages vit dans l'i18n, parce que ces ecrans sont trilingues comme le
/// reste du portail.
///
/// Un code inconnu est rendu TEL QUEL plutot que masque derriere un « erreur
/// inconnue » : mieux vaut un code que le support peut chercher que rien.
export function humaniseServerError(
  message: string,
  table: Record<string, string>,
): string {
  for (const [code, phrase] of Object.entries(table)) {
    if (message.includes(code)) return phrase;
  }
  return message;
}
