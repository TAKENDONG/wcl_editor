// Exigence T7 / § 7 — protection des données personnelles.
//
// Cette page dit ce qui est collecté, ce que les éditeurs ne verront JAMAIS, et
// combien de temps le lien lecteur-ouvrage subsiste. Elle existe parce que la
// donnée de lecture page par page est bien plus sensible qu'une barre de
// progression : elle décrit ce qu'une personne lit, quand, et combien de temps
// elle s'attarde. Publier le modèle de rémunération sans publier cela
// reviendrait à demander aux lecteurs de financer une transparence dont ils
// seraient l'objet sans en être informés.
export default function PrivacyPage() {
  return (
    <div className="prose">
      <h1>Données de lecture et confidentialité</h1>

      <p className="lead">
        Le calcul des redevances repose sur les pages réellement lues. Cette page
        décrit exactement ce que WCL mesure, ce que les éditeurs peuvent voir, et
        ce qu’ils ne verront jamais.
      </p>

      <h2>Ce qui est mesuré</h2>
      <ul>
        <li>L’ouvrage ouvert, et la version exacte du fichier mesurée.</li>
        <li>
          Les intervalles de texte parcourus, en positions de caractères — jamais
          en numéros de page, qui dépendent de la typographie choisie par le lecteur.
        </li>
        <li>Le temps passé au premier plan sur chaque page.</li>
        <li>
          La cause du déplacement : page tournée, saut par la table des matières,
          recherche. Seule une page tournée donne lieu à redevance.
        </li>
        <li>Le pays, déduit par nos serveurs. Aucune position plus précise.</li>
        <li>L’horodatage de la lecture.</li>
      </ul>

      <h2>Ce que les éditeurs voient</h2>
      <p>
        Uniquement des <strong>agrégats</strong> : nombre de pages lues, nombre de
        lecteurs uniques, taux de complétion moyen, temps moyen par page,
        répartition par pays. Ces chiffres portent sur leurs propres ouvrages et
        sur aucun autre.
      </p>

      <h2>Ce que les éditeurs ne voient jamais</h2>
      <ul>
        <li>Aucun nom, aucune adresse électronique, aucun identifiant de lecteur.</li>
        <li>Aucune lecture individuelle, ni aucun horaire de lecture d’une personne.</li>
        <li>Aucune donnée relative aux ouvrages d’un autre éditeur.</li>
      </ul>
      <p className="muted">
        Ce cloisonnement est appliqué par la base de données elle-même, et non par
        l’affichage : un éditeur qui interrogerait directement l’interface de
        programmation obtiendrait le même résultat restreint.
      </p>

      <h2>Durée de conservation</h2>
      <p>
        Le lien entre un lecteur et un ouvrage est <strong>supprimé au bout de
        14 mois</strong>, une fois la période de redevances correspondante réglée.
        Les compteurs de pages, eux, sont conservés sans identité : une période
        close doit rester recalculable à l’identique si un éditeur en contestait
        le montant.
      </p>
      <p>
        Nous <strong>anonymisons</strong> plutôt que de supprimer. Effacer les
        compteurs détruirait la preuve d’une redevance déjà versée — ce que la
        clause d’audit du contrat éditeur interdit.
      </p>

      <h2>Ce que WCL ne fait pas</h2>
      <ul>
        <li>Aucune revente ni transmission de données de lecture à des tiers.</li>
        <li>Aucun profilage publicitaire.</li>
        <li>
          Aucune mesure d’une lecture qui n’est pas couverte par un droit : un
          extrait consulté sans abonnement est enregistré mais ne donne lieu à
          aucune redevance.
        </li>
      </ul>
    </div>
  );
}
