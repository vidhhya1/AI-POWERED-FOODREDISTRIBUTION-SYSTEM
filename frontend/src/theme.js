// frontend/src/theme.js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#4CAF50', // A nice green for primary actions (like donate/claim)
    },
    secondary: {
      main: '#FFC107', // A warm yellow for secondary actions or highlights
    },
    error: {
      main: '#F44336', // Standard red for errors
    },
    background: {
      default: '#F5F5F5', // Light grey background
      paper: '#FFFFFF',   // White for cards/forms
    },
    text: {
      primary: '#212121', // Dark grey for most text
      secondary: '#757575', // Lighter grey for secondary text
    },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif', // Use Roboto or any Google Font you prefer
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 500,
    },
  },
  // You can add more customizations here (spacing, breakpoints, components overrides)
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none', // Prevent uppercase buttons by default
          borderRadius: 8,      // Slightly rounded corners
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12, // More rounded cards
          boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.05)', // Subtle shadow
        },
      },
    },
  },
});

export default theme;