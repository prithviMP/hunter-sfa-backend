# User Control Module Database Schema

This document provides an overview of the database schema for the User Control Module in the Hunter SFA Backend application.

## Entities

### User

Represents a user in the system.

| Field         | Type      | Description                                   |
|---------------|-----------|-----------------------------------------------|
| id            | UUID      | Primary key                                   |
| firstName     | String    | User's first name                             |
| lastName      | String    | User's last name                              |
| email         | String    | User's email address (unique)                 |
| password      | String    | Hashed password                               |
| phoneNumber   | String    | User's phone number (optional)                |
| profileImage  | String    | URL to profile image (optional)               |
| address       | JSON      | User's address details (optional)             |
| isActive      | Boolean   | Whether the user is active                    |
| createdAt     | DateTime  | When the user was created                     |
| updatedAt     | DateTime  | When the user was last updated                |
| roleId        | UUID      | Foreign key to Role                           |
| departmentId  | UUID      | Foreign key to Department (optional)          |

### Role

Represents a role with specific permissions.

| Field         | Type      | Description                                   |
|---------------|-----------|-----------------------------------------------|
| id            | UUID      | Primary key                                   |
| name          | String    | Role name (unique)                            |
| description   | String    | Role description (optional)                   |
| permissions   | String[]  | Array of permission strings                   |
| isDefault     | Boolean   | Whether this is a default role                |
| isActive      | Boolean   | Whether the role is active                    |
| createdAt     | DateTime  | When the role was created                     |
| updatedAt     | DateTime  | When the role was last updated                |

### Department

Represents a department in the organization with hierarchical structure.

| Field         | Type      | Description                                   |
|---------------|-----------|-----------------------------------------------|
| id            | UUID      | Primary key                                   |
| name          | String    | Department name                               |
| code          | String    | Department code (unique)                      |
| description   | String    | Department description (optional)             |
| isActive      | Boolean   | Whether the department is active              |
| createdAt     | DateTime  | When the department was created               |
| updatedAt     | DateTime  | When the department was last updated          |
| parentId      | UUID      | Foreign key to parent Department (optional)   |
| managerId     | UUID      | Foreign key to User manager (optional)        |

### App

Represents an application in the system.

| Field         | Type      | Description                                   |
|---------------|-----------|-----------------------------------------------|
| id            | UUID      | Primary key                                   |
| name          | String    | App name                                      |
| key           | String    | App unique key (unique)                       |
| description   | String    | App description (optional)                    |
| iconUrl       | String    | URL to app icon (optional)                    |
| baseUrl       | String    | Base URL for the app (optional)               |
| isActive      | Boolean   | Whether the app is active                     |
| createdAt     | DateTime  | When the app was created                      |
| updatedAt     | DateTime  | When the app was last updated                 |

### EmailConfiguration

Represents email configurations for roles and regions.

| Field         | Type      | Description                                   |
|---------------|-----------|-----------------------------------------------|
| id            | UUID      | Primary key                                   |
| name          | String    | Configuration name                            |
| email         | String    | Email address                                 |
| isActive      | Boolean   | Whether the configuration is active           |
| createdAt     | DateTime  | When the configuration was created            |
| updatedAt     | DateTime  | When the configuration was last updated       |
| roleId        | UUID      | Foreign key to Role                           |
| regionId      | UUID      | Foreign key to Region                         |
| userId        | UUID      | Foreign key to User creator (optional)        |

### Notification

Represents notifications for users.

| Field         | Type      | Description                                   |
|---------------|-----------|-----------------------------------------------|
| id            | UUID      | Primary key                                   |
| title         | String    | Notification title                            |
| message       | String    | Notification message                          |
| type          | String    | Notification type (info, warning, etc.)       |
| isRead        | Boolean   | Whether the notification has been read        |
| data          | JSON      | Additional data (optional)                    |
| createdAt     | DateTime  | When the notification was created             |
| userId        | UUID      | Foreign key to User recipient                 |

### UserSettings

Represents user-specific settings.

| Field         | Type      | Description                                   |
|---------------|-----------|-----------------------------------------------|
| id            | UUID      | Primary key                                   |
| notifications | JSON      | Notification preferences                      |
| display       | JSON      | Display preferences                           |
| dashboard     | JSON      | Dashboard preferences (optional)              |
| createdAt     | DateTime  | When the settings were created                |
| updatedAt     | DateTime  | When the settings were last updated           |
| userId        | UUID      | Foreign key to User (unique)                  |

