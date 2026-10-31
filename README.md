# Felicicar — site vitrine

Site une page de Felicicar (location de véhicules en moyenne durée, 1 à 24 mois, pour les entreprises).

- `public/` : le site (HTML/CSS/JS statiques) et `devis.php`, qui envoie les demandes de devis par e-mail
- `Dockerfile` : image PHP 8.3 + Apache, avec PHPMailer installé par Composer
- Design : tokens issus du design system fourni (indigo `#533afd`, Inter Tight 300, aucune ombre, rayons 4 px)

## Aperçu en local

```bash
cd public && python3 -m http.server 8080
```

Ouvrir http://localhost:8080. Le formulaire ne fonctionne pas dans cet aperçu, car il lui faut PHP. Pour le tester en local avec Docker :

```bash
docker build -t felicicar . && docker run --rm -p 8080:80 -e SMTP_USER=contact@felicicar.fr -e SMTP_PASS=... felicicar
```

## Déploiement avec Coolify (VPS Hostinger)

1. **Pousser le dépôt** sur GitHub (dépôt privé).
2. Dans Coolify : **New Resource → Private Repository (GitHub App)**, choisir le dépôt et la branche `main`.
3. **Build Pack** : `Dockerfile`. **Port exposé** : `80`.
4. **Domaines** : `https://felicicar.fr,https://www.felicicar.fr`. Coolify génère le certificat HTTPS (Let's Encrypt).
5. **Variables d'environnement** (onglet *Environment Variables*) :

   | Variable    | Valeur                                    |
   |-------------|-------------------------------------------|
   | `SMTP_HOST` | `smtp.hostinger.com`                      |
   | `SMTP_PORT` | `465`                                     |
   | `SMTP_USER` | `contact@felicicar.fr`                    |
   | `SMTP_PASS` | mot de passe de la boîte (à saisir par vous) |
   | `MAIL_TO`   | `contact@felicicar.fr`                    |

6. **DNS** (dans hPanel → Domaines → felicicar.fr → DNS) : enregistrements `A` pour `@` et `www` vers l'IP du VPS. Attention à ne pas toucher aux enregistrements `MX`, `SPF`, `DKIM`, car la messagerie en dépend.
7. **Deploy**. Activez *Auto Deploy* : chaque `git push` sur `main` redéploie ensuite le site.

## Après la mise en ligne

- Envoyer une demande de test depuis le formulaire et vérifier sa réception sur contact@felicicar.fr.
- En cas d'échec, regarder les logs du conteneur dans Coolify (lignes `[devis]`).
- Vérifier l'adresse de l'hébergeur dans `public/mentions-legales.html` (Hostinger International Ltd, Larnaca, Chypre) par rapport à votre espace client.

## Modifier le contenu

- Textes : `public/index.html`
- Styles : `public/assets/styles.css`
- Photo de la flotte : remplacer `public/assets/img/voiture-electrique.jpg` (format portrait conseillé, au moins 1280 px de large), puis mettre à jour le crédit photo dans le pied de page et les mentions légales.
