import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      lightest: '#E3F2FD', // Custom
      light: '#CEEAFC',
      main: '#BBDEFB',
      dark: '#90CAF9',
      darkest: '#42A5F5',  // Custom
      contrastText: '#212121', // Để text hiển thị rõ trên nền xanh
    },
    secondary: {
      light: '#FFE082',
      main: '#FBC02D',
      dark: '#F9A825',
      contrastText: '#212121',
    },
    // Map các màu xám vào object grey
    grey: {
      100: '#F5F5F5',
      200: '#EEEEEE',
      300: '#E0E0E0',
      500: '#9E9E9E',
      700: '#616161',
    },
    // Cấu hình màu chữ và nền
    text: {
      primary: '#616161', // Gray 700
      secondary: '#9E9E9E', // Gray 500
      heading: '#212121',   // Black (Custom key)
    },
    background: {
      default: '#FFFFFF', // White
      paper: '#F5F5F5',   // Gray 100
    },
    // Trạng thái
    success: { main: '#4CAF50' },
    warning: { main: '#FFC107' },
    error: { main: '#F44336' },
    info: { main: '#29B6F6' },
  },
});

export default theme;