# Maharasa Portal — Lovable Master Prompt

You are an expert Product Designer, Senior UI/UX Designer, and Senior Frontend Engineer.

Your task is to build a modern **Enterprise Internal Application Portal** for **Maharasa Group**.

This portal will become the **single entry point** for all internal company applications.

The portal should feel like a premium SaaS product similar to Microsoft 365, Atlassian Home, Linear, Vercel Dashboard, or Google Workspace.

The goal is **not** to build a simple page containing hyperlinks, but to build an enterprise application launcher that is scalable, maintainable, and ready for future growth.

---

# PROJECT OVERVIEW

**Company**
Maharasa Group

**Application Name**
Maharasa Portal

**Tagline**
One Portal. Every Application.

**Purpose**

Employees should only need to open one website to access every company application.

Examples of applications include:

* HRIS
* IT Helpdesk
* Tukar Faktur Online
* CMMS
* Inventory
* Purchase
* Sales
* Recruitment
* Asset Management
* Finance
* Vendor Portal
* Approval System
* Colorplate Production
* POS Dashboard
* Kitchen Display
* Attendance Machine
* Document Management
* Customer Feedback

The company will continue adding more applications over time, so the architecture must support dozens or even hundreds of applications without requiring UI changes.

---

# DESIGN STYLE

Create a premium enterprise UI.

Theme inspiration:

* Microsoft 365
* Atlassian Home
* Linear
* Vercel Dashboard
* Notion
* Google Workspace

Style:

* Clean
* Professional
* Modern
* Minimalist
* Elegant
* Premium
* Enterprise-grade

Primary Color

#006400

Accent Color

#0F9D58

Background

#F8FAFC

Rounded Corners

16px

Shadow

Soft

Animations

Smooth and subtle

Icons

Lucide Icons

Typography

Modern
Highly readable

The UI should look like software used by a company with thousands of employees.

---

# TECHNOLOGY STACK

Use:

* React
* TypeScript
* Vite
* TailwindCSS
* shadcn/ui
* React Router
* Lucide Icons

Do not use unnecessary libraries.

Prioritize maintainability.

---

# PROJECT STRUCTURE

Create a clean scalable architecture.

Example:

```
src/

components/
layouts/
pages/
hooks/
services/
types/
utils/
data/
assets/
```

Follow component-based architecture.

No duplicated code.

---

# APPLICATION DATA

Never hardcode application data inside components.

Store application data inside

```
src/data/applications.ts
```

Application model:

```ts
id
name
description
url
icon
category
status
favorite
color
lastOpened
requiresAuth
authProvider
launchType
```

Example:

```ts
{
 id: "helpdesk",
 name: "IT Helpdesk",
 description: "IT Ticket Management",
 url: "https://helpdesk.maharasa.id/auth/login",
 icon: "LifeBuoy",
 category: "IT",
 status: "online",
 favorite: false,
 color: "#1976D2",
 lastOpened: null,
 requiresAuth: false,
 authProvider: null,
 launchType: "new_tab"
}
```

The portal must be designed to support unlimited applications.

---

# LAYOUT

## Top Navigation

Include:

* Maharasa Logo
* Portal Name
* Search Bar
* Command Search Button
* Notification Icon
* Theme Switch
* User Avatar
* User Dropdown
* Settings

---

## Sidebar

Responsive sidebar.

Contains:

* Dashboard
* Applications
* Favorites
* Recently Used
* Categories
* Settings
* About

Sidebar should collapse on smaller screens.

---

# HERO SECTION

Display a beautiful hero card.

Greeting changes automatically.

Morning

Good Morning

Afternoon

Good Afternoon

Evening

Good Evening

Display:

Welcome Back

Access all Maharasa applications from one place.

Include:

* Soft gradient
* Abstract illustration
* Company branding

---

# DASHBOARD

Display beautiful statistic cards.

Cards:

* Total Applications
* Favorites
* Recently Opened
* Online Applications

Each card:

* Icon
* Animated number
* Hover animation

---

# SEARCH

Implement instant search.

Search by:

* Name
* Description
* Category

Keyboard Shortcut

CTRL + K

Use a Command Palette style search.

---

# FILTERS

Horizontal chips.

Include:

* All
* Favorites
* Recently Used
* Human Resource
* IT
* Finance
* Production
* Warehouse
* Operations
* Sales
* Management
* Administration

