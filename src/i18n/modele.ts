// Les textes du MODÈLE DE RÉMUNÉRATION, en FR / EN / ES (09/10/2026).
//
// Ils ne sont pas écrits en dur : ils se composent à partir des réglages EN
// VIGUEUR (`portail_modele()`), ceux-là mêmes que lit le calcul des
// redevances. WCL n'a pas encore tranché la part, le modèle ni la fréquence des
// versements ; quand il tranchera depuis la page « Réglages », la vitrine et le
// contrat diront la nouvelle règle sans qu'on touche au code.

import type { Locale } from './strings.ts';

export type Modele = {
  modele: 'par_abonne' | 'fonds_commun';
  part: number;
  assiette: 'net' | 'brut';
  devise: string;
  seuil_minutes: number;
  plafond_heures: number;
  versement_seuil: number;
  tous_les_n_mois: number;
  verification: boolean;
};

/// Valeurs de repli (celles de la migration) tant que le serveur n'a pas
/// répondu : le texte reste juste, il n'attend pas.
export const MODELE_PAR_DEFAUT: Modele = {
  modele: 'par_abonne',
  part: 0.6,
  assiette: 'net',
  devise: 'USD',
  seuil_minutes: 2,
  plafond_heures: 6,
  versement_seuil: 10,
  tous_les_n_mois: 3,
  verification: true,
};

export type TextesModele = {
  heroTitle: string;
  heroLead: string;
  panelTitle: string;
  formula: string[];
  panelNote: string;
  modelTitle: string;
  lines: string[];
  faqVerifyQ: string;
  faqVerifyA: string;
  contractTerms: string[];
  /// Phrase courte sous le relevé : comment lire « recette attribuée ».
  statementHint: string;
};

const pct = (part: number) => `${Math.round(part * 1000) / 10} %`;
const nombre = (locale: Locale, n: number) => n.toLocaleString(locale === 'en' ? 'en-GB' : locale);

function frequence(locale: Locale, n: number): string {
  const fr: Record<number, string> = { 1: 'chaque mois', 2: 'tous les deux mois', 3: 'chaque trimestre', 4: 'tous les quatre mois', 6: 'chaque semestre', 12: 'chaque année' };
  const en: Record<number, string> = { 1: 'every month', 2: 'every two months', 3: 'every quarter', 4: 'every four months', 6: 'every six months', 12: 'every year' };
  const es: Record<number, string> = { 1: 'cada mes', 2: 'cada dos meses', 3: 'cada trimestre', 4: 'cada cuatro meses', 6: 'cada semestre', 12: 'cada año' };
  return ({ fr, en, es }[locale])[n] ?? `${n}`;
}

