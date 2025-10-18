# Requirements Document - Supabase Migration

## Introduction

This document outlines the requirements for migrating the StayFocus application from its current architecture (Google OAuth + localStorage/Google Drive) to a Supabase-based architecture. The migration aims to provide robust authentication, real-time synchronization, secure data storage, and improved scalability while maintaining all existing functionality.

## Glossary

- **StayFocus**: The application being migrated, a productivity and wellness management system
- **Supabase**: Backend-as-a-Service platform providing authentication, PostgreSQL database, storage, and real-time capabilities
- **RLS (Row Level Security)**: PostgreSQL security feature that restricts data access at the row level based on user identity
- **Zustand Store**: State management library used in the application for client-side state
- **Real-time Sync**: Automatic data synchronization across multiple devices/sessions without manual refresh
- **localStorage**: Browser-based storage mechanism currently used for data persistence
- **Google Drive**: Cloud storage service currently used for data backup
- **iron-session**: Current session management library to be replaced
- **Migration Script**: Automated tool to transfer existing user data from localStorage to Supabase

## Requirements

### Requirement 1: Authentication System Migration

**User Story:** As a user, I want to securely authenticate using either email/password or Google OAuth, so that I can access my data from any device with confidence in security.

#### Acceptance Criteria

1. WHEN a user visits the login page, THE StayFocus SHALL display options for both email/password authentication and Google OAuth authentication
2. WHEN a user registers with email and password, THE StayFocus SHALL create a new account in Supabase Auth and send a confirmation email
3. WHEN a user clicks the email confirmation link, THE StayFocus SHALL activate the account and allow login
4. WHEN a user authenticates with Google OAuth, THE StayFocus SHALL redirect to Google authorization and create or retrieve the user session upon callback
5. WHEN a user's session is active, THE StayFocus SHALL persist the session across page refreshes and browser restarts
6. WHEN a user logs out, THE StayFocus SHALL clear the session and redirect to the login page
7. WHEN an unauthenticated user attempts to access protected routes, THE StayFocus SHALL redirect to the login page
8. WHEN an authenticated user attempts to access login or registration pages, THE StayFocus SHALL redirect to the dashboard

### Requirement 2: Database Schema Implementation

**User Story:** As a developer, I want a well-structured PostgreSQL database schema with proper relationships and constraints, so that data integrity is maintained and queries are efficient.

#### Acceptance Criteria

1. WHEN the database is initialized, THE StayFocus SHALL create all 18 required tables with proper column types and constraints
2. WHEN tables are created, THE StayFocus SHALL establish foreign key relationships between related tables (e.g., financas_transacoes to financas_categorias)
3. WHEN a user_id is required, THE StayFocus SHALL reference the auth.users table with ON DELETE CASCADE to ensure data cleanup
4. WHEN tables with updated_at columns are modified, THE StayFocus SHALL automatically update the timestamp using database triggers
5. WHEN JSONB columns are used (e.g., ingredientes in receitas), THE StayFocus SHALL validate the JSON structure before insertion
6. WHEN array columns are used (e.g., disciplinas in estudos_concursos), THE StayFocus SHALL properly store and retrieve array data
7. WHEN CHECK constraints are defined (e.g., qualidade between 1 and 5), THE StayFocus SHALL enforce these constraints at the database level

### Requirement 3: Row Level Security Implementation

**User Story:** As a user, I want my personal data to be protected from access by other users, so that my privacy is guaranteed.

#### Acceptance Criteria

1. WHEN RLS is enabled on a table, THE StayFocus SHALL prevent any data access that doesn't match the defined policies
2. WHEN a user queries their data, THE StayFocus SHALL only return rows where user_id matches auth.uid()
3. WHEN a user attempts to insert data, THE StayFocus SHALL only allow insertion if user_id matches auth.uid()
4. WHEN a user attempts to update data, THE StayFocus SHALL only allow updates to rows where user_id matches auth.uid()
5. WHEN a user attempts to delete data, THE StayFocus SHALL only allow deletion of rows where user_id matches auth.uid()
6. WHEN RLS policies are applied, THE StayFocus SHALL apply identical policies to all 18 user data tables
7. IF a user attempts to access another user's data directly via SQL, THEN THE StayFocus SHALL block the access and return no results

### Requirement 4: Zustand Store Migration

**User Story:** As a developer, I want all 18 Zustand stores to use Supabase for data persistence instead of localStorage, so that data is centrally managed and synchronized.

#### Acceptance Criteria

1. WHEN a store is initialized, THE StayFocus SHALL load data from Supabase instead of localStorage
2. WHEN a store action modifies data, THE StayFocus SHALL persist changes to Supabase immediately
3. WHEN a Supabase operation is in progress, THE StayFocus SHALL set a loading state to true
4. WHEN a Supabase operation completes, THE StayFocus SHALL update the store state and set loading to false
5. WHEN a Supabase operation fails, THE StayFocus SHALL capture the error and provide user-friendly error messages
6. WHEN user authentication changes, THE StayFocus SHALL reload all store data for the new user context
7. WHEN a user logs out, THE StayFocus SHALL clear all store data from memory

