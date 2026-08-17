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
  navPeriods: string;
  privacyTitle: string;
  heroCtaSignedIn: string;
  rangeFrom: string;
  rangeTo: string;
  periodLabel: string;
  dayLabel: string;
  monthLabel: string;
  yearLabel: string;
  range: { day: string; month: string; year: string; custom: string };
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
  /// Messages des refus leves par la validation et le pilotage des periodes.
  /// Un code brut ne dit rien : le valideur doit savoir QUOI FAIRE.
  serverErrors: Record<string, string>;
  forgotPassword: string;
  resetSent: string;
  emailRequiredForReset: string;
  confirmEmail: string;
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
  faqVerifyQ: string;
  faqVerifyA: string;
  faqProtectQ: string;
  faqProtectA: string;
  heroPanelTitle: string;
  heroPanelNote: string;
  footerNote: string;
  formulaRate: string;
  formulaShare: string;
  subtitle: string;
  edition: string;
  categories: string;
  keywords: string;
  bookFile: string;
  bookFileHint: string;
  coverFile: string;
  measured: string;
  chars: string;
  submitHint: string;
  errFileRequired: string;
  errNeedsConversion: string;
  sectionWork: string;
  sectionClassify: string;
  sectionFiles: string;
  sectionRights: string;
  coverHint: string;
  working: string;
  navAccount: string;
  accountLead: string;
  noPublisher: string;
  sectionTeam: string;
  sectionContract: string;
  sectionPayout: string;
  sectionDocuments: string;
  role: string;
  invite: string;
  inviteHint: string;
  revoke: string;
  sign: string;
  signatureName: string;
  contractIntro: string;
  contractAgree: string;
  contractSigned: string;
  contractTermPool: string;
  contractTermPage: string;
  contractTermCap: string;
  contractTermProvisional: string;
  payoutMethod: string;
  payoutReference: string;
  payoutHint: string;
  payoutRestricted: string;
  bankTransfer: string;
  currency: string;
  taxId: string;
  taxRegime: string;
  saved: string;
  docIdentity: string;
  docLegal: string;
  docRights: string;
  docHint: string;
  docPrivacy: string;
  docPending: string;
  docAccepted: string;
  docRejected: string;
  termsTitle: string;
  termsIntro: string;
  termsAuthoritative: string;
  backHome: string;
  bulkTitle: string;
  bulkPick: string;
  bulkHint: string;
  bulkReady: string;
  bulkCreated: string;
  bulkImport: string;
  bulkTemplate: string;
  bulkNote: string;
  sectionSecurity: string;
  mfaIntro: string;
  mfaEnable: string;
  mfaScan: string;
  mfaCode: string;
  mfaConfirm: string;
  mfaActive: string;
  mfaRemove: string;
  cancel: string;
};

