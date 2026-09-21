# Content and provenance notice

## Scope

This repository contains two separately licensed layers:

1. application source code;
2. an Italian-language card corpus.

The MIT license in `LICENSE` applies only to repository-authored source code. The card corpus is governed by [LICENSE-CARDS.md](LICENSE-CARDS.md).

## Provenance audit

The current corpus contains 417 white cards and 234 black cards.

Repository history shows that the project began with 70 local cards in May 2025 and was then expanded through many explicit card-addition, rewrite and cleanup commits. The current corpus is therefore a mixed fan adaptation rather than a verbatim copy of one upstream deck.

The audit also found identifiable overlap and lineage with two historical Italian source families:

- the historical Italian translation of Cards Against Humanity, distributed as `CAH_ita_2.0.pdf` and credited to **I Traduttori Mascherati**;
- the **CaH42project** Italian fan expansion, preserved in later community mirrors.

Both preserved Italian sources explicitly state **Creative Commons BY-NC-SA 2.0 Italy** terms: attribution, non-commercial use and share-alike.

Cards Against Humanity itself continues to make its base game available for free under a BY-NC-SA Creative Commons license, while reserving trademark and other rights.

## Licensing decision

To keep the mixed deck internally consistent with the identified share-alike upstream material:

- the complete card corpus in `server/data/carte_bianche.json` and `server/data/carte_nere.json` is distributed under **CC BY-NC-SA 2.0 IT**;
- project-specific selections, edits, rewrites and additions that form part of this adapted corpus are offered under the same license;
- the corpus may not be used for commercial purposes under that license;
- downstream adaptations must preserve attribution and share-alike terms.

See [LICENSE-CARDS.md](LICENSE-CARDS.md) for the attribution block and canonical license URI.

## Changes made in this repository

Compared with historical upstream material, this repository includes project-specific work such as:

- selection and removal of cards;
- Italian wording changes and typo corrections;
- new locally authored/fan-added prompts and answers;
- support for one-, two- and three-card prompts;
- JSON restructuring for the multiplayer application.

Git history is the detailed record of those changes.

## Trademark / affiliation

The Creative Commons license covers copyright permissions in the licensed material; it does not grant trademark rights.

**Cards Against Humanity** and related names, logos, branding and trademarks belong to their respective rights holders. **Carte senza Umanità** is an independent, non-commercial fan project and is not affiliated with or endorsed by Cards Against Humanity LLC.

No registered-trademark claim is made for the name `Carte senza Umanità`.