### Requirement 5: Real-time Synchronization

**User Story:** As a user, I want my data to automatically sync across all my devices in real-time, so that I always see the most current information without manual refresh.

#### Acceptance Criteria

1. WHEN data is modified on one device, THE StayFocus SHALL broadcast the change via Supabase Realtime
2. WHEN a change is received on another device, THE StayFocus SHALL update the local store within 2 seconds
3. WHEN multiple devices modify the same data simultaneously, THE StayFocus SHALL use last-write-wins conflict resolution
4. WHEN a user opens the application on a new device, THE StayFocus SHALL subscribe to real-time updates for all relevant tables
5. WHEN a user closes the application, THE StayFocus SHALL unsubscribe from all real-time channels
6. WHEN network connectivity is lost, THE StayFocus SHALL queue changes locally and sync when connection is restored
7. WHEN real-time sync fails, THE StayFocus SHALL log the error and attempt to reconnect automatically

### Requirement 6: File Storage Migration

**User Story:** As a user, I want to upload photos for my meals and recipes with secure storage, so that my images are safely stored and accessible only to me.

#### Acceptance Criteria

1. WHEN a user uploads a photo, THE StayFocus SHALL store the file in Supabase Storage under the user-photos bucket
2. WHEN a photo is uploaded, THE StayFocus SHALL organize files by user_id in folder structure
3. WHEN a photo upload completes, THE StayFocus SHALL return a public URL and store it in the database
4. WHEN a user deletes a meal or recipe with a photo, THE StayFocus SHALL also delete the associated file from storage
5. WHEN a user attempts to access a photo, THE StayFocus SHALL verify ownership via RLS policies on storage
6. WHEN storage quota is exceeded, THE StayFocus SHALL display a clear error message to the user
7. WHEN a photo upload fails, THE StayFocus SHALL allow the user to retry without losing other form data

### Requirement 7: Component Migration

**User Story:** As a developer, I want all React components to use the new Supabase-backed stores and authentication context, so that the UI reflects the new data architecture.

#### Acceptance Criteria

1. WHEN a component mounts, THE StayFocus SHALL check authentication status via useAuth hook
2. WHEN a component needs user data, THE StayFocus SHALL call the store's load method with the current user_id
3. WHEN a component displays data, THE StayFocus SHALL show loading states while data is being fetched
4. WHEN a component encounters an error, THE StayFocus SHALL display user-friendly error messages
5. WHEN a component modifies data, THE StayFocus SHALL call the appropriate store action that persists to Supabase
6. WHEN authentication state changes, THE StayFocus SHALL trigger re-renders in all components using useAuth
7. WHEN a component unmounts, THE StayFocus SHALL clean up any active subscriptions or listeners

### Requirement 8: Page Migration

**User Story:** As a user, I want all 21 pages of the application to work seamlessly with the new backend, so that I can continue using all features without disruption.

#### Acceptance Criteria

1. WHEN a page loads, THE StayFocus SHALL verify user authentication before rendering content
2. WHEN a page requires data, THE StayFocus SHALL load data from Supabase via the appropriate store
3. WHEN a page is loading data, THE StayFocus SHALL display skeleton screens or loading indicators
4. WHEN a page encounters an authentication error, THE StayFocus SHALL redirect to the login page
5. WHEN a page encounters a data error, THE StayFocus SHALL display an error message with retry option
6. WHEN a page's data updates in real-time, THE StayFocus SHALL reflect changes without requiring page refresh
7. WHEN a user navigates between pages, THE StayFocus SHALL maintain authentication state and cached data

### Requirement 9: Data Migration Tool

**User Story:** As an existing user, I want my current data from localStorage to be automatically migrated to Supabase, so that I don't lose any of my historical information.

#### Acceptance Criteria

1. WHEN a user logs in for the first time after migration, THE StayFocus SHALL detect existing localStorage data
2. WHEN localStorage data is detected, THE StayFocus SHALL prompt the user to migrate their data
3. WHEN the user confirms migration, THE StayFocus SHALL read all data from localStorage
4. WHEN data is read from localStorage, THE StayFocus SHALL transform it to match the Supabase schema
5. WHEN data is transformed, THE StayFocus SHALL insert it into the appropriate Supabase tables
6. WHEN migration completes successfully, THE StayFocus SHALL display a success message and clear localStorage
7. IF migration fails, THEN THE StayFocus SHALL preserve localStorage data and allow the user to retry

### Requirement 10: Error Handling and Recovery

**User Story:** As a user, I want the application to handle errors gracefully and provide clear guidance, so that I understand what went wrong and how to fix it.

#### Acceptance Criteria

