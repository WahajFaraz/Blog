// import React, { createContext, useContext, useState, useEffect } from 'react';
// import { lightTheme, darkTheme } from '../GlobalStyles';

// const ThemeContext = createContext();

// export const ThemeProvider = ({ children }) => {
//   const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

//   useEffect(() => {
//     localStorage.setItem('theme', theme);
//     document.body.classList.remove('light', 'dark');
//     document.body.classList.add(theme);
//   }, [theme]);

//   const toggleTheme = () => {
//     setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
//   };

//   return (
//     <ThemeContext.Provider value={{ theme, toggleTheme }}>
//       {children}
//     </ThemeContext.Provider>
//   );
// };

// export const useTheme = () => useContext(ThemeContext); 