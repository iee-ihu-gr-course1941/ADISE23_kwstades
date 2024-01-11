CREATE TABLE authentication (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_name VARCHAR(11) NOT NULL,
    password VARCHAR(11) NOT NULL
);

SELECT * FROM `authentication` WHERE 1