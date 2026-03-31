# 🏛️ Bookmarks Browser

A luxury editorial-style bookmark management system built with **Vite**, **Tailwind CSS v4**, and **JSONBin.io**. This project transforms your standard browser bookmarks into a refined private library collection.

![Library Aesthetic](https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&q=80&w=1200)

## ✨ Features

-   **Editorial Design**: Follows the "Digital Archivist" aesthetic (Midnight/Gold palette).
-   **Cloud Persistence**: Powered by JSONBin for real-time CRUD operations.
-   **Dynamic Collections**: Automatically organizes links by categories (folders).
-   **Glassmorphism**: Elegant modals and components with backdrop blur effects.
-   **Local Migration**: Includes a parser to import your Brave/Chrome bookmarks HTML directly.

## 🚀 Getting Started

### 1. Prerequisites

-   [Node.js](https://nodejs.org/) (v18 or higher)
-   A [JSONBin.io](https://jsonbin.io/) account.

### 2. Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/Danuzu11/BookmarksNavegadores.git
cd BookmarksNavegadores
npm install
```

### 3. Configuration

Create a `.env` file in the root directory and add your JSONBin credentials:

```env
VITE_JSONBIN_BIN_ID=your_bin_id_here
VITE_JSONBIN_MASTER_KEY=your_master_key_here
```

### 4. Running the App

Start the development server:

```bash
npm run dev
```

### 5. Initial Data Migration

To import your existing bookmarks:
1.  Place your exported HTML file in the project root and name it `bookmarks_31_03_26.html` (or update `parse_bookmarks.js`).
2.  Run the parser: `node parse_bookmarks.js`.
3.  In the web app, click the **"Upload Initial Data"** button in the sidebar to push your local bookmarks to the cloud.

## 📦 Deployment (GitHub Pages)

This project is configured to deploy automatically via GitHub Actions.

1.  Push your code to the `main` branch.
2.  Go to your repository **Settings** > **Secrets and variables** > **Actions**.
3.  Add the following secrets:
    -   `VITE_JSONBIN_BIN_ID`
    -   `VITE_JSONBIN_MASTER_KEY`
4.  Go to **Settings** > **Pages** and under **Build and deployment** > **Source**, select **GitHub Actions**.

The site will be live at `https://<your-username>.github.io/BookmarksNavegadores/`.

## 🛠️ Built With

-   **Vite**: Next-generation frontend tooling.
-   **Tailwind CSS v4**: CSS-first utility framework.
-   **JSONBin**: Cloud JSON storage.
-   **Material Symbols**: Editorial iconography.

---
*Preserving digital artifacts for the modern era.*
