# Felicicar — site statique + formulaire PHP, servi par Apache.
# Déployé par Coolify (build pack « Dockerfile », port 80).

FROM composer:2 AS vendor
WORKDIR /app
COPY composer.json ./
RUN composer install --no-dev --no-interaction --no-progress --optimize-autoloader

FROM php:8.3-apache

RUN a2enmod headers rewrite expires \
    && sed -ri 's/^ServerTokens .*/ServerTokens Prod/; s/^ServerSignature .*/ServerSignature Off/' /etc/apache2/conf-available/security.conf \
    && sed -ri 's/AllowOverride None/AllowOverride All/' /etc/apache2/apache2.conf \
    && echo "expose_php = Off" > /usr/local/etc/php/conf.d/hardening.ini

COPY --from=vendor /app/vendor /var/www/vendor
COPY public/ /var/www/html/

RUN chown -R www-data:www-data /var/www/html

EXPOSE 80
