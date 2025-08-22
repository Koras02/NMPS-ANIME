CREATE DATABASE IF NOT EXISTS kokoanime;


USE kokoanime;

-- 애니 저장(캐시) 테이블
CREATE TABLE IF NOT EXISTS animes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    mal_id INT UNIQUE,
    title VARCHAR(255) NOT NULL,
    genre VARCHAR(255) NOT NULL,
    episodes VARCHAR(255) NOT NULL,
    rating FLOAT,
    release_date DATE,
    img_url TEXT, 
    last_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_likes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    anime_id INT NOT NULL,
    UNIQUE KEY uniq_user_anime (user_id, anime_id)
)


GRANT ALL PRIVILEGES ON kokoanime.* TO 'koras02'@'localhost';

FLUSH PRIVILEGES;