### SystemSettings

Represents system-wide settings.

| Field         | Type      | Description                                   |
|---------------|-----------|-----------------------------------------------|
| id            | UUID      | Primary key                                   |
| key           | String    | Setting key (unique)                          |
| value         | JSON      | Setting value                                 |
| category      | String    | Setting category                              |
| updatedAt     | DateTime  | When the setting was last updated             |
| updatedBy     | UUID      | Foreign key to User (optional)                |

## Additional Entities

### Area

Represents a geographical area.

| Field         | Type      | Description                                   |
|---------------|-----------|-----------------------------------------------|
| id            | UUID      | Primary key                                   |
| name          | String    | Area name                                     |
| code          | String    | Area code (unique)                            |
| boundary      | String    | GeoJSON string for area boundary (optional)   |
| isActive      | Boolean   | Whether the area is active                    |
| createdAt     | DateTime  | When the area was created                     |
| updatedAt     | DateTime  | When the area was last updated                |
| cityId        | UUID      | Foreign key to City (optional)                |
| stateId       | UUID      | Foreign key to State (optional)               |

### Region

Represents a larger geographical region.

| Field         | Type      | Description                                   |
|---------------|-----------|-----------------------------------------------|
| id            | UUID      | Primary key                                   |
| name          | String    | Region name                                   |
| code          | String    | Region code (unique)                          |
| description   | String    | Region description (optional)                 |
| isActive      | Boolean   | Whether the region is active                  |
| createdAt     | DateTime  | When the region was created                   |
| updatedAt     | DateTime  | When the region was last updated              |

### UserArea

Represents a many-to-many relationship between users and areas.

| Field         | Type      | Description                                   |
|---------------|-----------|-----------------------------------------------|
| id            | UUID      | Primary key                                   |
| userId        | UUID      | Foreign key to User                           |
| areaId        | UUID      | Foreign key to Area                           |
| createdAt     | DateTime  | When the relationship was created             |

### UserRegion

Represents a many-to-many relationship between users and regions.

| Field         | Type      | Description                                   |
|---------------|-----------|-----------------------------------------------|
| id            | UUID      | Primary key                                   |
| userId        | UUID      | Foreign key to User                           |
| regionId      | UUID      | Foreign key to Region                         |
| createdAt     | DateTime  | When the relationship was created             |

### Location Entities

The schema also includes entities for managing locations:

- **Country**: Countries with their codes and phone codes
- **State**: States/provinces with their codes, belonging to countries
- **City**: Cities belonging to states

## Entity Relationships

1. **User**:
   - Belongs to a Role (many-to-one)
   - Belongs to a Department (many-to-one, optional)
   - Has many Areas through UserArea (many-to-many)
   - Has many Regions through UserRegion (many-to-many)
   - Has one UserSettings (one-to-one)
   - Has many Notifications (one-to-many)

2. **Role**:
   - Has many Users (one-to-many)
   - Has many EmailConfigurations (one-to-many)

3. **Department**:
   - Has a parent Department (self-referential, optional)
   - Has many child Departments (self-referential)
   - Has a manager User (many-to-one, optional)
   - Has many Users (one-to-many)

4. **Region**:
   - Has many Users through UserRegion (many-to-many)
   - Has many EmailConfigurations (one-to-many)

5. **Area**:
   - Belongs to a City (many-to-one, optional)
   - Belongs to a State (many-to-one, optional)
   - Has many Users through UserArea (many-to-many)

## Database Indexes

The schema includes the following indexes for performance optimization:

- Email uniqueness index on User
- Role name uniqueness index
- Department code uniqueness index
- Area code uniqueness index
- Region code uniqueness index
- Compound uniqueness indexes for UserArea and UserRegion
- Various foreign key indexes
- Notification indexes for fast querying by user, creation date, and read status

## Security Considerations

- User passwords are stored as hashed values, not in plain text
- Sensitive settings like SMTP passwords are stored in the SystemSettings table
- Soft delete pattern is used for entities like User, Role, Department, etc. (isActive flag) 