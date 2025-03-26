# Smart8Ball Context Document

## Overview
Smart8Ball is an AI-powered decision-making companion that guides users through challenging choices by providing context-aware advice and interactive flowcharts. This document outlines the entire app flow—from onboarding to the interactive decision process—ensuring that developers have a clear blueprint to turn the concept into a reality.

## Key Differentiators
- **Dynamic Flowchart Visualization:**  
  Each decision is mapped as an interactive flowchart that visualizes the entire decision-making process.
- **Real-Time Feedback Loop:**  
  The app continuously collects user feedback at every step to refine the decision path.
- **Personality-Driven Guidance:**  
  Users can choose from unique personalities (e.g., Rocky Balboa, Uncle Iroh, Cupid, Jordan Belfort, David Goggins) or take a personality quiz to tailor the advice.
- **Contextual Analysis:**  
  By uploading PDFs or PNGs, users can supply extra context that the AI uses to enhance its insights.

## User Flow Overview
1. **Onboarding & Authentication:**
   - **Welcome Screen:**  
     Introduces Smart8Ball, highlights key features, and explains the benefits of personalized, AI-powered decision making.
   - **Signup/Login:**  
     Users register or log in using Supabase for secure authentication. Read from a .env file the ANON key and URL. 
   - **Tutorial/Walkthrough:**  
     A brief interactive tour explains the app's flow, how to use the flowchart, and where to provide feedback.

2. **Profile Setup:**
   - **Personality Quiz:**  
     Users complete a Myers-Briggs–style quiz to determine their personality traits.
   - **Personality Selection:**  
     Optionally, users can select a preferred advice persona from a list (e.g., Rocky Balboa, Uncle Iroh).

3. **Decision-Making Process:**
   - **Home/Dashboard:**  
     Serves as the central hub where users can initiate new decision sessions, review past decisions, or adjust settings.
   - **Decision Input & Context Upload:**  
     - **Input Field:** Users enter the decision topic or question.
     - **Context Upload:** Users can attach PDFs/PNGs to provide additional background information.
   - **Flowchart Generation & Interactive Session:**  
     - **Flowchart Display:** The AI (via Google Gemini) generates an initial flowchart mapping out the decision process.
     - **Interactive Nodes:** Each node in the flowchart is clickable, offering detailed advice and prompting for feedback.
     - **Feedback Loop:** Users validate or adjust the advice at each node, influencing subsequent steps and refining the overall decision path.

4. **Additional Features:**
   - **Personalized Advice:**  
     Advice is consistently tailored based on the selected personality and quiz outcomes.
   - **Historical Data & Session Review:**  
     Users can access previous decision sessions to review past choices and outcomes.
   - **Notifications & Reminders:**  
     In-app notifications keep users updated on new advice, system improvements, or reminders to complete pending decision sessions.

## Screen Flow & Navigation Details
- **Onboarding Screen:**  
  *Purpose:* Introduce the app's concept and benefits.  
  *Key Elements:*  
  - Welcome message  
  - Overview of key features  
  - Signup/Login buttons

- **Authentication Screen:**  
  *Purpose:* Secure user login/signup using Supabase.  
  *Key Elements:*  
  - Credential input forms  
  - Error handling and user feedback

- **Profile Setup Screen:**  
  *Purpose:* Establish user identity and personality preferences.  
  *Key Elements:*  
  - Myers-Briggs quiz interface  
  - Personality selection module  
  - Option to edit profile details

- **Home/Dashboard Screen:**  
  *Purpose:* Act as the command center for starting new sessions, reviewing past decisions, and accessing settings.  
  *Key Elements:*  
  - Navigation menu (e.g., Home, Profile, Settings)  
  - Session initiation button  
  - Quick access to recent decision sessions

- **Decision Input Screen:**  
  *Purpose:* Gather decision queries and contextual data.  
  *Key Elements:*  
  - Text field for decision topics  
  - File upload button for PDFs/PNGs  
  - 'Start Decision Process' trigger

- **Flowchart Visualization Screen:**  
  *Purpose:* Display and interact with the decision flowchart.  
  *Key Elements:*  
  - Dynamically generated flowchart  
  - Interactive nodes that reveal advice and feedback options  
  - Navigation controls to step through the flow

- **Feedback & Results Screen:**  
  *Purpose:* Present detailed advice and capture user input at decision points.  
  *Key Elements:*  
  - Detailed advice cards  
  - Feedback buttons (e.g., "This helped", "Needs more detail")  
  - Option to backtrack or modify decisions

- **Settings & Notifications Screen:**  
  *Purpose:* Manage app preferences and view updates.  
  *Key Elements:*  
  - User preference toggles (e.g., notification settings, theme options)  
  - Notification list with alerts for new advice or system updates  
  - Account management options

## Technical Architecture & Data Flow
- **Frontend:**
  - **React Native & TypeScript:**  
    For a robust, cross-platform mobile application.
  - **Expo & Expo Router:**  
    For navigation and app structure management.
  - **State Management:**  
    Using Zustand for global state management.
  - **UI Components:**  
    NativeWind for styling and custom components.

## Database Schema (Supabase)
supabase auth being used
supabase "profiles" tables which stores full_name, nickname, email, created_at, and id. 
