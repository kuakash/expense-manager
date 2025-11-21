# Expense Tracker

A simple and beautiful web application to track your monthly home expenses. Built with React and Vite, designed to be mobile-friendly.

## Features

- 📊 Track expenses by month
- 💰 View monthly totals
- 🏷️ Categorize expenses (Food, Utilities, Transport, etc.)
- 📱 Fully responsive mobile design
- 💾 Local storage - your data persists in your browser
- 🎨 Modern, clean UI

## Getting Started

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to the URL shown in the terminal (usually `http://localhost:5173`)

### Building for Production

To create a production build:

```bash
npm run build
```

The built files will be in the `dist` directory.

## Usage

1. Select a month using the month selector
2. Add expenses by filling in the form:
   - Amount (required)
   - Description (required)
   - Category (optional, defaults to Food)
   - Date (optional, defaults to today)
3. View your expenses list and monthly total
4. Delete expenses by clicking the × button

## Technologies Used

- React 18
- Vite 5
- CSS3 (with mobile-first responsive design)

## Browser Support

Works on all modern browsers including Chrome, Firefox, Safari, and Edge.
