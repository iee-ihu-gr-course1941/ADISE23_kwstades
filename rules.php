<?php
session_start();
if (isset($_SESSION['id']) && isset($_SESSION['user_name'])){
?>

<!DOCTYPE html>
<HTML>
<head>
    <title>RULES</title>
    <link rel="stylesheet" type="text/css" href="style1.css"  >
</head>
<body>
    <div class="rules-wrapper">
        <div class="image-rules">
            <div class="text-rules">
                    <h1>Hello, <?php echo $_SESSION['user_name']; ?></h1>   
            </div> 
            <div class="gamerules">
                
                <div class="gamerules-text">
                <p><b>Setup :</b></p>
                <p>1. Each player gets their own grid board. The boards are typically labeled with letters (A-J) along the top and numbers (0-9) down the side.<br>
                2. Each player arranges their ships on their board without showing the other player the placement.<br>
                3. The ships are: Aircraft Carrier (5 spaces), Battleship (4 spaces), Destroyer (3 spaces), Cruiser (3 spaces), PB (1 spaces)<br>
                4. Ships can be placed horizontally or vertically on the board, but they cannot be placed diagonally or overlapping each other.<br>
                5. Once both players have placed their ships, the game begins.
                </p><br>
                <p><b>Gameplay :</b></p>
                <p>1. Players take turns calling out coordinates on the opponent's grid to try and guess the location of their ships.<br>
                2. The opponent must respond with either "Hit" if a part of a ship is at that coordinate, or "Miss" if there is no ship at that location.<br>
                3. Players mark their own guesses and keep track of hits and misses on a separate sheet to keep track of the opponent's fleet.<br>
                4. When a player hits a part of an opponent's ship, the opponent must declare "Hit" and the attacking player marks that hit on their tracking sheet.<br>
                5. When all the spaces of a ship have been hit, the owner of that ship must declare "You sunk my [ship name]".<br>
                6. The game continues until one player's entire fleet is sunk.
                </p><br>
            </div>   
            <a href="logout.php" >Logout</a>
            <a href="play.php" >Play</a>
        </div>  
        
    </div> 
</body>
</html>
<?php
}
else{
    header("Location: index.php");
    exit();
}
?>