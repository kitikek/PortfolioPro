import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#4B607F',       // базовый синий
      light: '#D6E0EA',      // для бейджей, карточек
      dark: '#2F3E52',       // для активных состояний
      contrastText: '#F3F4F6',
    },
    secondary: {
      main: '#F3701E',       // оранжевый акцент
      light: '#FFE8D9',
      dark: '#B94E10',
      contrastText: '#F3F4F6',
    },
    background: {
      default: '#0B0F14',    // основной фон страницы
      paper: '#111827',      // фон карточек, панелей
    },
    text: {
      primary: '#F3F4F6',
      secondary: '#9CA3AF',
      disabled: '#6B7280',
    },
    error: {
      main: '#E35D5D',
      light: '#FCA5A5',
      dark: '#2A1A1A',
    },
    success: {
      main: '#4CAF7D',
      light: '#86EFAC',
      dark: '#1A2A22',
    },
    warning: {
      main: '#F59E0B',
      light: '#FCD34D',
      dark: '#2A2415',
    },
    info: {
      main: '#4B8BBE',
      light: '#93C5FD',
      dark: '#1A2230',
    },
    divider: '#2D3748',
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 600 },
    h2: { fontWeight: 600 },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 500 },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 16px',
        },
        containedPrimary: {
          backgroundColor: '#4B607F',
          '&:hover': {
            backgroundColor: '#3F516B',
          },
        },
        containedSecondary: {
          backgroundColor: '#F3701E',
          '&:hover': {
            backgroundColor: '#D85F16',
          },
        },
        outlinedPrimary: {
          borderColor: '#4B607F',
          color: '#F3F4F6',
          '&:hover': {
            borderColor: '#3F516B',
            backgroundColor: 'rgba(75, 96, 127, 0.1)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#111827',
          borderRadius: 16,
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#111827',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#0B0F14',
          boxShadow: 'none',
          borderBottom: '1px solid #2D3748',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
        colorPrimary: {
          backgroundColor: '#D6E0EA',
          color: '#0B0F14',
        },
        colorSecondary: {
          backgroundColor: '#FFE8D9',
          color: '#B94E10',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            '& fieldset': {
              borderColor: '#2D3748',
            },
            '&:hover fieldset': {
              borderColor: '#4B607F',
            },
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: '#111827',
          borderRadius: 16,
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});

export default theme;