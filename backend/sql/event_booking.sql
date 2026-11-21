CREATE DATABASE IF NOT EXISTS eventora CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE eventora;

CREATE TABLE IF NOT EXISTS users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(190) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS events (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(255) NOT NULL,
    city VARCHAR(100) NULL,
    date DATETIME NOT NULL,
    time VARCHAR(100) NOT NULL,
    total_seats INT NOT NULL,
    available_seats INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0,
    img VARCHAR(1000) NULL,
    tag VARCHAR(100) NULL,
    host VARCHAR(255) NULL,
    long_description TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_events_date (date),
    INDEX idx_events_location (location),
    INDEX idx_events_category (category),
    CHECK (total_seats >= 0),
    CHECK (available_seats >= 0),
    CHECK (available_seats <= total_seats),
    CHECK (price >= 0)
);

CREATE TABLE IF NOT EXISTS event_tickets (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    event_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(150) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    detail VARCHAR(255) NOT NULL,
    FOREIGN KEY (event_id)
        REFERENCES events(id)
        ON DELETE CASCADE,

    CHECK (price >= 0),
    INDEX idx_event_tickets_event_id (event_id)
);

CREATE TABLE IF NOT EXISTS event_includes (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    event_id BIGINT UNSIGNED NOT NULL,
    item VARCHAR(255) NOT NULL,
    FOREIGN KEY (event_id)
        REFERENCES events(id)
        ON DELETE CASCADE,

    INDEX idx_event_includes_event_id (event_id)
);

CREATE TABLE IF NOT EXISTS bookings (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    booking_code VARCHAR(30) NOT NULL UNIQUE,
    user_id BIGINT UNSIGNED NOT NULL,
    event_id BIGINT UNSIGNED NOT NULL,
    ticket_type VARCHAR(100) NOT NULL,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(190) NOT NULL,
    mobile VARCHAR(32) NOT NULL,
    quantity INT NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    booking_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status ENUM('confirmed', 'cancelled') NOT NULL DEFAULT 'confirmed',

    INDEX idx_booking_user (user_id),
    INDEX idx_booking_event (event_id),

    CONSTRAINT fk_booking_user
        FOREIGN KEY (user_id) REFERENCES users(id),

    CONSTRAINT fk_booking_event
        FOREIGN KEY (event_id) REFERENCES events(id),

    CHECK (quantity > 0),
    CHECK (total_amount >= 0)
);