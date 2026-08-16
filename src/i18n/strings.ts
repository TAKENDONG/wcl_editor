// Le cahier exige FR / EN / ES (module A). Le francais fait foi : c'est la
// langue du cahier des charges et celle de la CMCI.

export type Locale = 'fr' | 'en' | 'es';

export type Strings = {
  brand: string;
  navVitrine: string;
  navCatalog: string;
  navAnalytics: string;
  navRoyalties: string;
  navPayouts: string;
  navReview: string;
  navSignOut: string;
  heroTitle: string;
  heroLead: string;
  heroCta: string;
  modelTitle: string;
  modelPool: string;
  modelPage: string;
  modelValidated: string;
  modelRate: string;
  modelPublicDomain: string;
  faqTitle: string;
  signInTitle: string;
  email: string;
  password: string;
  signIn: string;
  signUp: string;
  registerTitle: string;
  kindAuthor: string;
  kindPublisher: string;
  displayName: string;
  legalName: string;
  country: string;
  create: string;
  catalogTitle: string;
  newWork: string;
  title: string;
  authors: string;
  language: string;
  isbn: string;
  description: string;
  save: string;
  submit: string;
  withdraw: string;
  rightsDeclaration: string;
  territories: string;
  noData: string;
  pendingProbe: string;
  reviewTitle: string;
  approve: string;
  requestChanges: string;
  reject: string;
  reviewNotes: string;
  duplicates: string;
};

const fr: Strings = {
  brand: 'WCL — Portail éditeurs',
  navVitrine: 'Accueil', navCatalog: 'Catalogue', navAnalytics: 'Statistiques',
  navRoyalties: 'Redevances', navPayouts: 'Versements', navReview: 'Validation',
  navSignOut: 'Se déconnecter',
  heroTitle: 'Publiez vos ouvrages. Soyez payé aux pages réellement lues.',
  heroLead:
    "World Conquest Library est la bibliothèque numérique de la CMCI. Les éditeurs et auteurs " +
    "y publient leurs ouvrages et perçoivent une redevance calculée sur les pages effectivement " +
    "lues, selon une formule publiée que chacun peut recalculer.",
  heroCta: 'Devenir auteur ou éditeur',
  modelTitle: 'Le modèle de rémunération, en cinq lignes',
  modelPool: 'Un pool égal à 30 % de la recette nette des abonnements de la période.',
  modelPage: 'Une page rémunérée = 1 800 signes de texte courant, mesurés par WCL sur le fichier déposé.',
  modelValidated: 'Une page est validée lorsqu’elle a été réellement parcourue, avec un temps de lecture cohérent.',
  modelRate: 'Taux par page = pool ÷ total des pages validées. Votre part = vos pages validées × ce taux.',
  modelPublicDomain: 'Les titres du domaine public ne perçoivent rien, mais comptent dans le total.',
  faqTitle: 'Questions fréquentes',
  signInTitle: 'Accéder à votre espace',
  email: 'Adresse électronique', password: 'Mot de passe',
  signIn: 'Se connecter', signUp: 'Créer un compte',
  registerTitle: 'Créer votre espace éditeur',
  kindAuthor: 'Auteur indépendant', kindPublisher: 'Maison d’édition',
  displayName: 'Nom public', legalName: 'Raison sociale', country: 'Pays',
  create: 'Créer',
  catalogTitle: 'Votre catalogue', newWork: 'Déposer un ouvrage',
  title: 'Titre', authors: 'Auteur(s)', language: 'Langue', isbn: 'ISBN',
  description: 'Description', save: 'Enregistrer', submit: 'Envoyer en validation',
  withdraw: 'Retirer',
  rightsDeclaration: 'Déclaration de droits', territories: 'Territoires couverts',
  noData: 'Aucune donnée pour l’instant.',
  pendingProbe:
    "Ces chiffres seront alimentés par la sonde de lecture, qui n’est pas encore livrée. " +
    "Aucune donnée n’est inventée : tant que la sonde n’a pas tourné un mois complet, " +
    "cet écran reste vide.",
  reviewTitle: 'File de validation',
  approve: 'Approuver', requestChanges: 'Demander une correction', reject: 'Rejeter',
  reviewNotes: 'Motif (obligatoire sauf approbation)', duplicates: 'Doublons probables',
};

