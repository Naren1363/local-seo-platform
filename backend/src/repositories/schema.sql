-- Local SEO Optimization & Search Intelligence Platform
-- Supabase / PostgreSQL Schema Definition

-- Enable Extensions if available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    company_name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index on user email for fast lookup
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 2. BUSINESSES TABLE
CREATE TABLE IF NOT EXISTS businesses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    website_url VARCHAR(500) NOT NULL,
    category VARCHAR(100) NOT NULL,
    target_keywords TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_businesses_user_id ON businesses(user_id);

-- 3. BUSINESS_LOCATIONS TABLE
CREATE TABLE IF NOT EXISTS business_locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID UNIQUE NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL,
    postal_code VARCHAR(50),
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    formatted_address TEXT,
    place_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_locations_business_id ON business_locations(business_id);
CREATE INDEX IF NOT EXISTS idx_locations_lat_lng ON business_locations(latitude, longitude);

-- 4. SEO_AUDITS TABLE
CREATE TABLE IF NOT EXISTS seo_audits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    website_url VARCHAR(500) NOT NULL,
    overall_score INT NOT NULL,
    technical_score INT NOT NULL,
    onpage_score INT NOT NULL,
    local_score INT NOT NULL,
    response_time_ms INT,
    is_https BOOLEAN DEFAULT FALSE,
    has_robots_txt BOOLEAN DEFAULT FALSE,
    has_sitemap BOOLEAN DEFAULT FALSE,
    has_canonical BOOLEAN DEFAULT FALSE,
    has_local_schema BOOLEAN DEFAULT FALSE,
    raw_audit_data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_seo_audits_business_id ON seo_audits(business_id);

-- 5. SEO_ISSUES TABLE
CREATE TABLE IF NOT EXISTS seo_issues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    audit_id UUID NOT NULL REFERENCES seo_audits(id) ON DELETE CASCADE,
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL, -- 'Technical', 'On-Page', 'Local'
    severity VARCHAR(20) NOT NULL, -- 'Critical', 'High', 'Medium', 'Low'
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    impact_explanation TEXT NOT NULL,
    recommendation TEXT NOT NULL,
    code_snippet TEXT,
    is_resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_seo_issues_audit_id ON seo_issues(audit_id);
CREATE INDEX IF NOT EXISTS idx_seo_issues_business_id ON seo_issues(business_id);

-- 6. KEYWORDS TABLE
CREATE TABLE IF NOT EXISTS keywords (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    keyword VARCHAR(255) NOT NULL,
    search_intent VARCHAR(50), -- 'Local Commercial', 'Transactional', 'Informational', 'Navigational'
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_keywords_business_id ON keywords(business_id);

-- 7. KEYWORD_RESULTS TABLE
CREATE TABLE IF NOT EXISTS keyword_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    keyword_id UUID NOT NULL REFERENCES keywords(id) ON DELETE CASCADE,
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    local_relevance_score INT NOT NULL,
    competition_level VARCHAR(20) NOT NULL, -- 'Low', 'Medium', 'High'
    estimated_volume INT NOT NULL,
    visibility_score INT NOT NULL,
    serp_features JSONB DEFAULT '[]',
    related_queries JSONB DEFAULT '[]',
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_keyword_results_keyword_id ON keyword_results(keyword_id);

-- 8. COMPETITORS TABLE
CREATE TABLE IF NOT EXISTS competitors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    website_url VARCHAR(500),
    address TEXT,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    distance_km DOUBLE PRECISION NOT NULL,
    is_direct_competitor BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_competitors_business_id ON competitors(business_id);

-- 9. COMPETITOR_METRICS TABLE
CREATE TABLE IF NOT EXISTS competitor_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    competitor_id UUID UNIQUE NOT NULL REFERENCES competitors(id) ON DELETE CASCADE,
    rating DOUBLE PRECISION,
    review_count INT DEFAULT 0,
    has_website BOOLEAN DEFAULT FALSE,
    has_https BOOLEAN DEFAULT FALSE,
    local_schema_present BOOLEAN DEFAULT FALSE,
    estimated_seo_score INT DEFAULT 50,
    keyword_overlap_score INT DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_comp_metrics_competitor_id ON competitor_metrics(competitor_id);

-- 10. RECOMMENDATIONS TABLE
CREATE TABLE IF NOT EXISTS recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    severity VARCHAR(20) NOT NULL, -- 'Critical', 'High', 'Medium', 'Low'
    category VARCHAR(50) NOT NULL, -- 'Technical', 'On-Page', 'Local', 'Competitor Gap'
    title VARCHAR(255) NOT NULL,
    issue_summary TEXT NOT NULL,
    impact_explanation TEXT NOT NULL,
    action_steps TEXT[] DEFAULT '{}',
    code_example TEXT,
    status VARCHAR(20) DEFAULT 'open', -- 'open', 'in_progress', 'completed', 'ignored'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_recommendations_business_id ON recommendations(business_id);

-- 11. REPORTS TABLE
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    summary TEXT,
    overall_score INT NOT NULL,
    report_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_reports_business_id ON reports(business_id);