1. WHEN a network error occurs, THE StayFocus SHALL display a message indicating connectivity issues
2. WHEN an authentication error occurs, THE StayFocus SHALL redirect to login with an appropriate message
3. WHEN a validation error occurs, THE StayFocus SHALL highlight the problematic fields and explain the requirements
4. WHEN a database constraint is violated, THE StayFocus SHALL translate the error into user-friendly language
5. WHEN an operation fails, THE StayFocus SHALL provide a retry button or alternative action
6. WHEN errors occur, THE StayFocus SHALL log detailed information to the console for debugging
7. WHEN critical errors occur, THE StayFocus SHALL send error reports to a monitoring service (if configured)

### Requirement 11: Performance Optimization

**User Story:** As a user, I want the application to load quickly and respond smoothly, so that my productivity workflow is not interrupted.

#### Acceptance Criteria

1. WHEN a page loads, THE StayFocus SHALL complete initial data fetch within 500ms on average
2. WHEN queries are executed, THE StayFocus SHALL select only the required columns to minimize data transfer
3. WHEN large lists are displayed, THE StayFocus SHALL implement pagination to limit initial load
4. WHEN data is frequently accessed, THE StayFocus SHALL cache results in the Zustand store
5. WHEN database indexes are needed, THE StayFocus SHALL create indexes on commonly queried columns
6. WHEN real-time subscriptions are active, THE StayFocus SHALL limit the number of concurrent channels
7. WHEN images are loaded, THE StayFocus SHALL use optimized formats and lazy loading

### Requirement 12: Security and Compliance

**User Story:** As a user, I want my data to be secure and handled in compliance with privacy regulations, so that I can trust the application with my personal information.

#### Acceptance Criteria

1. WHEN user passwords are stored, THE StayFocus SHALL use Supabase Auth's built-in bcrypt hashing
2. WHEN API keys are used, THE StayFocus SHALL store them in environment variables, never in code
3. WHEN sensitive data is transmitted, THE StayFocus SHALL use HTTPS for all connections
4. WHEN user data is stored, THE StayFocus SHALL comply with LGPD (Brazilian data protection law)
5. WHEN a user requests data deletion, THE StayFocus SHALL remove all associated data via CASCADE deletes
6. WHEN authentication tokens are used, THE StayFocus SHALL implement automatic token refresh
7. WHEN SQL queries are constructed, THE StayFocus SHALL use parameterized queries to prevent injection

### Requirement 13: Testing and Quality Assurance

**User Story:** As a developer, I want comprehensive tests to verify that all functionality works correctly after migration, so that we can deploy with confidence.

#### Acceptance Criteria

1. WHEN authentication flows are tested, THE StayFocus SHALL verify both email/password and Google OAuth paths
2. WHEN CRUD operations are tested, THE StayFocus SHALL verify create, read, update, and delete for all entities
3. WHEN RLS is tested, THE StayFocus SHALL verify that users cannot access other users' data
4. WHEN real-time sync is tested, THE StayFocus SHALL verify changes propagate across multiple sessions
5. WHEN file uploads are tested, THE StayFocus SHALL verify storage and retrieval of images
6. WHEN error scenarios are tested, THE StayFocus SHALL verify appropriate error handling and messages
7. WHEN performance is tested, THE StayFocus SHALL verify query response times meet requirements

### Requirement 14: Documentation and Deployment

**User Story:** As a team member, I want clear documentation of the new architecture and deployment process, so that I can maintain and extend the system effectively.

#### Acceptance Criteria

1. WHEN the migration is complete, THE StayFocus SHALL include updated README with Supabase setup instructions
2. WHEN environment variables are required, THE StayFocus SHALL document all required variables in .env.example
3. WHEN database schema changes, THE StayFocus SHALL provide migration scripts in a migrations folder
4. WHEN deployment occurs, THE StayFocus SHALL include a deployment checklist with verification steps
5. WHEN APIs are used, THE StayFocus SHALL document all Supabase client methods and their usage
6. WHEN troubleshooting is needed, THE StayFocus SHALL provide a troubleshooting guide for common issues
7. WHEN the system is monitored, THE StayFocus SHALL document key metrics and monitoring setup

### Requirement 15: Backward Compatibility and Rollback

**User Story:** As a product owner, I want the ability to rollback to the previous system if critical issues arise, so that users are not left without access to the application.

#### Acceptance Criteria

1. WHEN the migration is deployed, THE StayFocus SHALL maintain a feature flag to toggle between localStorage and Supabase
2. WHEN the feature flag is disabled, THE StayFocus SHALL revert to using localStorage and Google Drive
3. WHEN a rollback is needed, THE StayFocus SHALL preserve all data in both systems during the transition period
4. WHEN issues are detected, THE StayFocus SHALL allow switching backends without requiring code deployment
5. WHEN the migration is stable, THE StayFocus SHALL provide a script to remove localStorage fallback code
6. WHEN data exists in both systems, THE StayFocus SHALL prioritize Supabase as the source of truth
7. WHEN rollback occurs, THE StayFocus SHALL log the reason and notify the development team