const en: Strings = {
  ...fr,
  brand: 'WCL — Publisher portal',
  navVitrine: 'Home', navCatalog: 'Catalogue', navAnalytics: 'Statistics',
  navRoyalties: 'Royalties', navPayouts: 'Payouts', navReview: 'Review',
  navSignOut: 'Sign out',
  heroTitle: 'Publish your works. Get paid for pages actually read.',
  heroLead:
    'World Conquest Library is CMCI’s digital library. Publishers and authors publish their ' +
    'works here and earn a royalty computed on pages actually read, using a published formula ' +
    'anyone can recompute.',
  heroCta: 'Become an author or publisher',
  modelTitle: 'The remuneration model, in five lines',
  modelPool: 'A pool equal to 30% of the period’s net subscription revenue.',
  modelPage: 'One paid page = 1,800 characters of running text, measured by WCL on the file you submit.',
  modelValidated: 'A page counts once genuinely traversed, with a coherent reading time.',
  modelRate: 'Rate per page = pool ÷ total validated pages. Your share = your validated pages × that rate.',
  modelPublicDomain: 'Public-domain titles earn nothing, but they count in the total.',
  faqTitle: 'Frequently asked questions',
  signInTitle: 'Access your workspace', email: 'Email address', password: 'Password',
  signIn: 'Sign in', signUp: 'Create an account',
  registerTitle: 'Create your publisher workspace',
  kindAuthor: 'Independent author', kindPublisher: 'Publishing house',
  displayName: 'Public name', legalName: 'Legal name', country: 'Country', create: 'Create',
  catalogTitle: 'Your catalogue', newWork: 'Submit a work',
  title: 'Title', authors: 'Author(s)', language: 'Language', isbn: 'ISBN',
  description: 'Description', save: 'Save', submit: 'Send for review', withdraw: 'Withdraw',
  rightsDeclaration: 'Rights declaration', territories: 'Territories covered',
  noData: 'No data yet.',
  pendingProbe:
    'These figures will be fed by the reading probe, which has not shipped yet. Nothing is ' +
    'fabricated: until the probe has run for a full month, this screen stays empty.',
  reviewTitle: 'Review queue',
  approve: 'Approve', requestChanges: 'Request changes', reject: 'Reject',
  reviewNotes: 'Reason (required unless approving)', duplicates: 'Likely duplicates',
};

const es: Strings = {
  ...fr,
  brand: 'WCL — Portal de editores',
  navVitrine: 'Inicio', navCatalog: 'Catálogo', navAnalytics: 'Estadísticas',
  navRoyalties: 'Regalías', navPayouts: 'Pagos', navReview: 'Validación',
  navSignOut: 'Cerrar sesión',
  heroTitle: 'Publique sus obras. Cobre por las páginas realmente leídas.',
  heroLead:
    'World Conquest Library es la biblioteca digital de la CMCI. Editores y autores publican ' +
    'aquí sus obras y perciben una regalía calculada sobre las páginas realmente leídas, según ' +
    'una fórmula publicada que cualquiera puede recalcular.',
  heroCta: 'Ser autor o editor',
  modelTitle: 'El modelo de remuneración, en cinco líneas',
  modelPool: 'Un fondo igual al 30 % de los ingresos netos por suscripción del período.',
  modelPage: 'Una página remunerada = 1 800 caracteres de texto corrido, medidos por WCL.',
  modelValidated: 'Una página se valida cuando ha sido realmente recorrida, con un tiempo coherente.',
  modelRate: 'Tasa por página = fondo ÷ total de páginas validadas. Su parte = sus páginas × esa tasa.',
  modelPublicDomain: 'Los títulos de dominio público no cobran, pero cuentan en el total.',
  faqTitle: 'Preguntas frecuentes',
  signInTitle: 'Acceder a su espacio', email: 'Correo electrónico', password: 'Contraseña',
  signIn: 'Iniciar sesión', signUp: 'Crear una cuenta',
  registerTitle: 'Cree su espacio de editor',
  kindAuthor: 'Autor independiente', kindPublisher: 'Editorial',
  displayName: 'Nombre público', legalName: 'Razón social', country: 'País', create: 'Crear',
  catalogTitle: 'Su catálogo', newWork: 'Depositar una obra',
  title: 'Título', authors: 'Autor(es)', language: 'Idioma', isbn: 'ISBN',
  description: 'Descripción', save: 'Guardar', submit: 'Enviar a validación',
  withdraw: 'Retirar',
  rightsDeclaration: 'Declaración de derechos', territories: 'Territorios cubiertos',
  noData: 'Todavía no hay datos.',
  pendingProbe:
    'Estas cifras se alimentarán de la sonda de lectura, que aún no se ha entregado. No se ' +
    'inventa ningún dato: hasta que la sonda funcione un mes completo, esta pantalla queda vacía.',
  reviewTitle: 'Cola de validación',
  approve: 'Aprobar', requestChanges: 'Solicitar corrección', reject: 'Rechazar',
  reviewNotes: 'Motivo (obligatorio salvo aprobación)', duplicates: 'Duplicados probables',
};

export const STRINGS: Record<Locale, Strings> = { fr, en, es };
