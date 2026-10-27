export type Thought = {
  /** Date du jour où la pensée est écrite, au format AAAA-MM-JJ : elle sert aussi d'ancre (#2026-10-27). */
  date: string
  /** Un paragraphe par entrée. */
  paragraphs: string[]
}

/**
 * Mon carnet de pensées : une entrée par jour d'écriture, la plus récente en haut de la page.
 * Le texte est le mien ; seules l'orthographe et la ponctuation ont été reprises.
 */
export const thoughts: Thought[] = [
  {
    date: "2026-10-27",
    paragraphs: [
      "Quelquefois, c'est dur de mettre ton âme dans un travail auquel personne ne porte d'attention. Vous allez me dire que je ne suis pas un vrai artiste ; alors oui, peut-être que vous avez raison, car si l'essence de mon travail est faite pour être enterrée sous la terre, je refuse. Je veux apporter mes idées au monde, et que les personnes y posent un minimum de réflexion. Tu ne peux pas contrôler les réactions des autres, mais essayer de les titiller.",
      "Le soir, parfois, je ressens le besoin d'exprimer une rage profonde. Hier, c'était la première fois que ça m'arrivait ; c'était tellement fort que j'ai pris peur de moi-même, un sentiment intrinsèque. Mais je n'ai rien fait, j'ai essayé de le contenir, et la chose qui m'a fait du bien, c'est d'aller directement dans la création : alors j'ai consulté des tableaux et créé via l'IA.",
      "Et cette dernière semaine, j'ai comme un pouvoir de confiance qui vient me sauver des cauchemars avant que je dorme, et je me répète à l'intérieur de moi, avec une telle force, que je suis le meilleur, pendant de longues minutes. Et j'essaye de toujours faire le même rêve : que j'aurais réussi et que je négligerais une personne en particulier.",
      "Je ne sais pas si je deviens mentalement stable ; tout ce que je sais, c'est que je crois que je suis en dépression, et que ça ne va pas fort. Au moment où j'écris ça, j'ai les larmes aux yeux, que je retiens, car mes parents ne sont pas loin. À 21 h, je doute de moi, et à 22 h, j'ai un pouvoir de confiance en moi ; je commence à ressentir cette ambivalence de manière extrême.",
      "Je m'étais fait la réflexion que si je n'allais pas « réussir » ma vie comme je l'entends, et que je me retrouvais à 30 ans sans femme ni enfant, cette vie amoureuse ne me serait jamais remise comme si elle m'était due, en raison de ma quête dans la création et l'entrepreneuriat. Et que si je voulais cette situation amoureuse, il me fallait juste arrêter ce que je fais pour quelque chose de plus « classique ». L'un des deux sacrifices me briserait. Mais sans ma création, je mourrais.",
      "Voici mes pensées du 27 octobre 2026, si proche de mes 24 ans, le 5 novembre. Sur le moment, je hais ce que je suis, et j'espère ne plus l'être.",
    ],
  },
]
