<?php
/**
 * Felicicar — réception du formulaire de devis.
 *
 * Envoie la demande par e-mail via SMTP (Hostinger). Configuration par
 * variables d'environnement (à définir dans Coolify) :
 *   SMTP_HOST  (défaut : smtp.hostinger.com)
 *   SMTP_PORT  (défaut : 465, SSL)
 *   SMTP_USER  adresse de la boîte d'envoi, ex. contact@felicicar.fr
 *   SMTP_PASS  mot de passe de cette boîte
 *   MAIL_TO    destinataire des demandes (défaut : SMTP_USER)
 */

declare(strict_types=1);

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception as MailException;

require __DIR__ . '/../vendor/autoload.php';

$wantsJson = str_contains($_SERVER['HTTP_ACCEPT'] ?? '', 'application/json');

function respond(bool $ok, string $error = '', int $code = 200): never
{
    global $wantsJson;
    http_response_code($ok ? 200 : $code);

    if ($wantsJson) {
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($ok ? ['ok' => true] : ['ok' => false, 'error' => $error], JSON_UNESCAPED_UNICODE);
        exit;
    }

    if ($ok) {
        header('Location: /merci.html', true, 303);
        exit;
    }

    header('Content-Type: text/html; charset=utf-8');
    $msg = htmlspecialchars($error, ENT_QUOTES, 'UTF-8');
    echo "<!doctype html><html lang=\"fr\"><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">"
        . "<title>Erreur — Felicicar</title><link rel=\"stylesheet\" href=\"/assets/styles.css\">"
        . "<main class=\"legal\"><div class=\"container\"><h1>Votre demande n'a pas pu être envoyée</h1>"
        . "<p>{$msg}.</p><p><a href=\"/#devis\">Revenir au formulaire</a> ou écrivez-nous à "
        . "<a href=\"mailto:contact@felicicar.fr\">contact@felicicar.fr</a>.</p></div></main></html>";
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    respond(false, 'Méthode non autorisée', 405);
}

// --- Anti-spam ---------------------------------------------------------

// Champ piège : rempli uniquement par les robots. On simule un succès.
if (trim((string)($_POST['website'] ?? '')) !== '') {
    respond(true);
}

// Formulaire envoyé trop vite (moins de 3 s après affichage) : robot probable.
$shownAt = (int)($_POST['t'] ?? 0);
if ($shownAt > 0 && time() - $shownAt < 3) {
    respond(true);
}

// Limite : 5 demandes par heure et par adresse IP.
$ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$rateFile = sys_get_temp_dir() . '/felicicar-rate-' . hash('sha256', $ip);
$now = time();
$hits = [];
if (is_file($rateFile)) {
    $hits = array_filter(
        array_map('intval', explode(',', (string)file_get_contents($rateFile))),
        fn (int $ts) => $ts > $now - 3600
    );
}
if (count($hits) >= 5) {
    respond(false, 'Trop de demandes envoyées depuis votre connexion, merci de réessayer plus tard', 429);
}

// --- Validation --------------------------------------------------------

function field(string $name, int $max = 120): string
{
    $value = trim((string)($_POST[$name] ?? ''));
    $value = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $value) ?? '';
    return mb_substr($value, 0, $max);
}

$data = [
    'Société'             => field('societe'),
    'SIREN'               => field('siren', 11),
    'Nom'                 => field('nom'),
    'Fonction'            => field('fonction'),
    'E-mail'              => field('email', 160),
    'Téléphone'           => field('telephone', 30),
    'Nombre de véhicules' => field('nombre', 4),
    'Catégorie'           => field('categorie'),
    'Motorisation'        => field('motorisation'),
    'Durée'               => field('duree'),
    'Date de début'       => field('debut', 10),
    'Kilométrage mensuel' => field('kilometrage'),
    'Lieu de livraison'   => field('livraison'),
];
$message = field('message', 3000);

$optional = ['SIREN'];
foreach ($data as $label => $value) {
    if ($value === '' && !in_array($label, $optional, true)) {
        respond(false, "Le champ « {$label} » est obligatoire", 422);
    }
}

if (!filter_var($data['E-mail'], FILTER_VALIDATE_EMAIL)) {
    respond(false, "L'adresse e-mail n'est pas valide", 422);
}

$count = filter_var($data['Nombre de véhicules'], FILTER_VALIDATE_INT, ['options' => ['min_range' => 1, 'max_range' => 500]]);
if ($count === false) {
    respond(false, 'Le nombre de véhicules doit être compris entre 1 et 500', 422);
}

$date = DateTime::createFromFormat('!Y-m-d', $data['Date de début']);
if ($date === false || $date->format('Y-m-d') !== $data['Date de début']) {
    respond(false, "La date de début n'est pas valide", 422);
}
$data['Date de début'] = $date->format('d/m/Y');

// --- Envoi -------------------------------------------------------------

$smtpUser = getenv('SMTP_USER') ?: '';
$smtpPass = getenv('SMTP_PASS') ?: '';
if ($smtpUser === '' || $smtpPass === '') {
    error_log('[devis] SMTP_USER ou SMTP_PASS non configuré');
    respond(false, "Le service d'envoi est momentanément indisponible", 500);
}

$lines = [];
foreach ($data as $label => $value) {
    $lines[] = str_pad($label . ' :', 22) . ($value !== '' ? $value : '—');
}
$body = "Nouvelle demande de devis reçue sur felicicar.fr\n\n"
    . implode("\n", $lines)
    . "\n\nMessage :\n" . ($message !== '' ? $message : '—')
    . "\n\n--\nEnvoyée le " . date('d/m/Y à H:i') . "\n";

$mail = new PHPMailer(true);
try {
    $mail->isSMTP();
    $mail->Host       = getenv('SMTP_HOST') ?: 'smtp.hostinger.com';
    $mail->Port       = (int)(getenv('SMTP_PORT') ?: 465);
    $mail->SMTPAuth   = true;
    $mail->SMTPSecure = $mail->Port === 465 ? PHPMailer::ENCRYPTION_SMTPS : PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Username   = $smtpUser;
    $mail->Password   = $smtpPass;
    $mail->CharSet    = PHPMailer::CHARSET_UTF8;
    $mail->Timeout    = 15;

    $mail->setFrom($smtpUser, 'Site Felicicar');
    $mail->addAddress(getenv('MAIL_TO') ?: $smtpUser);
    $mail->addReplyTo($data['E-mail'], $data['Nom']);

    $mail->Subject = 'Demande de devis — ' . $data['Société'] . ' (' . $count . ' véhicule' . ($count > 1 ? 's' : '') . ')';
    $mail->Body    = $body;

    $mail->send();
} catch (MailException $e) {
    error_log('[devis] Échec SMTP : ' . $mail->ErrorInfo);
    respond(false, "L'envoi a échoué", 502);
}

$hits[] = $now;
@file_put_contents($rateFile, implode(',', $hits), LOCK_EX);

respond(true);
