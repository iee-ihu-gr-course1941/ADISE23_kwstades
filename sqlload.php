<?php
include 'dbconn.php'; // Include your database connection file

// Check if x, y coordinates are sent from JavaScript
if (isset($_POST['x']) && isset($_POST['y'])) {
    $xCoord = $_POST['x'];
    $yCoord = $_POST['y'];

    // Insert x, y coordinates into the database
    $sql = "INSERT INTO game_status (x_coord, y_coord) VALUES ('$xCoord', '$yCoord')";
    // Perform the query using your database connection
    // $conn is assumed to be the variable that holds your database connection
    if ($conn->query($sql) === TRUE) {
        echo "Coordinates saved successfully";
    } else {
        echo "Error: " . $sql . "<br>" . $conn->error;
    }
} else {
    echo "Coordinates not received";
}
?>