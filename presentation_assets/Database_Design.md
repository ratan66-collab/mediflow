# MediFlow Database Design (ERD)

The system uses a hybrid storage approach: **Local Storage** for instant performance, **SQLite** for the Voice Assistant, and **Supabase** for secure cloud synchronization.

```mermaid
erDiagram
    %% Local Call Assistant Database (SQLite)
    APPOINTMENTS {
        int id PK
        string patient_name
        string reason
        datetime start_time
        boolean canceled
        datetime created_at
    }

    %% Main Platform (Supabase / Auth)
    USERS {
        uuid id PK
        string email
        string password_hash
        datetime last_login
    }

    REPORTS {
        uuid id PK
        uuid user_id FK
        string file_name
        string file_url
        datetime uploaded_at
    }

    %% Transient Data (Browser LocalStorage)
    METRICS_CACHE {
        string user_email PK
        json latest_analysis "Includes symptoms and precautions"
        int health_score
    }

    %% Relationships
    USERS ||--o{ REPORTS : "uploads"
    USERS ||--o{ APPOINTMENTS : "schedules (via Voice Assistant)"
```

## Storage Strategy:
1.  **Call Assistant (SQLite):** Dedicated to handling high-concurrency tool calls from Vapi. It ensures that even if the internet is slow, the voice agent can immediately read/write appointment slots.
2.  **Cloud Storage (Supabase):** Stores sensitive data like user credentials and raw report metadata to ensure security and multi-device access.
3.  **Client Cache (LocalStorage):** Used to store the most recent AI Analysis. This allows the Dashboard and Digital Body Map to render instantly without waiting for an API call on every refresh.
