# Acadex API Reference

Base URL: `http://localhost:5000/api`

---

## Authentication

### POST /auth/register
Register a new user.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "student",
  "department": "Computer Science",
  "rollNumber": "CS2024001",
  "batch": "2024"
}
```
**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { "id": "...", "name": "John Doe", "role": "student" }
}
```

---

### POST /auth/login
**Request Body:**
```json
{ "email": "john@example.com", "password": "password123" }
```
**Response:**
```json
{
  "success": true,
  "token": "...",
  "user": { "id": "...", "name": "John Doe", "role": "student", "totalScore": 45 }
}
```

---

### GET /auth/me
Get current authenticated user. Requires `Authorization: Bearer <token>`.

---

## Achievements

### POST /achievements
Upload achievement. `multipart/form-data`. Roles: student, faculty.

**Form Fields:**
| Field       | Type   | Required |
|-------------|--------|----------|
| title       | string | yes      |
| type        | string | yes      |
| level       | string | yes      |
| organizer   | string | yes      |
| date        | date   | yes      |
| description | string | no       |
| certificate | file   | yes      |

**Types:** `participation`, `certification`, `winner`, `internship`, `research`, `hackathon`, `workshop`, `competition`, `sports`, `cultural`, `patent`, `conference`

**Levels:** `college`, `state`, `national`, `international`

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "title": "SIH Winner",
    "type": "winner",
    "level": "national",
    "status": "pending",
    "file_url": "https://cloudinary.com/...",
    "score": 0
  }
}
```

---

### GET /achievements/my-achievements
Get authenticated user's achievements. All roles.

---

### GET /achievements/pending/list
- Faculty: returns `pending` achievements in their department
- Admin: returns `faculty_approved` achievements (their queue)

---

### GET /achievements?status=pending&type=research&department=CS
Get all achievements with filters. Roles: faculty, admin, placement.

---

### GET /achievements/:id
Get single achievement by ID.

---

### PUT /achievements/:id/verify
Verify an achievement. Roles: faculty, admin.

**Strict Workflow:**
- Faculty can only change `pending` → `faculty_approved` or `rejected`
- Admin can only change `faculty_approved` → `admin_approved` or `rejected`
- Score is computed and stored **only** on `admin_approved`

**Request Body:**
```json
{ "status": "faculty_approved", "remarks": "Looks valid" }
```

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "faculty_approved",
    "facultyVerifiedBy": "...",
    "facultyRemarks": "Looks valid",
    "score": 0
  }
}
```

After admin approves:
```json
{
  "success": true,
  "data": {
    "status": "admin_approved",
    "score": 22,
    "adminVerifiedBy": "..."
  }
}
```

---

### DELETE /achievements/:id
Delete achievement. Owner or admin only. Rolls back score if admin_approved.

---

## Scoring Engine

`score = base_points × level_multiplier`

| Type          | Base Points |
|---------------|-------------|
| participation | 5           |
| certification | 10          |
| winner        | 15          |
| internship    | 20          |
| research      | 25          |
| hackathon     | 15          |
| workshop      | 5           |
| competition   | 15          |
| sports        | 5           |
| cultural      | 5           |
| patent        | 25          |
| conference    | 10          |

| Level         | Multiplier |
|---------------|------------|
| college       | ×1         |
| state         | ×1.2       |
| national      | ×1.5       |
| international | ×2         |

**Example:** `winner` at `national` = 15 × 1.5 = **22 points**

---

## Users

### GET /users/:id/score
Get a student's total score (computed from admin_approved achievements).

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "...",
    "name": "John Doe",
    "department": "Computer Science",
    "totalScore": 67,
    "achievementsCount": 4,
    "placementReady": true
  }
}
```

### GET /users/students?department=CS
Get all students. Roles: faculty, admin, placement.

### GET /users/profile/:id
Get user profile with approved achievements.

---

## Dashboard

### GET /dashboard/student
Role: student only.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalScore": 67,
    "placementReady": true,
    "summary": {
      "total": 5,
      "pending": 1,
      "faculty_approved": 1,
      "admin_approved": 3,
      "rejected": 0
    },
    "achievements": [...]
  }
}
```

---

### GET /dashboard/admin
Role: admin only.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalSubmissions": 120,
    "pendingApprovals": {
      "awaitingFaculty": 15,
      "awaitingAdmin": 8,
      "total": 23
    },
    "totalStudents": 200,
    "placementReady": 45,
    "departmentStats": [
      { "_id": "Computer Science", "totalAchievements": 60, "totalScore": 1200 }
    ]
  }
}
```

---

### GET /dashboard/placement?minScore=50&department=CS
Role: admin, placement.

Returns list of placement-ready students filtered by minimum score.

---

## Analytics

### GET /analytics/leaderboard?limit=10&department=CS
Top N students by score. All authenticated roles.

### GET /analytics/dashboard
Summary stats. Roles: admin, faculty, placement.

### GET /analytics/trends
Monthly achievement trends (last 6 months). Roles: admin, faculty.

### GET /analytics/department-performance
Aggregated stats per department. Roles: admin, faculty, placement.

### GET /analytics/type-distribution
Achievement count and score by type. Roles: admin, faculty.

### GET /analytics/performance-distribution
Student score distribution (excellent/good/average/low). Roles: admin, faculty.

---

## Error Responses

All errors follow this format:
```json
{
  "success": false,
  "message": "Descriptive error message"
}
```

| Status | Meaning                        |
|--------|--------------------------------|
| 400    | Bad request / validation error |
| 401    | Not authenticated              |
| 403    | Not authorized (wrong role)    |
| 404    | Resource not found             |
| 409    | Conflict (duplicate)           |
| 500    | Server error                   |

---

## Verification Workflow

```
Student uploads
      ↓
  status: pending
      ↓
Faculty reviews (PUT /achievements/:id/verify)
      ↓
  status: faculty_approved  OR  rejected
      ↓
Admin reviews (PUT /achievements/:id/verify)
      ↓
  status: admin_approved  OR  rejected
      ↓
  score computed & stored
  user.totalScore updated
  placementReady recalculated (threshold: 50)
```

Only `admin_approved` achievements contribute to a student's score.
