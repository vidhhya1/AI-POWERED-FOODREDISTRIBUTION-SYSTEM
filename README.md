# 🍲 AI-Powered Food Redistribution System ♻️

[![Status](https://img.shields.io/badge/status-complete-brightgreen)](https://github.com/SriyaAnthoju/AI-Powered-FoodRedistribution)
[![Python](https://img.shields.io/badge/Python-3.8%2B-blue?logo=python)](https://www.python.org/)
[![Django](https://img.shields.io/badge/Django-4.x-092E20?logo=django)](https://www.djangoproject.com/)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react)](https://react.dev/)
[![MUI](https://img.shields.io/badge/Material--UI-v5-007FFF?logo=mui)](https://mui.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**An intelligent web platform designed to combat food waste and hunger by connecting food donors with those in need through a smart, efficient, and automated system.**

---

## Table of Contents

1.  [Introduction](#1-introduction)
2.  [The Problem](#2-the-problem)
3.  [Our Solution](#3-our-solution)
4.  [✨ Key Features](#4-key-features)
5.  [Project Structure](#5-project-structure)
6.  [💻 Technology Stack](#6-technology-stack)
7.  [System Architecture](#7-system-architecture)
8.  [🚀 Getting Started](#8-getting-started)
    * [Prerequisites](#prerequisites)
    * [Installation](#installation)
    * [Backend Setup](#backend-setup)
    * [Frontend Setup](#frontend-setup)
9.  [API Documentation](#9-api-documentation)
10. [👥 Key Roles](#10-key-roles)
11. [AI & ML Capabilities](#11-ai--ml-capabilities)
12. [Contributing](#12-contributing)
13. [License](#13-license)


---

## 1. Introduction

Food wastage is a significant global issue, particularly in urban areas where restaurants and events often have surplus edible food. Simultaneously, many individuals and communities face food insecurity and hunger.

This project introduces an **AI-Powered Food Redistribution System**, a digital platform that serves as a bridge between food donors (Senders) and receivers like NGOs or shelters (Receivers). Our goal is to redistribute surplus food smartly and efficiently, minimizing waste and supporting sustainable food management.

---

## 2. The Problem

* **Massive Food Wastage:** Restaurants, catering services, and events frequently generate excess edible food.
* **Food Insecurity:** Many communities and individuals struggle with hunger despite available surplus.
* **Inefficient Redistribution:** A lack of organized, efficient channels leads to perfectly good food going to waste.

---

## 3. Our Solution

Our platform aims to combat food wastage and insecurity by providing an intelligent web-based solution that connects donors with receivers using AI, automates processes, and promotes transparency.

---

## 4. ✨ Key Features

### 🧑‍💻 Role-Based Authentication
Separate login and dashboards for:
* **Senders (Food Donors):** Restaurants, caterers, and individuals with surplus food.
* **Receivers (NGOs, Shelters, Volunteers):** Those looking to accept donations.

### 🍱 Food Donation & Claiming System
* Donors can upload details of available food: type, quantity, shelf life, and optional images.
* Receivers can browse and claim available donations.
* Once claimed, the donor receives confirmation for the handover.
* **Google Maps Integration:** Facilitates precise location selection for donations and requests.

### 🤖 AI-Powered Features
* **Smart Matching Engine:** Suggests the best donors for each receiver based on geographic proximity, food type, and historical preferences, utilizing a **Random Forest Regressor** for robust matching.
* **Demand Prediction:** Uses a **Prophet model** to forecast areas likely to need food and identify peak demand times.
* **Anomaly Detection:** Monitors system behavior to detect fake entries, suspicious cancellations, or platform abuse.

### ⏰ System Automation with Celery
* **Automated AI Model Retraining:** The demand prediction models are automatically retrained every day at midnight, ensuring the AI stays up-to-date with the latest data.
* **Scheduled Reminders:** The system automatically sends periodic email reminders for donation pickups and for leaving feedback, managed entirely in the background.

### 🗣 Feedback and Review System
* After a donation is picked up, receivers can leave reviews and ratings to encourage trust and transparency.

### 📊 Admin Dashboard
* Admins can view all users, donations, claims, and analytics, providing insights into platform activity.

### 🔐 Secure & Modular Architecture
* Features secure **JWT-based authentication** for the API.
* Built with RESTful APIs, enabling a scalable, microservices-style development approach.

---

## 5. Project Structure

The repository is organized into `backend` (Django) and `frontend` (React) directories, reflecting the modular architecture.  
```
AI_FOOD_REDISTRIBUTION/
├── backend/
│   ├── backend/
│   │   ├── settings.py
│   │   └── urls.py
│   ├── demand/
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── urls.py
│   │   ├── views.py
│   │   └── utils.py
│   ├── foodredistribution/
│   │   ├── ai_engine/
│   │   │   ├── feature_extractor.py
│   │   │   └── matching_engine.py
│   │   ├── migrations/
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── urls.py
│   │   ├── views.py
│   │   └── tasks.py
│   └── .env                  # Environment variables for Django (DB, SECRET_KEY, Email)
├── frontend/
│   ├── src/
│   │   ├── components/       # Reusable React components
│   │   │   ├── AvailableDonationsList.js
│   │   │   ├── ClaimedDonationsList.js
│   │   │   ├── Dashboard.js
│   │   │   ├── DemandForecast.js
│   │   │   ├── DemandSubmissionForm.js
│   │   │   ├── EditProfileForm.js
│   │   │   ├── FeedbackForm.js
│   │   │   ├── FoodDonationForm.js
│   │   │   ├── FoodRequestForm.js
│   │   │   ├── LoginForm.js
│   │   │   ├── MapInput.js
│   │   │   ├── ReceiverRequestList.js
│   │   │   ├── RegistrationForm.js
│   │   │   ├── RequestMatches.js
│   │   │   ├── SenderDonationList.js
│   │   │   └── UserProfile.js
│   │   ├── api.js            # Axios instance for API calls with interceptors
│   │   ├── App.js            # Main application component
│   │   ├── index.js          # Entry point for React app
│   │   └── theme.js          # Material-UI custom theme configuration
│   └── .env                  # Environment variables for React (Google Maps API Key)
├── .gitignore
└── README.md

```
---

## 6. 💻 Technology Stack

| Component        | Technology / Library                                                                                                                                                                                                                            |
| :--------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Backend** | `Python`, `Django`, `Django REST Framework`, `Celery`                                                                                                                                                                                   |
| **Frontend** | `React.js`, `JavaScript`, `HTML5`, `CSS3`, `Material-UI (MUI)`                                                                                                                                                                            |
| **Database** | `MySQL`                                                                                                                                                                                                                                         |
| **Task Queue** | `Redis` (Broker), `django-celery-beat` (Scheduler)                                                                                                                                                                                              |
| **AI / ML** | `Scikit-learn` (for Random Forest Regressor), `Prophet` (for Demand Prediction), `Pandas`, `OpenCV` (for Image Classification), `TensorFlow`, `Keras`                                          |
| **Authentication**| `djangorestframework-simplejwt`                                                                                                                                                                                                               |
| **Notifications** | `SMTP` (via Django for email reminders)                                                                                                                                                                                                         |
| **Image Storage** | Local Storage (expandable to cloud solutions like AWS S3 or Cloudinary for production)                                                                                                 |
| **Mapping** | `@react-google-maps/api`                                                                                                                                                                                                                        |
| **Utilities** | `Axios`, `date-fns`                                                                                                                                                                                                                             |

---

## 7. System Architecture

The platform is built on a modular, layered architecture, ensuring scalability and maintainability. Each component functions independently while working together to match donors and recipients seamlessly.

* **Presentation Layer (Frontend):** A dynamic and responsive user interface built with `React.js`. It handles user registration, login, food upload forms, and donation Browse.
* **Application Layer (Backend):** The core logic is powered by `Django`. It manages user sessions, REST APIs, and business logic, and communicates with the AI engine.
* **AI/ML Engine:** This layer houses our intelligent models for matching, prediction, and detection.
* **Data Layer:** Securely stores all platform data, including user profiles, donations, and ratings, using a `MySQL` database. Food images are managed via local file storage.
* **Notification Layer:** Handles all user communications, sending real-time alerts about new donations via `SMTP Email`.


---

## 8. 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites
* Python 3.8+
* Node.js 14+ and npm (or Yarn)
* MySQL Server (if not using SQLite for backend)
* Git

### Installation
1.  **Clone the repository:**
    ```bash
    git clone https://github.com/vidhhya1/AI-POWERED-FOODREDISTRIBUTION-SYSTEM.git
    cd /AI-POWERED-FOODREDISTRIBUTION-SYSTEM
    ```

### Backend Setup
1.  **Navigate to backend directory:**
    ```bash
    cd backend
    ```
2.  **Create a virtual environment:**
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows, use `.\venv\Scripts\activate`
    ```
3.  **Install Python dependencies:**
    ```bash
    pip install Django djangorestframework djangorestframework-simplejwt Pillow django-cors-headers celery redis django-celery-beat mysqlclient scikit-learn pandas prophet tensorflow keras opencv-python
    ```
   
4.  **Configure environment variables:**
    * Create a `.env` file in the `backend` directory. Refer to `backend/backend/settings.py` for required variables.
    * Example `.env` content:
        ```
        # Django Settings
        DJANGO_SECRET_KEY='your-very-secret-key-here-for-production'
        DJANGO_DEBUG='True'
        DJANGO_ALLOWED_HOSTS='localhost,127.0.0.1'

        # Database Settings (for MySQL example)
        DB_ENGINE='django.db.backends.mysql'
        DB_NAME='food_redistribution_db'
        DB_USER='food_user'
        DB_PASSWORD='your_db_password'
        DB_HOST='127.0.0.1' # or your MySQL host
        DB_PORT='3306'

        # Email Settings (for Celery reminders)
        EMAIL_USE_TLS=True
        EMAIL_HOST='smtp.gmail.com'
        EMAIL_PORT=587
        EMAIL_HOST_USER='your_email@example.com' # Your Gmail or SMTP user
        EMAIL_HOST_PASSWORD='your_app_password' # Your Gmail app password or SMTP password
        DEFAULT_FROM_EMAIL='your_email@example.com'
        ```
5.  **Run database migrations:**
    ```bash
    python manage.py migrate
    ```
6.  **Create a superuser (for Django Admin access):**
    ```bash
    python manage.py createsuperuser
    ```
7.  **Start Celery Worker (in a separate terminal):**
    ```bash
    celery -A backend worker -l info -P eventlet # `eventlet` might need `pip install eventlet`
    ```
8.  **Start Celery Beat Scheduler (in another separate terminal):**
    ```bash
    celery -A backend beat -l info --scheduler django_celery_beat.schedulers:DatabaseScheduler
    ```
9.  **Run the Django development server (in yet another terminal):**
    ```bash
    python manage.py runserver
    ```
    The backend API will be available at `http://localhost:8000/`. You can access the Django admin at `http://localhost:8000/admin/`.

### Frontend Setup
1.  **Navigate to the frontend directory:**
    ```bash
    cd ../frontend # From the backend directory
    ```
2.  **Install Node.js dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```
3.  **Configure Google Maps API Key:**
    * Obtain a Google Maps API Key from the Google Cloud Console. Ensure **Maps JavaScript API**, **Places API**, and **Geocoding API** are enabled. A linked billing account is required.
    * Create a `.env` file in the `frontend` directory:
        ```
        REACT_APP_Maps_API_KEY=YOUR_Maps_API_KEY_HERE
        ```
        Replace `YOUR_Maps_API_KEY_HERE` with your actual key.
4.  **Start the React development server:**
    ```bash
    npm start
    # or
    yarn start
    ```
    The frontend application will open in your browser, typically at `http://localhost:3000/`.

---

## 9. API Documentation

The backend exposes a comprehensive set of RESTful API endpoints for authentication, user management, food donations, requests, claims, feedback, and demand forecasting.

* **Authentication & User Management:**
    * `POST /api/register/`
    * `POST /api/token/`
    * `POST /api/token/refresh/`
    * `GET /api/user/`
    * `PUT /api/user/`
* **Food Redistribution Core:**
    * `GET /api/donations/`, `POST /api/donations/`, `GET /api/donations/{id}/`, `PUT/PATCH /api/donations/{id}/`, `DELETE /api/donations/{id}/`
    * `GET /api/donations/available/`
    * `POST /api/donations/{donation_id}/claim/`
    * `GET /api/requests/`, `POST /api/requests/`, `GET /api/requests/{id}/`, `PUT/PATCH /api/requests/{id}/`, `DELETE /api/requests/{id}/`
    * `GET /api/requests/{request_id}/matches/`
    * `GET /api/claims/`
    * `POST /api/feedback/`
* **General Resources:**
    * `GET /api/categories/`
    * `GET /api/locations/`
* **Demand Forecasting:**
    * `GET /api/demand/forecast/`
    * `POST /api/demand/submit/`
* **Administrative & Utility:**
    * `GET/POST /api/trigger-reminder/`
    * `ALL /admin/`

For detailed API specifications (request/response bodies, parameters), please refer to the backend API documentation within the repository.

---

## 10. 👥 Key Roles

### Sender (Donor)
An individual or organization with surplus food. Responsibilities include uploading food details (type, quantity, expiry), waiting for confirmation, and handing over the food.

### Receiver (Acceptor)
An NGO, shelter, or person in need. Responsibilities include Browse and selecting donations, scheduling pickup, and providing feedback after collection.

---

## 11. AI & ML Capabilities

The intelligence of the platform is significantly enhanced by its integrated AI/ML components:

* **Smart Matching:** Recommends the optimal receivers for donations by analyzing previous patterns, location, and food type, powered by a **Random Forest Regressor**.
* **Demand Prediction:** Forecasts areas and times with high demand using historical data, implemented with the **Prophet model**.
* **Anomaly Detection:** Identifies unusual behaviors, such as frequent cancellations or fake postings, to maintain platform integrity.
* **Automated Retraining:** Demand prediction models are automatically retrained daily at midnight using Celery, ensuring the AI stays up-to-date.

---

## 12. Future Enhancements

* **Real-time Notifications:** Implement push notifications or WebSocket-based alerts for new donations/requests/matches.
* **Advanced Search & Filters:** More granular search options for donations and requests.
* **Admin Dashboard Frontend:** A dedicated, rich UI for administrators to manage users, content, and view analytics.
* **User Reviews & Trust Scores:** Build a reputation system for donors and receivers.
* **Routing & Logistics:** Integrate with mapping services for optimal pickup routes.
* **AI Model Retraining UI:** Interface for administrators to monitor and trigger AI model retraining.
* **Enhanced UI/UX:** Further visual polish, animations, and accessibility improvements.

---

## 13. Contributing

We welcome contributions to this project! If you'd like to contribute, please follow these steps:

1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/your-feature-name`).
3.  Make your changes.
4.  Commit your changes (`git commit -m 'feat: Add new feature'`).
5.  Push to the branch (`git push origin feature/your-feature-name`).
6.  Open a Pull Request.

---

## 14. License

This project is licensed under the MIT License - see the `LICENSE` file (if applicable) for details.

---
