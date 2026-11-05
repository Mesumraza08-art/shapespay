<?php
/**
 * Receives the site's quote and newsletter forms and emails them to the team.
 * Called by assets/site.js. Answers with JSON: {"ok":true} or {"ok":false}.
 */

const LEAD_TO      = 'Info@Shapespay.com';
const LEAD_FROM    = 'no-reply@shapespay.com'; // Must be an address on the hosted domain.
const MAX_PER_HOUR = 20;                       // Submissions allowed per IP address.

function respond(int $status, bool $ok): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    echo json_encode(['ok' => $ok]);
    exit;
}

/** Trims a value and caps its length. Single-line fields also lose line breaks. */
function field(string $name, int $max, bool $multiline = false): string
{
    $value = $_POST[$name] ?? '';
    if (!is_string($value)) {
        return '';
    }
    $value = trim($multiline ? $value : preg_replace('/[\r\n\t]+/', ' ', $value));
    return mb_substr($value, 0, $max, 'UTF-8');
}

function overLimit(string $ip): bool
{
    $file = sys_get_temp_dir() . '/shapespay-lead-' . hash('sha256', $ip);
    $handle = @fopen($file, 'c+');
    if ($handle === false) {
        return false; // Never lose a lead because the counter is unavailable.
    }
    flock($handle, LOCK_EX);
    $cutoff = time() - 3600;
    $hits = array_filter(
        array_map('intval', explode(',', (string) stream_get_contents($handle))),
        fn (int $at): bool => $at > $cutoff
    );
    $hits[] = time();
    ftruncate($handle, 0);
    rewind($handle);
    fwrite($handle, implode(',', $hits));
    flock($handle, LOCK_UN);
    fclose($handle);
    return count($hits) > MAX_PER_HOUR;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    respond(405, false);
}

// Only site.js sends this header, which filters out bots posting straight to this URL.
if (($_SERVER['HTTP_X_REQUESTED_WITH'] ?? '') !== 'shapespay-site') {
    respond(403, false);
}

// The hidden "website" field is only ever filled in by bots. Report success so they move on.
if (field('website', 200) !== '') {
    respond(200, true);
}

if (overLimit($_SERVER['REMOTE_ADDR'] ?? 'unknown')) {
    respond(429, false);
}

$form  = field('form', 20);
$email = field('email', 200);

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    respond(422, false);
}

if ($form === 'newsletter') {
    $subject = 'Newsletter signup';
    $body    = "Newsletter signup: {$email}\n";
} elseif ($form === 'quote') {
    $name     = field('name', 200);
    $business = field('business', 200);
    $phone    = field('phone', 50);

    if ($name === '' || $business === '' || $phone === '') {
        respond(422, false);
    }

    $subject = "Quote request: {$business}";
    $body    = "Name: {$name}\n"
             . "Business: {$business}\n"
             . "Email: {$email}\n"
             . "Phone: {$phone}\n"
             . 'Business type: ' . field('type', 100) . "\n"
             . 'Sent from: ' . field('page', 300) . "\n\n"
             . "Message:\n" . field('message', 5000, true) . "\n";
} else {
    respond(422, false);
}

$headers = [
    'From: ShapesPay Website <' . LEAD_FROM . '>',
    "Reply-To: {$email}",
    'Content-Type: text/plain; charset=UTF-8',
];

$encodedSubject = '=?UTF-8?B?' . base64_encode($subject) . '?=';
$sent = mail(LEAD_TO, $encodedSubject, $body, implode("\r\n", $headers), '-f' . LEAD_FROM);

respond($sent ? 200 : 502, $sent);
