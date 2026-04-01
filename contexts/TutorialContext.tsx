'use client';

import React, { createContext, useContext, useEffect } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

interface TutorialContextType {
  startTutorial: () => void;
}

const TutorialContext = createContext<TutorialContextType | undefined>(undefined);

export function useTutorial() {
  const context = useContext(TutorialContext);
  if (!context) {
    throw new Error('useTutorial must be used within a TutorialProvider');
  }
  return context;
}

export function TutorialProvider({ children }: { children: React.ReactNode }) {
  const startTutorial = () => {
    const isMobile = window.innerWidth < 768;
    
    const driverObj = driver({
      showProgress: true,
      steps: [
        {
          popover: {
            title: 'Welcome to Stocked!',
            description: 'Your personal meal planning and cookbook application. Let\'s take a quick tour to show you around.',
          }
        },
        {
          element: isMobile ? '#tour-recipes-mobile' : '#tour-dashboard',
          popover: {
            title: 'Dashboard',
            description: 'View, search, and manage all your recipes here. You can also add new recipes from the dashboard.',
            side: isMobile ? 'top' : 'bottom',
            align: 'start'
          }
        },
        {
          element: isMobile ? '#tour-plan-mobile' : '#tour-planner',
          popover: {
            title: 'Planner',
            description: 'Plan your meals for the current and next week. Drag and drop recipes into meal slots!',
            side: isMobile ? 'top' : 'bottom',
            align: 'start'
          }
        },
        {
          element: isMobile ? '#tour-tools-mobile' : '#tour-conversions',
          popover: {
            title: 'Tools',
            description: 'Use our handy conversion tools to easily convert measurements while cooking.',
            side: isMobile ? 'top' : 'bottom',
            align: 'start'
          }
        },
        ...(!isMobile ? [{
          element: '#tour-ask-chef',
          popover: {
            title: 'Ask Chef',
            description: 'Need cooking advice or recipe ideas? Ask our AI Chef for help anytime.',
            side: 'bottom' as const,
            align: 'start' as const
          }
        }] : []),
        {
          element: '#tour-settings',
          popover: {
            title: 'Settings',
            description: 'Access your profile, toggle dark mode, or restart this tutorial from the settings menu.',
            side: isMobile ? 'bottom' : 'bottom',
            align: 'end'
          }
        }
      ],
      onDestroyStarted: () => {
        driverObj.destroy();
        localStorage.setItem('stocked_tutorial_seen', 'true');
      },
    });

    driverObj.drive();
  };

  useEffect(() => {
    // Check if the user has seen the tutorial before
    const hasSeenTutorial = localStorage.getItem('stocked_tutorial_seen');
    if (!hasSeenTutorial) {
      // Small delay to ensure the UI is loaded
      const timer = setTimeout(() => {
        startTutorial();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <TutorialContext.Provider value={{ startTutorial }}>
      {children}
    </TutorialContext.Provider>
  );
}

