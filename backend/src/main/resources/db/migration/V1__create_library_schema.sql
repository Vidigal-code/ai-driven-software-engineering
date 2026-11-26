CREATE TABLE library_users (
    id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(254) NOT NULL,
    password_hash VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('ADMIN', 'LIBRARIAN', 'READER')),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    CONSTRAINT uq_users_email UNIQUE (email)
);

CREATE TABLE books (
    id UUID PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    author VARCHAR(150) NOT NULL,
    isbn VARCHAR(13) NOT NULL,
    publisher VARCHAR(150),
    publication_year INTEGER NOT NULL CHECK (publication_year >= 1),
    category VARCHAR(100),
    description VARCHAR(5000),
    total_copies INTEGER NOT NULL CHECK (total_copies >= 0),
    available_copies INTEGER NOT NULL CHECK (available_copies >= 0 AND available_copies <= total_copies),
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    version BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT uq_books_isbn UNIQUE (isbn)
);
CREATE INDEX idx_books_created_at ON books (created_at DESC);
CREATE INDEX idx_books_category ON books (category);

CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY,
    token_hash VARCHAR(64) NOT NULL UNIQUE,
    user_id UUID NOT NULL REFERENCES library_users (id),
    family_id UUID NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ
);
CREATE INDEX idx_refresh_family ON refresh_tokens (family_id);
CREATE INDEX idx_refresh_user ON refresh_tokens (user_id);
CREATE INDEX idx_refresh_expiration ON refresh_tokens (expires_at);
