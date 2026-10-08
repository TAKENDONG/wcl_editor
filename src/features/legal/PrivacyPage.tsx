// Exigence T7 / § 7 — protection des données personnelles.
//
// Cette page dit ce qui est mesuré, ce que les éditeurs ne verront JAMAIS, et
// ce qui reste une fois une période calculée. La donnée de lecture décrit ce
// qu'une personne lit, quand, et combien de temps : publier le modèle de
// rémunération sans publier cela reviendrait à demander aux lecteurs de
// financer une transparence dont ils seraient l'objet sans en être informés.
//
// 09/10/2026 : la redevance suit le TEMPS DE LECTURE que mesure déjà
// l'application (séances de lecture), et non plus une télémétrie page par page
// qui n'a jamais été livrée. Le texte dit ce qui est réellement fait.
export default function PrivacyPage() {
  return (
    <div className="prose">
      <h1>Données de lecture et confidentialité</h1>

      <p className="lead">
        Le calcul des redevances repose sur le temps de lecture réel. Cette page décrit
        exactement ce que WCL mesure, ce que les éditeurs peuvent voir, et ce qu’ils ne
        verront jamais.
      </p>

      <h2>Ce qui est mesuré</h2>
      <ul>
        <li>L’ouvrage ouvert dans l’application.</li>
        <li>Le temps de lecture actif de chaque séance (l’ouvrage au premier plan).</li>
        <li>La date de la lecture, dans le fuseau du lecteur.</li>
        <li>La progression atteinte en fin de séance.</li>
        <li>Le pays de facturation du lecteur. Aucune position plus précise.</li>
      </ul>
      <p>
        Ces données servent d’abord au lecteur lui-même (série de lecture, objectifs, rapport
        de la semaine) ; le calcul des redevances les additionne, titre par titre.
      </p>

      <h2>Ce que les éditeurs voient</h2>
      <p>
        Uniquement des <strong>agrégats</strong> : minutes lues, nombre de lecteurs uniques,
        nombre de séances, progression moyenne, répartition par pays. Ces chiffres portent sur
        leurs propres ouvrages et sur aucun autre.
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

      <h2>Ce qui reste après le calcul</h2>
      <p>
        Une période consolidée garde, pour chaque titre, des <strong>totaux sans identité</strong> :
        minutes, nombre de lecteurs, recette attribuée, montant. C’est ce qui permet de la
        recalculer à l’identique si un éditeur en contestait le montant, sans conserver qui a lu
        quoi.
      </p>

      <h2>Ce que WCL ne fait pas</h2>
      <ul>
        <li>Aucune revente ni transmission de données de lecture à des tiers.</li>
        <li>Aucun profilage publicitaire.</li>
        <li>
          Aucune redevance sur une lecture qui n’est pas payée : la lecture d’un compte à l’essai
          ou d’un code offert apparaît dans les statistiques, mais pas dans le calcul.
        </li>
      </ul>
    </div>
  );
}
