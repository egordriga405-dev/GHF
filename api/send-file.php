<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Получаем данные
$data = json_decode(file_get_contents('php://input'), true);

if (!$data) {
    echo json_encode(['success' => false, 'error' => 'No data received']);
    exit;
}

$botToken = $data['botToken'] ?? '';
$userId = $data['userId'] ?? '';
$content = $data['content'] ?? '';
$filename = $data['filename'] ?? 'exam-trainer.html';

if (empty($botToken) || empty($userId) || empty($content)) {
    echo json_encode(['success' => false, 'error' => 'Missing required fields']);
    exit;
}

// Создаем временный файл
$tempFile = tempnam(sys_get_temp_dir(), 'exam_');
file_put_contents($tempFile, $content);

// Отправляем файл через Telegram Bot API
$url = "https://api.telegram.org/bot{$botToken}/sendDocument";
$postFields = [
    'chat_id' => $userId,
    'document' => new CURLFile($tempFile, 'text/html', $filename),
    'caption' => '📚 Ваш тренажёр для экзаменов готов! Откройте файл в браузере.'
];

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $postFields);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

// Удаляем временный файл
unlink($tempFile);

$result = json_decode($response, true);

if ($httpCode === 200 && $result['ok']) {
    echo json_encode(['success' => true]);
} else {
    $error = $result['description'] ?? 'Unknown error';
    echo json_encode(['success' => false, 'error' => $error]);
}
?>