export function textesModele(locale: Locale, m: Modele): TextesModele {
  const part = pct(m.part);
  const seuil = nombre(locale, m.seuil_minutes);
  const plafond = nombre(locale, m.plafond_heures);
  const versement = `${nombre(locale, m.versement_seuil)} ${m.devise}`;
  const parAbonne = m.modele === 'par_abonne';

  if (locale === 'en') {
    return {
      heroTitle: 'Publish your books. Get paid for the time readers actually spend in them.',
      heroLead:
        'WCL App is a Christian digital library by subscription. Publishers and authors publish ' +
        'their books in it and receive royalties calculated on real reading time, with a published ' +
        'formula anyone can recompute.',
      panelTitle: 'The formula, published',
      formula: parAbonne
        ? ['for each subscriber: their payment × their time on your title ÷ their total reading time',
           `your royalty = sum of those amounts × ${part}`]
        : ['fund = all subscription revenue of the month',
           `your royalty = fund × your reading time ÷ total reading time × ${part}`],
      panelNote:
        'The same calculation for everyone, recomputable from the published figures. A framework ' +
        'agreement may set a different share or a minimum guarantee for a publisher.',
      modelTitle: 'How you are paid',
      lines: [
        `Publishers receive ${part} of the ${m.assiette === 'net' ? 'net revenue (after payment fees)' : 'gross revenue'} of subscriptions.`,
        parAbonne
          ? 'Each subscriber’s money goes to the books THAT subscriber read, in proportion to their reading time.'
          : 'All revenue of the month forms one fund, shared in proportion to reading time.',
        `A book counts for a subscriber once they have read it at least ${seuil} minutes in the month; reading beyond ${plafond} hours a day is scaled down.`,
        'Only paying subscribers’ reading generates royalties. Books without a rights holder are counted but receive nothing.',
        `Payments are made ${frequence('en', m.tous_les_n_mois)}, from ${versement}; smaller amounts are carried over.`,
      ],
      faqVerifyQ: 'How can I check my statement?',
      faqVerifyA:
        'Each month publishes the revenue, the total qualified reading time and, for each of your ' +
        'titles, the revenue attributed and the share applied: multiply one by the other to find ' +
        'your amount to the cent.',
      contractTerms: [
        `Your share: ${part} of the subscription revenue attributed to your titles, unless your framework agreement says otherwise.`,
        parAbonne
          ? 'Attribution: each subscriber’s revenue is shared between the titles they read, in proportion to reading time.'
          : 'Attribution: the month’s revenue is shared between all titles read, in proportion to reading time.',
        `A title counts once a subscriber has read it ${seuil} minutes in the month. Reading beyond ${plafond} hours a day is scaled down.`,
        m.verification
          ? 'Your account must be verified by WCL (identity or company documents, rights) before you submit a title or receive a payment.'
          : 'WCL may ask for identity, company or rights documents at any time.',
        `Payments ${frequence('en', m.tous_les_n_mois)}, from ${versement}. Below that, the amount is carried over, never cancelled.`,
      ],
      statementHint: 'Attributed revenue × share = amount.',
    };
  }

  if (locale === 'es') {
    return {
      heroTitle: 'Publique sus libros. Cobre por el tiempo que los lectores pasan en ellos.',
      heroLead:
        'WCL App es una biblioteca digital cristiana por suscripción. Editores y autores publican ' +
        'en ella sus obras y reciben regalías calculadas sobre el tiempo de lectura real, con una ' +
        'fórmula publicada que cualquiera puede recalcular.',
      panelTitle: 'La fórmula, publicada',
      formula: parAbonne
        ? ['por cada suscriptor: su pago × su tiempo en su título ÷ su tiempo total de lectura',
           `su regalía = suma de esos importes × ${part}`]
        : ['fondo = todos los ingresos de suscripción del mes',
           `su regalía = fondo × su tiempo de lectura ÷ tiempo total × ${part}`],
      panelNote:
        'El mismo cálculo para todos, recalculable a partir de las cifras publicadas. Un acuerdo ' +
        'marco puede fijar otra parte o un mínimo garantizado para un editor.',
      modelTitle: 'Cómo se le paga',
      lines: [
        `Los editores reciben el ${part} de los ingresos ${m.assiette === 'net' ? 'netos (tras comisiones de pago)' : 'brutos'} de las suscripciones.`,
        parAbonne
          ? 'El dinero de cada suscriptor va a los libros que ESE suscriptor leyó, en proporción a su tiempo de lectura.'
          : 'Todos los ingresos del mes forman un fondo único, repartido en proporción al tiempo de lectura.',
        `Un libro cuenta para un suscriptor cuando lo ha leído al menos ${seuil} minutos en el mes; la lectura por encima de ${plafond} horas al día se reduce en proporción.`,
        'Solo la lectura de suscriptores de pago genera regalías. Los libros sin titular de derechos cuentan pero no perciben nada.',
        `Los pagos se hacen ${frequence('es', m.tous_les_n_mois)}, a partir de ${versement}; los importes menores se acumulan.`,
      ],
      faqVerifyQ: '¿Cómo verifico mi liquidación?',
      faqVerifyA:
        'Cada mes se publican los ingresos, el tiempo de lectura total y, para cada título, el ' +
        'ingreso atribuido y la parte aplicada: multiplique uno por otro y obtendrá su importe ' +
        'al céntimo.',
      contractTerms: [
        `Su parte: ${part} de los ingresos de suscripción atribuidos a sus títulos, salvo que su acuerdo marco diga otra cosa.`,
        parAbonne
          ? 'Atribución: los ingresos de cada suscriptor se reparten entre los títulos que leyó, en proporción al tiempo de lectura.'
          : 'Atribución: los ingresos del mes se reparten entre todos los títulos leídos, en proporción al tiempo de lectura.',
        `Un título cuenta cuando un suscriptor lo ha leído ${seuil} minutos en el mes. La lectura por encima de ${plafond} horas al día se reduce.`,
        m.verification
          ? 'Su cuenta debe ser verificada por WCL (documentos de identidad o de empresa, derechos) antes de enviar un título o recibir un pago.'
          : 'WCL puede pedir documentos de identidad, de empresa o de derechos en cualquier momento.',
        `Pagos ${frequence('es', m.tous_les_n_mois)}, a partir de ${versement}. Por debajo, el importe se acumula, nunca se anula.`,
      ],
      statementHint: 'Ingreso atribuido × parte = importe.',
    };
  }

  return {
    heroTitle: 'Publiez vos ouvrages. Soyez payé au temps réellement passé à les lire.',
    heroLead:
      'WCL App est une bibliothèque numérique chrétienne par abonnement. Les éditeurs et auteurs ' +
      'y publient leurs ouvrages et perçoivent une redevance calculée sur le temps de lecture ' +
      'réel, selon une formule publiée que chacun peut recalculer.',
    panelTitle: 'La formule, publiée',
    formula: parAbonne
      ? ['pour chaque abonné : son paiement × son temps sur votre titre ÷ son temps de lecture total',
         `votre redevance = somme de ces montants × ${part}`]
      : ['fonds = toute la recette des abonnements du mois',
         `votre redevance = fonds × votre temps de lecture ÷ temps total × ${part}`],
    panelNote:
      'Le même calcul pour tous, recalculable à partir des chiffres publiés. Un accord-cadre peut ' +
      'fixer une autre part ou un minimum garanti pour un éditeur.',
    modelTitle: 'Comment vous êtes payé',
    lines: [
      `Les éditeurs reçoivent ${part} de la recette ${m.assiette === 'net' ? 'nette (après frais de paiement)' : 'brute'} des abonnements.`,
      parAbonne
        ? 'L’argent de chaque abonné va aux livres que CET abonné a lus, à proportion de son temps de lecture.'
        : 'Toute la recette du mois forme un fonds unique, partagé à proportion du temps de lecture.',
      `Un livre compte pour un abonné dès qu’il l’a lu au moins ${seuil} minutes dans le mois ; au-delà de ${plafond} heures par jour, la lecture est ramenée à proportion.`,
      'Seule la lecture des abonnés payants génère des redevances. Les titres sans ayant droit comptent dans le partage, mais ne perçoivent rien.',
      `Les versements ont lieu ${frequence('fr', m.tous_les_n_mois)}, à partir de ${versement} ; en dessous, ils sont reportés.`,
    ],
    faqVerifyQ: 'Comment vérifier mon relevé ?',
    faqVerifyA:
      'Chaque mois publie la recette, le temps de lecture total et, pour chacun de vos titres, la ' +
      'recette attribuée et la part appliquée : multipliez l’une par l’autre, vous retrouvez votre ' +
      'montant au centime près.',
    contractTerms: [
      `Votre part : ${part} de la recette des abonnements attribuée à vos titres, sauf disposition contraire de votre accord-cadre.`,
      parAbonne
        ? 'Attribution : la recette de chaque abonné se partage entre les titres qu’il a lus, à proportion du temps de lecture.'
        : 'Attribution : la recette du mois se partage entre tous les titres lus, à proportion du temps de lecture.',
      `Un titre compte dès qu’un abonné l’a lu ${seuil} minutes dans le mois. Au-delà de ${plafond} heures par jour, la lecture est ramenée à proportion.`,
      m.verification
        ? 'Votre compte doit être vérifié par WCL (pièces d’identité ou de société, droits) avant de soumettre un titre ou de recevoir un versement.'
        : 'WCL peut demander à tout moment des pièces d’identité, de société ou de droits.',
      `Versements ${frequence('fr', m.tous_les_n_mois)}, à partir de ${versement}. En dessous, le montant est reporté, jamais annulé.`,
    ],
    statementHint: 'Recette attribuée × part = montant.',
  };
}
