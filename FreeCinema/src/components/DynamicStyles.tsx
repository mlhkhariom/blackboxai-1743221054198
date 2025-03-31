
import { useEffect } from 'react';
import { useAdmin } from '../contexts/AdminContext';

const DynamicStyles = () => {
  const { settings } = useAdmin();

  useEffect(() => {
    // Create style element for custom CSS
    const style = document.createElement('style');
    style.id = 'admin-custom-styles';
    style.innerHTML = `
      :root {
        --primary: ${settings.primaryColor};
        --moviemate-primary: ${settings.primaryColor};
        --secondary: ${settings.secondaryColor || '#7E69AB'};
        --accent: ${settings.accentColor || '#6E59A5'};
        --sidebar-background: ${settings.sidebarBackgroundColor || '#1a1f2c'};
      }
      
      /* Customize button and link hover states */
      .btn-primary, .btn-primary-hover:hover {
        background-color: ${settings.primaryColor};
        color: white;
      }
      
      /* Apply custom theme colors */
      .theme-border {
        border-color: ${settings.primaryColor}40; /* 40 is for 25% opacity */
      }
      
      .theme-card {
        background-color: rgba(26, 31, 44, 0.8);
        backdrop-filter: blur(12px);
        border: 1px solid ${settings.primaryColor}20;
        box-shadow: 0 4px 20px ${settings.primaryColor}10;
      }
      
      /* Custom scrollbar */
      ::-webkit-scrollbar-thumb {
        background-color: ${settings.primaryColor}50; 
      }
      
      ::-webkit-scrollbar-thumb:hover {
        background-color: ${settings.primaryColor};
      }
      
      ${settings.customCSS || ''}
    `;
    
    // Add or replace the style element
    const existingStyle = document.getElementById('admin-custom-styles');
    if (existingStyle) {
      existingStyle.innerHTML = style.innerHTML;
    } else {
      document.head.appendChild(style);
    }
    
    return () => {
      // Cleanup
      const styleElement = document.getElementById('admin-custom-styles');
      if (styleElement) {
        styleElement.remove();
      }
    };
  }, [settings.primaryColor, settings.secondaryColor, settings.accentColor, settings.sidebarBackgroundColor, settings.customCSS]);

  return null;
};

export default DynamicStyles;
