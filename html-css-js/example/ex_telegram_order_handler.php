<?php
const TELEGRAM_BOT_TOKEN = '7311009873:AAEzy-c1HrbXlvmcOJxCnDeyUZN0ApIzypE';
const TELEGRAM_CHAT_ID   = '-4914480902';

function sanitizePhone($phone) {
    if (!is_string($phone)) return '';
    $cleaned = preg_replace('/[^0-9+]/', '', $phone);
    if (strpos($cleaned, '+') === 0) {
        $cleaned = '+' . str_replace('+', '', substr($cleaned, 1));
    } else {
        $cleaned = str_replace('+', '', $cleaned);
    }
    return $cleaned;
}

function sendDataToTelegram($message) {
  $telegram_url  = 'https://api.telegram.org/bot' . TELEGRAM_BOT_TOKEN . '/sendMessage';
  $telegram_data = [
    'chat_id' => TELEGRAM_CHAT_ID,
    'text'    => $message,
    'parse_mode' => 'HTML',
  ];

  $args = [
    'body'    => $telegram_data,
    'headers' => [
      'Content-Type' => 'application/x-www-form-urlencoded',
    ],
    'timeout' => 15,
  ];

  // Отправляем запрос в Telegram API
  $response = wp_remote_post( $telegram_url, $args );

  if ( is_wp_error( $response ) || wp_remote_retrieve_response_code( $response ) !== 200 ) {
    // Если возникла ошибка при отправке, можно обработать ее здесь
    // например, записать в лог или отправить email администратору
  } else {
    // Успешная отправка, вернем ответ на клиент
    wp_send_json( [ 'success' => true, 'message' => 'Спасибо за ваше обращение! Мы свяжемся с вами в ближайшее время.' ] );
  }
}

if ( $_SERVER['REQUEST_METHOD'] === 'POST') {
  if(isset( $_POST['privacy'] )) {
    $name    = sanitize_text_field( $_POST['name'] );
    $phone   = sanitizePhone( sanitize_text_field( $_POST['phone'] ) );
    $service   = sanitize_text_field( $_POST['service'] );
    $personMessage   = sanitize_text_field( $_POST['message'] );
    $message = "\n📩 Новая заявка с сайта:
      \nИмя клиента: $name
      \nТелефон клиента: $phone
      \nУслуга или страница: $service
      \nСообщение от клиента: $personMessage
      ";
    // Отправка сообщения в Telegram
    sendDataToTelegram($message);
  }
}
