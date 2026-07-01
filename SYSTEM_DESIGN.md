# System Design Document — Last-Mile Delivery Tracker

---

# Overview

The **Last-Mile Delivery Tracker** is a layered logistics platform built using **Node.js**, **Express.js**, **PostgreSQL**, and **Sequelize ORM**. It provides end-to-end management of delivery orders, from order creation and dynamic pricing to agent assignment, delivery tracking, and customer notifications.

The application follows a modular service-oriented architecture where business logic is encapsulated into independent services such as the **Rate Calculation Engine**, **Zone Detector**, **Assignment Service**, and **Notification Service**.

Every order status transition is permanently recorded in the **Tracking History** table, creating an immutable audit trail that improves transparency, debugging, and operational accountability.

---

# Technology Stack

| Layer | Technology |
|--------|------------|
| Frontend | HTML, CSS, JavaScript |
| Backend | Node.js, Express.js |
| Database | PostgreSQL |
| ORM | Sequelize |
| Authentication | JWT (JSON Web Tokens) |
| API Documentation | Swagger (OpenAPI) |
| Email Notifications | Nodemailer (SMTP) |
| SMS Notifications | Twilio (Optional) |

---

# Role-Based Access Control

The system enforces **Role-Based Access Control (RBAC)** using JWT authentication.

### Admin

- Manage Zones
- Manage Rate Cards
- View all Orders
- Manually assign Agents
- Auto-assign Agents
- Override Order Status
- Manage Agent Availability

### Customer

- Register/Login
- Calculate Delivery Charges
- Create Orders
- Track Orders
- Reschedule Failed Deliveries

### Agent

- View Assigned Orders
- Update Delivery Status
- Mark Deliveries as Picked Up, In Transit, Delivered, or Failed

---

# 1. Rate Calculation Engine

The rate calculation engine is executed during both:

- `POST /api/orders/calculate-charge`
- `POST /api/orders`

It follows a deterministic pipeline.

## Pipeline

```
Address Input
      │
      ▼
Zone Detection
      │
      ▼
pickup_zone_id
drop_zone_id
      │
      ▼
Volumetric Weight
= (Length × Breadth × Height) / 5000
      │
      ▼
Billed Weight
=max(actual_weight, volumetric_weight)
      │
      ▼
Rate Card Lookup
(order_type + from_zone + to_zone)
      │
      ▼
Delivery Charge
= base_price + billed_weight × price_per_kg
      │
      ▼
COD Surcharge
(if payment type is COD)
      │
      ▼
Total Charge
```

### Configuration

All pricing rules are stored inside the **Rate Cards** table.

Administrators can configure:

- Base Price
- Price per Kilogram
- COD Percentage
- Separate pricing for B2B and B2C
- Different pricing between every pair of zones

No pricing logic is hardcoded.

### Error Handling

If no matching rate card exists for the selected pickup and drop zones, the request returns an appropriate validation error, prompting the administrator to configure the missing pricing rule.

---

# 2. Zone Detection

## Data Model

Each **Zone** contains multiple **ZoneArea** records.

Each ZoneArea stores a keyword such as:

- Postal Code
- City
- Locality
- Neighbourhood

Example:

```
North Zone
    ├── 110001
    ├── Connaught Place
    ├── Karol Bagh
```

## Detection Algorithm

```
For every ZoneArea

    if address contains area_keyword

        return zone_id

return null
```

The algorithm performs case-insensitive keyword matching.

### Design Decision

The system intentionally avoids external geocoding services such as Google Maps.

Advantages:

- No API cost
- No rate limits
- Lower latency
- Administrator-controlled mappings
- Easy maintenance

This approach works effectively for structured logistics addresses and can later be replaced with polygon-based GIS mapping without changing the database schema.

---

# 3. Auto Assignment Logic

## Goal

Automatically assign the nearest available delivery agent to a newly created or rescheduled order.

## Algorithm

```
Find all available agents

↓

Filter agents in pickup zone

↓

If none found

↓

Use all available agents

↓

Calculate Haversine Distance

↓

Select minimum distance

↓

Assign agent

↓

Set agent unavailable

↓

Update order status to Assigned
```

## Distance Calculation

The system uses the **Haversine Formula**.

```
a = sin²(Δlat/2)
  + cos(lat1)
  × cos(lat2)
  × sin²(Δlng/2)

distance = 2R × arcsin(√a)

R = 6371 km
```

## Availability Management

Agents maintain an `is_available` flag.

The flag becomes:

- **false** after assignment
- **true** after Delivered
- **true** after Failed

Administrators can also manually change availability through:

```
PUT /api/agents/{id}/availability
```

This prevents multiple simultaneous assignments.

---

# 4. Failed Delivery Handling

## State Flow

```
Out for Delivery

        │

        ▼

      Failed

        │

Customer Notification

        │

Customer Reschedules

        │

Save rescheduled_date

        │

Release Previous Agent

        │

Auto Assignment

        │

Assigned
```

## Design Decisions

### Immutable Tracking

Order history is never overwritten.

Each state transition inserts a new row into **Tracking History**.

Example:

```
Pending

↓

Assigned

↓

Picked Up

↓

In Transit

↓

Failed

↓

Pending

↓

Assigned
```

All previous events remain permanently available.

### Audit Trail

Every tracking record stores:

- Actor ID
- Actor Role
- Status
- Notes
- Timestamp

This enables complete traceability.

### Agent Release

When delivery fails:

- Previous agent becomes available
- Order returns to Pending
- Auto Assignment is triggered again

A different agent may be selected.

---

# 5. Notification Architecture

Every successful order status update invokes the **Notification Service**.

The service performs the following steps:

1. Generate a status-specific notification message.
2. Send an email using Nodemailer via SMTP.
3. Log the email result in the **Notifications** table.
4. Optionally send an SMS using Twilio if configured.
5. Record SMS success or failure.
6. Return control to the main request.

Notification failures are fully isolated from the order workflow. Even if an email or SMS provider is unavailable, the business transaction completes successfully while the failure is logged for future inspection.

---

# System Architecture

```
                Browser (Customer/Admin/Agent)
                           │
                           │ REST API
                           ▼
                 Express Application (Node.js)
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
 Rate Engine       Assignment Service   Notification Service
        │                  │                  │
        └──────────────────┼──────────────────┘
                           │
                           ▼
                    Zone Detection
                           │
                           ▼
                     PostgreSQL Database
      users • orders • zones • zone_areas
      rate_cards • tracking_history • notifications
                           │
                           ▼
                 External Services
              SMTP (Email) • Twilio (SMS)
```

---

# Conclusion

The Last-Mile Delivery Tracker follows a modular, layered architecture where each business capability is implemented as an independent service. Pricing, zone detection, agent assignment, tracking, and notifications are all database-driven, minimizing hardcoded rules and improving maintainability.

The design emphasizes scalability, auditability, and configurability while remaining simple enough for educational and small-to-medium logistics deployments. Future enhancements such as Docker, Redis caching, WebSockets, background job queues, and GIS-based routing can be incorporated without significant architectural changes.