CREATE TABLE IF NOT EXISTS support_tickets (
    id UUID PRIMARY KEY,
    ticket_id VARCHAR(255) NOT NULL UNIQUE,
    requester_name VARCHAR(255) NOT NULL,
    department VARCHAR(255) NOT NULL,
    priority VARCHAR(255) NOT NULL,
    status VARCHAR(255) NOT NULL,
    owner_name VARCHAR(255),
    wait_time VARCHAR(255),
    sla VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