const fr: Strings = {
  brand: 'WCL — Portail éditeurs',
  navVitrine: 'Accueil', navCatalog: 'Catalogue', navAnalytics: 'Statistiques',
  navRoyalties: 'Redevances', navPayouts: 'Versements', navReview: 'Validation',
  navPeriods: 'Périodes',
  privacyTitle: 'Données de lecture',
  heroCtaSignedIn: 'Accéder à mon espace',
  rangeFrom: 'Du', rangeTo: 'Au',
  periodLabel: 'Période',
  dayLabel: 'jour', monthLabel: 'mois', yearLabel: 'année',
  range: { day: 'Jour', month: 'Mois', year: 'Année', custom: 'Personnalisé' },
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
  serverErrors: {
    forbidden: 'Cet écran est réservé aux administrateurs WCL.',
    file_required: 'Aucun fichier mesuré sur ce dossier. L’éditeur doit déposer un EPUB — ou convertir son fichier Word — avant que l’ouvrage puisse être publié.',
    normalization_missing: 'La pagination normalisée n’a pas été calculée. Le fichier doit être mesuré avant approbation : c’est elle qui détermine la redevance.',
    rights_declaration_required: 'L’éditeur n’a pas déclaré ses droits. Une publication sans déclaration exposerait WCL.',
    notes_required: 'Un refus ou une demande de correction exige un motif : l’éditeur doit savoir quoi reprendre.',
    not_reviewable: 'Ce dossier n’est plus en attente de décision — il a déjà été traité.',
    not_found: 'Ce dossier n’existe plus.',
    unknown_decision: 'Décision inconnue.',
  },
  signInTitle: 'Accéder à votre espace',
  forgotPassword: 'Mot de passe oublié ?',
  resetSent: 'Si un compte existe pour cette adresse, un lien de réinitialisation vient d’être envoyé.',
  emailRequiredForReset: 'Saisissez d’abord votre adresse électronique.',
  confirmEmail: 'Compte créé. Confirmez votre adresse électronique, puis revenez vous connecter.',
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
  faqVerifyQ: 'Comment vérifier mon relevé ?',
  faqVerifyA:
    'Chaque période publie le montant du pool, le total des pages validées de la plateforme et ' +
    'le taux par page. Multipliez vos pages validées par ce taux : vous devez retrouver votre ' +
    'part, au centime près.',
  faqProtectQ: 'Que protège exactement WCL ?',
  faqProtectA:
    'Vos fichiers sont stockés dans un espace privé, servis par des liens qui expirent en quinze ' +
    'minutes, tronqués à un aperçu pour les non-abonnés, et chiffrés sur l’appareil de chaque ' +
    'lecteur. Il n’y a en revanche ni DRM industriel, ni filigrane par lecteur, ni effacement à ' +
    'distance : nous préférons l’écrire ici plutôt que de le laisser supposer.',
  heroPanelTitle: 'La formule, publiée',
  heroPanelNote:
    'Ni barème négocié, ni part discrétionnaire. Le même calcul pour tous, recalculable par ' +
    'chacun à partir des chiffres publiés.',
  footerNote: 'World Conquest Library — Communauté Missionnaire Chrétienne Internationale',
  formulaRate:  'taux_par_page = pool ÷ pages_validées_totales',
  formulaShare: 'votre_part    = vos_pages_validées × taux_par_page',
  subtitle: 'Sous-titre', edition: 'Édition', categories: 'Thèmes et catégories',
  keywords: 'Mots-clés',
  bookFile: 'Fichier de l’ouvrage', coverFile: 'Couverture',
  bookFileHint: 'EPUB recommandé. PDF, DOCX et TXT acceptés — le PDF devra passer par la conversion assistée avant d’être mesuré.',
  measured: 'Mesuré par WCL — pages normalisées :', chars: 'signes',
  submitHint: 'L’envoi en validation exige un fichier mesuré et une déclaration de droits. Une fois envoyé, le dossier n’est plus modifiable : c’est ce que WCL examine.',
  errFileRequired: 'Déposez le fichier de l’ouvrage avant l’envoi.',
  errNeedsConversion: 'Le PDF doit passer par la conversion assistée avant d’être mesuré : ses pages ne peuvent pas être comptées en l’état.',
  sectionWork: 'L’ouvrage', sectionClassify: 'Classement',
  sectionFiles: 'Fichiers', sectionRights: 'Droits',
  coverHint: 'JPG ou PNG, format portrait de préférence.',
  working: 'Envoi en cours…',
  navAccount: 'Compte', accountLead: 'Votre structure, votre équipe, votre contrat et vos coordonnées de versement.',
  noPublisher: 'Aucun espace éditeur n’est rattaché à ce compte.',
  sectionTeam: 'Équipe et rôles', sectionContract: 'Contrat', sectionPayout: 'Versements',
  sectionDocuments: 'Pièces justificatives',
  role: 'Rôle', invite: 'Inviter', revoke: 'Révoquer',
  inviteHint: 'La personne doit déjà avoir un compte WCL : nous ne créons jamais de compte au nom d’un tiers.',
  sign: 'Signer électroniquement', signatureName: 'Nom et prénom du signataire',
  contractIntro: 'En signant, vous acceptez les règles de rémunération du portail. Elles sont publiées et identiques pour tous les éditeurs.',
  contractAgree: 'Je déclare détenir les droits de distribution numérique des ouvrages que je dépose, et j’accepte les termes ci-dessus.',
  contractSigned: 'Contrat signé',
  contractTermPool: 'Le pool vaut 30 % de la recette nette des abonnements de la période.',
  contractTermPage: 'Une page rémunérée = 1 800 signes de texte courant, mesurés par WCL sur le fichier déposé. La rémunération porte sur les pages effectivement parcourues, jamais sur la longueur totale de l’ouvrage.',
  contractTermCap: 'Aucun éditeur ne peut dépasser 25 % du pool d’une période sans revue manuelle.',
  contractTermProvisional: 'Les plafonds de lecture sont provisoires et seront recalibrés à l’issue de la période d’observation, à la hausse comme à la baisse.',
  payoutMethod: 'Moyen de versement', payoutReference: 'Référence (numéro ou IBAN)',
  bankTransfer: 'Virement bancaire', currency: 'Devise',
  taxId: 'Identifiant fiscal', taxRegime: 'Régime fiscal', saved: 'Enregistré.',
  payoutHint: 'Ces informations ne sont visibles que des rôles administrateur et comptable.',
  payoutRestricted: 'Réservé aux rôles administrateur et comptable.',
  docIdentity: 'Pièce d’identité du responsable', docLegal: 'Existence légale de la structure',
  docRights: 'Attestation de détention des droits',
  docHint: 'PDF ou image.', docPending: 'En attente', docAccepted: 'Acceptée', docRejected: 'Refusée',
  docPrivacy: 'Ces pièces sont déposées dans un espace privé et ne sont jamais re-servies par l’API. Seule l’équipe WCL les consulte.',
  termsTitle: 'Conditions générales',
  termsIntro: 'Les règles applicables à tout auteur ou éditeur qui dépose un ouvrage sur WCL. Elles sont publiques, et identiques pour tous.',
  termsAuthoritative: 'La version française fait foi.',
  backHome: 'Retour à l’accueil',
  bulkTitle: 'Import en masse', bulkPick: 'Fichier CSV ou XLSX',
  bulkHint: 'Colonnes : titre, sous-titre, auteurs, langue, isbn, edition, description, categories, mots-cles.',
  bulkReady: 'lignes lues — prêtes à importer.', bulkCreated: 'brouillons créés.',
  bulkImport: 'Importer', bulkTemplate: 'Télécharger le modèle',
  bulkNote: 'L’import crée des brouillons de métadonnées. Chaque ouvrage a besoin de son propre fichier : attachez-les ensuite, un à un.',
  sectionSecurity: 'Sécurité',
  mfaIntro: 'La double authentification protège votre catalogue et vos coordonnées de versement. Elle est exigée par le cahier des charges pour les comptes éditeurs.',
  mfaEnable: 'Activer la double authentification',
  mfaScan: 'Scannez ce code avec votre application d’authentification, puis saisissez le code à six chiffres. Conservez la clé ci-dessous : elle permet de reconfigurer un nouvel appareil.',
  mfaCode: 'Code à six chiffres', mfaConfirm: 'Confirmer', mfaActive: 'Active',
  mfaRemove: 'Désactiver', cancel: 'Annuler',
};

