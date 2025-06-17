CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_email TEXT NOT NULL,
    message TEXT NOT NULL,
    total_price NUMERIC NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);