---

# APPLICATION GRID

Display applications as premium cards.

Each card contains:

* Icon
* Name
* Description
* Category Badge
* Status Badge
* Favorite Button
* Open Button

Hover:

* Lift animation
* Shadow
* Smooth transition

Clicking Open should launch the application in a new browser tab.

---

# STATUS BADGES

Green

Online

Yellow

Maintenance

Red

Offline

---

# SAMPLE APPLICATIONS

Provide realistic sample applications.

Examples:

* HRIS
* IT Helpdesk
* Tukar Faktur Online
* CMMS
* Inventory
* Purchase
* Recruitment
* Finance
* Vendor Portal
* Colorplate Production
* POS Dashboard
* Kitchen Display
* Sales Dashboard
* Asset Management
* Attendance Machine
* Approval System
* Document Management
* Customer Feedback

Include additional dummy applications so the interface feels realistic.

---

# FAVORITES

Allow users to:

* Pin favorites
* Remove favorites

Store in LocalStorage.

Favorite applications should appear first.

---

# RECENTLY OPENED

Remember recently opened applications.

Maximum:

10

Use LocalStorage.

---

# THEME

Support:

* Light Mode
* Dark Mode

Remember theme preference.

---

# LOADING

Use Skeleton UI.

Avoid blank pages.

---

# EMPTY STATE

When search returns nothing.

Display:

Illustration

"No applications found."

---

# RESPONSIVE DESIGN

Support:

Desktop

Tablet

Mobile

Grid should automatically adjust.

---

# FOOTER

Display:

Maharasa Portal

Version 1.0.0

© Maharasa Group

---

# ANIMATIONS

Use tasteful animations.

Examples:

* Fade
* Scale
* Card lift
* Page transition

Do not overuse animations.

---

# NOTIFICATIONS

Include placeholder notification dropdown.

Future ready.

---

# SETTINGS PAGE

Create placeholder page.

Future configuration will be added later.

---

# ABOUT PAGE

Create placeholder page.

Include:

Portal Version

Company

Technology Stack

---

# SERVICE LAYER

Create a service layer.

Example:

```
ApplicationService
```

Currently reads local data.

Later this service will be replaced with REST API without changing UI components.

---

# CODE QUALITY

Follow best practices.

* Clean Architecture
* SOLID principles where appropriate
* Reusable Components
* Strong TypeScript Typing
* Custom Hooks
* Separation of Concerns
* Readable Code
* Easy Maintenance

---

# FUTURE ADMIN PANEL

Do not build it yet.

However, prepare the architecture so an Admin Panel can be added later.

Future features:

* Add applications
* Edit applications
* Delete applications
* Upload icons
* Change categories
* Change status
* Reorder applications
* Import from API

No backend implementation is required now.

---

# FUTURE API SUPPORT

The portal currently uses local data.

However, every layer should be designed so it can later consume:

REST API

without requiring major refactoring.

---

# FUTURE SSO SUPPORT (PHASE 2)

**IMPORTANT**

Do NOT implement authentication or Single Sign-On in this version.

This portal is **Phase 1** only.

The current version should simply open applications using their URLs in a new browser tab.

However, the architecture **must be prepared** for future SSO integration.

In Phase 2, the portal will become the central entry point for authentication using an Identity Provider (such as Keycloak or another SSO solution).

Prepare the data model to support future fields like:

```ts
requiresAuth
authProvider
clientId
clientSecret
realm
redirectUri
launchType
roles
permissions
```

The UI should not expose these settings yet.

Instead, keep the architecture flexible so authentication can later be added with minimal refactoring.

The application launcher should eventually support:

* Single Sign-On
* Role-based access
* Permission-based application visibility
* Automatic login
* JWT/OIDC authentication
* OAuth2/OpenID Connect
* Token refresh
* Session management

Again:

**Do NOT build these features now.**

Only prepare the project architecture for them.

---

# FINAL GOAL

Build a polished enterprise portal that feels like a commercial SaaS product rather than a collection of hyperlinks.

The portal should be intuitive, beautiful, fast, scalable, and maintainable.

It should be ready to evolve into the company's official Application Launcher, with future support for APIs, Admin Panel, and Single Sign-On without requiring significant architectural changes.
