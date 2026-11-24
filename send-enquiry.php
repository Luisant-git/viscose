<?php
/**
 * Handles the Enquiry and Contact forms for the static Viscose clone.
 * Sends every submission to services@viscosecropsolution.com.
 */

$to = 'services@viscosecropsolution.com';

$allowedPages = array('enquiry.html', 'contact-us.html');
$redirect = isset($_POST['redirect']) ? (string) $_POST['redirect'] : 'enquiry.html';
if (!in_array($redirect, $allowedPages, true)) {
    $redirect = 'enquiry.html';
}

function vcs_field($key, $maxLength = 500)
{
    if (!isset($_POST[$key])) {
        return '';
    }

    $value = trim((string) $_POST[$key]);
    // Prevent header/body injection.
    $value = str_replace(array("\r", "\n", '%0d', '%0a', '%0D', '%0A'), '', $value);

    if (function_exists('mb_substr')) {
        return mb_substr($value, 0, $maxLength, 'UTF-8');
    }

    return substr($value, 0, $maxLength);
}

function vcs_fail($redirect, $message)
{
    header('Location: ' . $redirect . '?error=' . rawurlencode($message));
    exit;
}

if (!isset($_SERVER['REQUEST_METHOD']) || $_SERVER['REQUEST_METHOD'] !== 'POST') {
    vcs_fail($redirect, 'Invalid request. Please submit the form again.');
}

$formType = vcs_field('form_type', 30);
if ($formType !== 'Contact') {
    $formType = 'Enquiry';
}

$name     = vcs_field('your-name', 100);
$email    = vcs_field('your-email', 150);
$phone    = vcs_field('your-phone', 50);
$service  = vcs_field('your-service', 150);
$district = vcs_field('your-district', 100);
$taluk    = vcs_field('your-taluk', 100);
$village  = vcs_field('your-village', 100);
$message  = vcs_field('your-message', 3000);

if ($name === '' || $phone === '' || $service === '' || $district === '' || $taluk === '' || $village === '') {
    vcs_fail($redirect, 'Please fill in all required fields.');
}

if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    vcs_fail($redirect, 'Please enter a valid email address.');
}

$subject = '[' . $formType . '] New enquiry from ' . $name;

$body  = 'Form: ' . $formType . "\r\n";
$body .= 'Name: ' . $name . "\r\n";
$body .= 'Email: ' . ($email !== '' ? $email : '-') . "\r\n";
$body .= 'Mobile: ' . $phone . "\r\n";
$body .= 'Service: ' . $service . "\r\n";
$body .= 'District: ' . $district . "\r\n";
$body .= 'Taluk: ' . $taluk . "\r\n";
$body .= 'Village: ' . $village . "\r\n";
$body .= 'Message: ' . ($message !== '' ? $message : '-') . "\r\n";
$body .= 'Submitted: ' . date('Y-m-d H:i:s') . "\r\n";
$body .= 'IP: ' . (isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : '-') . "\r\n";

$replyTo = $email !== '' ? $email : $to;

$headers = array(
    'From: Viscose Website <no-reply@viscosecropsolution.com>',
    'Reply-To: ' . $replyTo,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'X-Mailer: PHP/' . phpversion(),
);
$headerString = implode("\r\n", $headers);

$sent = mail($to, $subject, $body, $headerString);

if (!$sent) {
    vcs_fail($redirect, 'Sorry, the message could not be sent. Please try again or email us directly.');
}

header('Location: ' . $redirect . '?sent=1');
exit;
