<?php
require_once __DIR__ . '/vendor/autoload.php';

try {
    $client = new MongoDB\Client("mongodb://localhost:27017/");

    echo "Successfully connected to MongoDB!<br>";

    $collection = $client->app_db->users;

    $insertResult = $collection->insertOne([
        'username' => 'coder_joe',
        'email' => 'joe@example.com',
        'createdAt' => new MongoDB\BSON\UTCDateTime()
    ]);

    echo "Inserted document with ID: " . $insertResult->getInsertedId() . "<br><br>";

    echo "<strong>Current users in database:</strong><br>";
    $cursor = $collection->find([]);

    foreach ($cursor as $document) {
        echo "User: " . $document['username'] . " | Email: " . $document['email'] . "<br>";
    }

} catch (MongoDB\Driver\Exception\Exception $e) {
    echo "An error occurred: " . $e->getMessage();
}
?>