const en: Strings = {
  ...fr,
  brand: 'WCL — Publisher portal',
  navVitrine: 'Home', navCatalog: 'Catalogue', navAnalytics: 'Statistics',
  navRoyalties: 'Royalties', navPayouts: 'Payouts', navReview: 'Review',
  navPeriods: 'Periods',
  privacyTitle: 'Reading data',
  heroCtaSignedIn: 'Go to my space',
  rangeFrom: 'From', rangeTo: 'To',
  periodLabel: 'Period',
  dayLabel: 'day', monthLabel: 'month', yearLabel: 'year',
  range: { day: 'Day', month: 'Month', year: 'Year', custom: 'Custom' },
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
  serverErrors: {
    forbidden: 'This screen is reserved for WCL administrators.',
    file_required: 'No measured file on this submission. The publisher must upload an EPUB — or convert their Word file — before the work can be published.',
    normalization_missing: 'Normalised pagination has not been computed. The file must be measured before approval: it determines the royalty.',
    rights_declaration_required: 'The publisher has not declared their rights. Publishing without a declaration would expose WCL.',
    notes_required: 'A rejection or correction request requires a reason: the publisher must know what to fix.',
    not_reviewable: 'This submission is no longer awaiting a decision — it has already been handled.',
    not_found: 'This submission no longer exists.',
    unknown_decision: 'Unknown decision.',
  },
  signInTitle: 'Access your workspace',
  forgotPassword: 'Forgotten password?',
  resetSent: 'If an account exists for this address, a reset link has just been sent.',
  emailRequiredForReset: 'Enter your email address first.',
  confirmEmail: 'Account created. Confirm your email address, then come back and sign in.', email: 'Email address', password: 'Password',
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
  faqVerifyQ: 'How do I verify my statement?',
  faqVerifyA:
    'Every period publishes the pool amount, the platform’s total validated pages and the rate ' +
    'per page. Multiply your validated pages by that rate: you must find your share, to the cent.',
  faqProtectQ: 'What exactly does WCL protect?',
  faqProtectA:
    'Your files sit in private storage, are served through links that expire in fifteen minutes, ' +
    'are truncated to a preview for non-subscribers, and are encrypted on each reader’s device. ' +
    'There is however no industrial DRM, no per-reader watermark and no remote wipe: we would ' +
    'rather write that here than let it be assumed.',
  heroPanelTitle: 'The formula, published',
  heroPanelNote:
    'No negotiated rate, no discretionary share. The same calculation for everyone, recomputable ' +
    'by anyone from the published figures.',
  footerNote: 'World Conquest Library — Communauté Missionnaire Chrétienne Internationale',
  formulaRate:  'rate_per_page = pool ÷ total_validated_pages',
  formulaShare: 'your_share    = your_validated_pages × rate_per_page',
  subtitle: 'Subtitle', edition: 'Edition', categories: 'Themes and categories',
  keywords: 'Keywords',
  bookFile: 'Work file', coverFile: 'Cover',
  bookFileHint: 'EPUB recommended. PDF, DOCX and TXT accepted — PDF must go through assisted conversion before it can be measured.',
  measured: 'Measured by WCL — normalized pages:', chars: 'characters',
  submitHint: 'Sending for review requires a measured file and a rights declaration. Once sent, the dossier is locked: it is what WCL examines.',
  errFileRequired: 'Upload the work file before sending.',
  errNeedsConversion: 'PDF must go through assisted conversion before measurement: its pages cannot be counted as is.',
  sectionWork: 'The work', sectionClassify: 'Classification',
  sectionFiles: 'Files', sectionRights: 'Rights',
  coverHint: 'JPG or PNG, portrait format preferred.',
  working: 'Sending…',
  navAccount: 'Account', accountLead: 'Your organisation, your team, your contract and your payout details.',
  noPublisher: 'No publisher workspace is attached to this account.',
  sectionTeam: 'Team and roles', sectionContract: 'Contract', sectionPayout: 'Payouts',
  sectionDocuments: 'Supporting documents',
  role: 'Role', invite: 'Invite', revoke: 'Revoke',
  inviteHint: 'The person must already have a WCL account: we never create an account on someone else’s behalf.',
  sign: 'Sign electronically', signatureName: 'Signatory’s full name',
  contractIntro: 'By signing you accept the portal’s remuneration rules. They are published and identical for every publisher.',
  contractAgree: 'I declare that I hold the digital distribution rights to the works I submit, and I accept the terms above.',
  contractSigned: 'Contract signed',
  contractTermPool: 'The pool equals 30% of the period’s net subscription revenue.',
  contractTermPage: 'One paid page = 1,800 characters of running text, measured by WCL on the submitted file. Payment covers pages actually traversed, never the work’s total length.',
  contractTermCap: 'No publisher may exceed 25% of a period’s pool without manual review.',
  contractTermProvisional: 'Reading caps are provisional and will be recalibrated after the observation period, upwards or downwards.',
  payoutMethod: 'Payout method', payoutReference: 'Reference (number or IBAN)',
  bankTransfer: 'Bank transfer', currency: 'Currency',
  taxId: 'Tax identifier', taxRegime: 'Tax regime', saved: 'Saved.',
  payoutHint: 'These details are visible only to the admin and finance roles.',
  payoutRestricted: 'Restricted to the admin and finance roles.',
  docIdentity: 'Identity document of the responsible person', docLegal: 'Legal existence of the organisation',
  docRights: 'Rights-holding attestation',
  docHint: 'PDF or image.', docPending: 'Pending', docAccepted: 'Accepted', docRejected: 'Rejected',
  docPrivacy: 'These documents are stored privately and are never re-served by the API. Only the WCL team reviews them.',
  termsTitle: 'Terms and conditions',
  termsIntro: 'The rules applying to any author or publisher who submits a work to WCL. They are public, and identical for everyone.',
  termsAuthoritative: 'The French version is authoritative.',
  backHome: 'Back to home',
  bulkTitle: 'Bulk import', bulkPick: 'CSV or XLSX file',
  bulkHint: 'Columns: title, subtitle, authors, language, isbn, edition, description, categories, keywords.',
  bulkReady: 'rows read — ready to import.', bulkCreated: 'drafts created.',
  bulkImport: 'Import', bulkTemplate: 'Download template',
  bulkNote: 'Bulk import creates metadata drafts. Each work needs its own file: attach them afterwards, one by one.',
  sectionSecurity: 'Security',
  mfaIntro: 'Two-factor authentication protects your catalogue and your payout details. The specification requires it for publisher accounts.',
  mfaEnable: 'Enable two-factor authentication',
  mfaScan: 'Scan this code with your authenticator app, then enter the six-digit code. Keep the key below: it lets you set up a new device.',
  mfaCode: 'Six-digit code', mfaConfirm: 'Confirm', mfaActive: 'Active',
  mfaRemove: 'Disable', cancel: 'Cancel',
};

