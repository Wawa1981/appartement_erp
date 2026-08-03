# Mise à jour CDC — Compte pro & documents juridiques

**Projet** : L’Appartement ERP  
**Date** : 2026-08-03  
**Statut** : spécification (à intégrer au cahier des charges)  
**Périmètre** : espace **Compte pro** (rôle `PROFESSIONNEL`) — centralisation des démarches de conformité

---

## 1. Objectif

Centraliser, côté professionnel, les démarches permettant :

1. **Couverture juridique** des prestations en espace coworking beauté  
   - contrat de collaboration  
   - **micro-contrat journalier** (forfaits courts / journaliers)
2. **Vérification d’identité et d’activité**  
   - pièce d’identité  
   - KBIS (ou équivalent d’immatriculation)  
   - attestation d’**assurance professionnelle** (RC pro)

Ces éléments conditionnent l’accès réservation / validation admin selon la politique métier retenue.

---

## 2. Acteurs

| Acteur | Droits |
|--------|--------|
| **Professionnel** | Dépose, remplace, consulte le statut de ses documents. **Aucun** accès Administration. |
| **Administrateur** | Consulte, valide / refuse, télécharge ; gère les espaces via Administration. |
| **Système** | Stockage sécurisé, horodatage, conservation, notifications. |

---

## 3. Navigation applicative

### 3.1 Professionnel (sidebar)

| Section | Entrées |
|---------|---------|
| Espace client | Accueil |
| **Compte pro** | **Une seule entrée sidebar** : Compte pro (documents **dans** la page) |
| Administration | **masquée** |

Routes :

- `/compte-pro` — vue d’ensemble + dépôt des documents (centralisé)  
- `/compte-pro/documents` — alias optionnel vers la même page  
- `/profil` — données personnelles (hors sidebar Compte pro si non demandé)

### 3.2 Administrateur

Conserve Dashboard + Administration uniquement. **Pas** de section Compte pro dans le menu (réservé au rôle `PROFESSIONNEL`).

---

## 4. Catalogue de documents

| Code | Libellé | Groupe | Obligatoire | Public cible | Formats |
|------|---------|--------|-------------|--------------|---------|
| `contrat` | Contrat de collaboration | juridique | oui | tous pros | PDF |
| `micro_contrat` | Micro-contrat journalier | juridique | oui* | journaliers / forfaits courts | PDF |
| `piece_identite` | Pièce d’identité | conformité | oui | tous pros | PDF, JPG, PNG |
| `kbis` | KBIS / immatriculation | conformité | oui | tous pros | PDF |
| `assurance_pro` | Assurance RC pro | conformité | oui | tous pros | PDF |

\* *Obligatoire si le professionnel réserve en formule journalière / demi-journée sans contrat cadre déjà couvrant le cas ; règle métier à figer avec le client.*

### 4.1 Micro-contrat journalier — couverture juridique

- Document **court** liant le professionnel à L’Appartement pour une **prestation à la journée** (ou forfait horaire court).  
- Finalité : preuve de cadre contractuel pour les **journaliers** (responsabilité, usage des postes, conditions d’accès).  
- Version modèle fournie par l’admin (PDF à signer / contresigner) ; le pro dépose la version signée.  
- Traçabilité : date de dépôt, version du modèle, dates de validité éventuelles.

### 4.2 Pièces d’identité, KBIS, assurance

| Document | Contenu attendu | Contrôles (MVP) |
|----------|-----------------|-----------------|
| Pièce d’identité | CNI / passeport / titre de séjour | non expiré ; lisibilité |
| KBIS | extrait &lt; 3 mois recommandé | SIREN cohérent avec le profil |
| Assurance pro | attestation RC pro | date de fin de validité ≥ aujourd’hui |

---

## 5. Statuts du document

| Statut | Libellé UI | Qui change |
|--------|------------|------------|
| `manquant` | À déposer | initial |
| `en_attente` | En vérification | pro après upload |
| `valide` | Validé | admin |
| `refuse` | Refusé (+ motif) | admin |
| `expire` | Expiré | système (assurance, ID) |

**Dossier pro** : progression = `validés / total requis`.  
Règle optionnelle (à valider métier) : bloquer la réservation si un document `obligatoire` n’est pas `valide`.

---

## 6. Spécifications fonctionnelles (upload)

### 6.1 Pro — dépôt

1. Ouvre **Compte pro → Documents**.  
2. Choisit un type de document.  
3. Sélectionne un fichier (taille max **10 Mo** recommandée).  
4. Le fichier passe en `en_attente` ; le pro voit le nom du fichier.  
5. Notification admin (email / file d’attente).

### 6.2 Admin — validation

1. Liste des dossiers en attente (écran Administration → Utilisateurs / onglet Documents — *à prévoir*).  
2. Prévisualisation / téléchargement.  
3. Valider ou refuser avec motif.  
4. Notification pro.

### 6.3 Remplacement

Le pro peut **remplacer** un fichier : le précédent est archivé (historique), le nouveau repasse en `en_attente`.

---

## 7. Spécifications techniques (cible)

### 7.1 Modèle de données (proposition)

```
ProDocument
  id, user_id (FK User)
  type ∈ {contrat, micro_contrat, piece_identite, kbis, assurance_pro}
  status ∈ {manquant, en_attente, valide, refuse, expire}
  file_path / storage_key
  original_filename
  mime_type, size_bytes
  valid_from, valid_until (nullable)
  reviewed_by_id, reviewed_at, reject_reason
  created_at, updated_at
```

### 7.2 API (proposition)

| Méthode | Endpoint | Rôle |
|---------|----------|------|
| GET | `/api/pro/documents/` | liste + statuts (pro = self) |
| POST | `/api/pro/documents/` | upload multipart (`type`, `file`) |
| DELETE | `/api/pro/documents/{id}/` | soft-delete / archive |
| GET | `/api/admin/documents/?status=en_attente` | file admin |
| PATCH | `/api/admin/documents/{id}/` | `{ status, reject_reason }` |

Stockage : disque privé ou S3 ; **jamais** URL publique sans signature temporaire.  
RGPD : finalité conformité, durée de conservation définie (ex. durée du contrat + 5 ans).

### 7.3 Frontend (état actuel Sprint)

- Shell : section **Compte pro** visible **uniquement** pour `PROFESSIONNEL`.  
- Section **Administration** : **uniquement** `ADMIN`.  
- Page `ComptePro` : UI de dépôt (état local en attendant l’API).  
- Fichier : `frontend/src/pages/ComptePro.jsx`.

---

## 8. Critères d’acceptation

- [ ] Un pro **ne voit pas** le menu Administration.  
- [ ] Un pro voit **Compte pro** / Documents / Mon profil.  
- [ ] Les 5 types de documents sont listés avec statut.  
- [ ] Upload local (puis API) met le document en « En vérification ».  
- [ ] Un admin peut valider/refuser (écran admin documents — sprint suivant).  
- [ ] Micro-contrat journalier documenté comme couverture juridique des forfaits courts.  
- [ ] Pièce d’identité, KBIS et assurance pro exigibles pour la conformité.

---

## 9. Hors scope (ce document)

- Signature électronique (DocuSign / Yousign) — extension future.  
- OCR / lecture automatique des dates d’expiration.  
- Paiement lié au micro-contrat.

---

## 10. Historique

| Version | Date | Auteur | Note |
|---------|------|--------|------|
| 0.1 | 2026-08-03 | Équipe projet | Première rédaction — centralisation Compte pro + documents |
