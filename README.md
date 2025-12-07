# RxConcile

**RxConcile** is a modern, SMART on FHIR web application designed to assist healthcare providers in the medication reconciliation process. By integrating directly with Electronic Health Record (EHR) systems via FHIR standards, it provides a streamlined interface for identifying therapeutic duplications, managing active prescriptions, and reviewing patient conditions.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Status](https://img.shields.io/badge/status-Active-success.svg)

## 🚀 Key Features

-   **SMART on FHIR Integration**: Seamlessly authenticates and retrieves patient data (Demographics, Medications, Conditions) from FHIR-compliant EHRs (tested with Logica/Meld Sandbox).
-   **Therapeutic Duplication Detection**: Leverages the **NLM RxNav API** to analyze drug classes (ATC, VA, MOA) and automatically flag potential therapeutic duplications (e.g., two different NSAIDs prescribed simultaneously).
-   **Real-Time Write-Back**:
    -   **Discontinue**: Allows providers to stop duplicate or unnecessary medications directly from the dashboard.
    -   **Prescribe**: Interface to prescribe new medications with dosage instructions, writing `MedicationRequest` resources back to the server.
-   **Patient Context**: Displays key patient demographics (Name, DOB, Sex) and a list of active conditions/diagnoses.
-   **Modern UI/UX**: Built with **Shadcn UI** and **Tailwind CSS** for a clean, accessible, and responsive professional healthcare interface.

## 🛠️ Technology Stack

-   **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **Components**: [Shadcn UI](https://ui.shadcn.com/)
-   **FHIR Client**: `fhirclient` (SMART on FHIR JS Client)
-   **Icons**: `lucide-react`
-   **External APIs**: National Library of Medicine (NLM) RxNav API

## 📋 Prerequisites

Before running the application, ensure you have the following:

1.  **Node.js**: Version 18.17 or later.
2.  **SMART on FHIR Sandbox**: An account with a FHIR sandbox provider like [Logica (Meld)](https://meld.interop.community/) or the [Epic on FHIR Sandbox](https://fhir.epic.com/).
3.  **Client ID**: You must register an app in your sandbox to obtain a `Client ID`.
    -   **Launch URL**: `http://localhost:3000/launch`
    -   **Redirect URL**: `http://localhost:3000`
    -   **Scopes**: `launch patient/MedicationRequest.read patient/MedicationRequest.write patient/Patient.read patient/Condition.read online_access openid profile`

## ⚙️ Installation & Setup

1.  **Clone the repository**

    ```bash
    git clone https://github.com/Xelem/Rx-Concile.git
    cd Rx-Concile
    ```

2.  **Install dependencies**

    ```bash
    npm install
    ```

3.  **Configure Environment Variables**
    Create a `.env.local` file in the root directory and add your SMART Client ID:
    ```env
    NEXT_PUBLIC_BASE_URL=http://localhost:3000
    NEXT_PUBLIC_MELD_CLIENT_ID=your_client_id_here
    ```

## 🏃‍♂️ Running the Application

### Development Server

Start the Next.js development server:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

### Launching with SMART Context

Since this is a SMART on FHIR app, it expects to be launched by an EHR. You cannot simply visit `http://localhost:3000` directly without a launch context (unless testing specific standalone components).

1.  **Go to your FHIR Sandbox** (e.g., Logica).
2.  **Select a Patient** from the sandbox interface.
3.  **Launch the App**: Find your registered "RxConcile" app and click **Launch**.
4.  The sandbox will redirect to `http://localhost:3000/launch`, perform the OAuth2 handshake, and then land on the main dashboard.

## 📖 Usage Guide

### 1. Medication Dashboard

Upon login, you will see the **Active Medications** list.

-   **Review**: See all active prescriptions for the patient.
-   **Alerts**: Red warning boxes appear at the top if therapeutic duplications are detected (e.g., "Multiple active medications found in class: NSAID").

### 2. Handling Alerts

-   **Dismiss**: Click "Dismiss Warning" to hide an alert for the current session.
-   **Resolve**: Click the **Stop** button next to a specific medication inside the alert box to discontinue that drug. This sends a request to the FHIR server to update the status to `stopped`.

### 3. Prescribing New Medications

1.  Click the **Add Medication** button in the header.
2.  Select a medication from the preset list (e.g., "Lisinopril").
3.  Enter **Dosage Instructions** (e.g., "10mg daily").
4.  Click **Confirm Prescription**.
5.  The app will write the new order to the EHR and refresh the list.

### 4. Viewing Conditions

Toggle the view using the **View Conditions** button to see a list of the patient's active diagnoses and problems.

## 📂 Project Structure

```
rx-concile/
├── app/
│   ├── context/        # SmartContext (FHIR client & state)
│   ├── launch/         # SMART Launch handler (/launch)
│   ├── page.tsx        # Main Dashboard
│   └── layout.tsx      # Root layout
├── components/
│   ├── ui/             # Shadcn UI primitives (Button, Dialog, etc.)
│   ├── AlertBox.tsx    # Feedback alerts
│   ├── AlertSection.tsx# Clinical warnings
│   ├── MedicationList.tsx
│   └── ConditionList.tsx
├── lib/
│   ├── rxnav.ts        # Service for NLM RxNav API interactions
│   ├── utils.ts        # Tailwind class merger
│   └── medication-utils.ts # Logic for finding duplicates
└── public/
```

## 🤝 Contributing

1.  Fork the project
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request