const es: Strings = {
  ...fr,
  brand: 'WCL — Portal de editores',
  navVitrine: 'Inicio', navCatalog: 'Catálogo', navAnalytics: 'Estadísticas',
  navRoyalties: 'Regalías', navPayouts: 'Pagos', navReview: 'Validación',
  navPeriods: 'Periodos',
  privacyTitle: 'Datos de lectura',
  heroCtaSignedIn: 'Ir a mi espacio',
  rangeFrom: 'Desde', rangeTo: 'Hasta',
  periodLabel: 'Periodo',
  dayLabel: 'día', monthLabel: 'mes', yearLabel: 'año',
  range: { day: 'Día', month: 'Mes', year: 'Año', custom: 'Personalizado' },
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
  serverErrors: {
    forbidden: 'Esta pantalla está reservada a los administradores de WCL.',
    file_required: 'No hay archivo medido en este expediente. El editor debe depositar un EPUB —o convertir su archivo Word— antes de poder publicar la obra.',
    normalization_missing: 'No se ha calculado la paginación normalizada. El archivo debe medirse antes de la aprobación: de ella depende la regalía.',
    rights_declaration_required: 'El editor no ha declarado sus derechos. Publicar sin declaración expondría a WCL.',
    notes_required: 'Un rechazo o una petición de corrección exige un motivo: el editor debe saber qué corregir.',
    not_reviewable: 'Este expediente ya no espera decisión — ya fue tratado.',
    not_found: 'Este expediente ya no existe.',
    unknown_decision: 'Decisión desconocida.',
  },
  signInTitle: 'Acceder a su espacio', email: 'Correo electrónico', password: 'Contraseña',
  forgotPassword: '¿Contraseña olvidada?',
  resetSent: 'Si existe una cuenta para esta dirección, acaba de enviarse un enlace de restablecimiento.',
  emailRequiredForReset: 'Introduzca primero su correo electrónico.',
  confirmEmail: 'Cuenta creada. Confirme su correo electrónico y vuelva a iniciar sesión.',
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
  faqVerifyQ: '¿Cómo verificar mi liquidación?',
  faqVerifyA:
    'Cada período publica el importe del fondo, el total de páginas validadas de la plataforma y ' +
    'la tasa por página. Multiplique sus páginas validadas por esa tasa: debe encontrar su parte, ' +
    'al céntimo.',
  faqProtectQ: '¿Qué protege exactamente WCL?',
  faqProtectA:
    'Sus archivos se guardan en un espacio privado, se sirven mediante enlaces que caducan en ' +
    'quince minutos, se truncan a una vista previa para los no suscriptores y se cifran en el ' +
    'dispositivo de cada lector. En cambio no hay DRM industrial, ni marca de agua por lector, ni ' +
    'borrado remoto: preferimos escribirlo aquí antes que dejarlo suponer.',
  heroPanelTitle: 'La fórmula, publicada',
  heroPanelNote:
    'Ni tarifa negociada, ni parte discrecional. El mismo cálculo para todos, recalculable por ' +
    'cualquiera a partir de las cifras publicadas.',
  footerNote: 'World Conquest Library — Communauté Missionnaire Chrétienne Internationale',
  formulaRate:  'tasa_por_pagina = fondo ÷ paginas_validadas_totales',
  formulaShare: 'su_parte        = sus_paginas_validadas × tasa_por_pagina',
  subtitle: 'Subtítulo', edition: 'Edición', categories: 'Temas y categorías',
  keywords: 'Palabras clave',
  bookFile: 'Archivo de la obra', coverFile: 'Portada',
  bookFileHint: 'EPUB recomendado. PDF, DOCX y TXT aceptados — el PDF debe pasar por la conversión asistida antes de medirse.',
  measured: 'Medido por WCL — páginas normalizadas:', chars: 'caracteres',
  submitHint: 'El envío a validación exige un archivo medido y una declaración de derechos. Una vez enviado, el expediente queda bloqueado.',
  errFileRequired: 'Deposite el archivo de la obra antes de enviar.',
  errNeedsConversion: 'El PDF debe pasar por la conversión asistida antes de medirse.',
  sectionWork: 'La obra', sectionClassify: 'Clasificación',
  sectionFiles: 'Archivos', sectionRights: 'Derechos',
  coverHint: 'JPG o PNG, preferiblemente en formato vertical.',
  working: 'Enviando…',
  navAccount: 'Cuenta', accountLead: 'Su estructura, su equipo, su contrato y sus datos de pago.',
  noPublisher: 'Ningún espacio de editor está vinculado a esta cuenta.',
  sectionTeam: 'Equipo y roles', sectionContract: 'Contrato', sectionPayout: 'Pagos',
  sectionDocuments: 'Documentos justificativos',
  role: 'Rol', invite: 'Invitar', revoke: 'Revocar',
  inviteHint: 'La persona debe tener ya una cuenta WCL: nunca creamos una cuenta en nombre de un tercero.',
  sign: 'Firmar electrónicamente', signatureName: 'Nombre completo del firmante',
  contractIntro: 'Al firmar acepta las reglas de remuneración del portal. Son públicas e idénticas para todos los editores.',
  contractAgree: 'Declaro poseer los derechos de distribución digital de las obras que deposito y acepto los términos anteriores.',
  contractSigned: 'Contrato firmado',
  contractTermPool: 'El fondo equivale al 30 % de los ingresos netos por suscripción del período.',
  contractTermPage: 'Una página remunerada = 1 800 caracteres de texto corrido, medidos por WCL sobre el archivo depositado. Se paga por páginas realmente recorridas, nunca por la longitud total.',
  contractTermCap: 'Ningún editor puede superar el 25 % del fondo de un período sin revisión manual.',
  contractTermProvisional: 'Los límites de lectura son provisionales y se recalibrarán tras el período de observación.',
  payoutMethod: 'Medio de pago', payoutReference: 'Referencia (número o IBAN)',
  bankTransfer: 'Transferencia bancaria', currency: 'Moneda',
  taxId: 'Identificador fiscal', taxRegime: 'Régimen fiscal', saved: 'Guardado.',
  payoutHint: 'Estos datos solo son visibles para los roles de administrador y contable.',
  payoutRestricted: 'Reservado a los roles de administrador y contable.',
  docIdentity: 'Documento de identidad del responsable', docLegal: 'Existencia legal de la estructura',
  docRights: 'Certificado de titularidad de derechos',
  docHint: 'PDF o imagen.', docPending: 'Pendiente', docAccepted: 'Aceptado', docRejected: 'Rechazado',
  docPrivacy: 'Estos documentos se guardan en un espacio privado y nunca son re-servidos por la API.',
  termsTitle: 'Condiciones generales',
  termsIntro: 'Las reglas aplicables a todo autor o editor que deposite una obra en WCL. Son públicas e idénticas para todos.',
  termsAuthoritative: 'La versión francesa es la que da fe.',
  backHome: 'Volver al inicio',
  bulkTitle: 'Importación masiva', bulkPick: 'Archivo CSV o XLSX',
  bulkHint: 'Columnas: título, subtítulo, autores, idioma, isbn, edición, descripción, categorías, palabras clave.',
  bulkReady: 'filas leídas — listas para importar.', bulkCreated: 'borradores creados.',
  bulkImport: 'Importar', bulkTemplate: 'Descargar plantilla',
  bulkNote: 'La importación crea borradores de metadatos. Cada obra necesita su propio archivo.',
  sectionSecurity: 'Seguridad',
  mfaIntro: 'La doble autenticación protege su catálogo y sus datos de pago. El pliego la exige para las cuentas de editor.',
  mfaEnable: 'Activar la doble autenticación',
  mfaScan: 'Escanee este código con su aplicación de autenticación y escriba el código de seis dígitos. Conserve la clave: permite configurar un nuevo dispositivo.',
  mfaCode: 'Código de seis dígitos', mfaConfirm: 'Confirmar', mfaActive: 'Activa',
  mfaRemove: 'Desactivar', cancel: 'Cancelar',
};

export const STRINGS: Record<Locale, Strings> = { fr, en, es };
