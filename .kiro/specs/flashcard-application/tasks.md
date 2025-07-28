# Implementation Plan

- [x] 1. Set up theme system infrastructure
  - Configure next-themes provider in the application layout
  - Create theme toggle component with sun/moon icons
  - Add theme-aware CSS variables and Tailwind dark mode classes
  - _Requirements: 10.1, 10.2, 10.3_

- [x] 2. Implement dark mode styling across components
- [x] 2.1 Update core UI components for dark mode
  - Add dark: variants to Button, Card, Input, and other base components
  - Ensure proper contrast ratios for accessibility compliance
  - Test component rendering in both light and dark themes
  - _Requirements: 10.4, 10.6_

- [x] 2.2 Update flashcard-specific components for dark mode
  - Apply dark mode styles to FlashcardReview, AddFlashcardForm, and EditFlashcardForm
  - Update CodeDisplay component to use appropriate dark theme for syntax highlighting
  - Ensure proper visibility of HTML content in both themes
  - _Requirements: 10.4, 10.5_

- [x] 2.3 Update layout and navigation components for dark mode
  - Apply dark mode styles to AppSidebar and main layout
  - Update StatsDashboard and ImportExportDialog components
  - Ensure consistent theming across all UI elements
  - _Requirements: 10.4, 10.5_

- [ ] 3. Integrate theme toggle into application header
  - Add theme toggle button to the application header
  - Implement smooth transitions between theme changes
  - Ensure keyboard accessibility for theme toggle
  - _Requirements: 10.5, 10.6_

- [x] 4. Implement cram mode state management
  - Add cramMode boolean state to useFlashcards hook
  - Create functions to toggle cram mode and get all cards for cram review
  - Implement session tracking for cram mode without affecting SuperMemo intervals
  - _Requirements: 9.1, 9.3_

- [x] 5. Create cram mode toggle component
- [x] 5.1 Build CramModeToggle component
  - Create toggle component with clear visual indicators
  - Add appropriate icons and labels for cram mode
  - Implement proper accessibility attributes
  - _Requirements: 9.4_

- [x] 5.2 Integrate cram mode toggle into review interface
  - Add cram mode toggle to the review tab interface
  - Position toggle appropriately in the UI layout
  - Ensure toggle state persists during review session
  - _Requirements: 9.1, 9.4_

- [x] 6. Enhance FlashcardReview component for cram mode
- [x] 6.1 Update review logic for cram mode
  - Modify card grading to skip SuperMemo updates in cram mode
  - Add visual indicators to distinguish cram mode from regular review
  - Update progress tracking to show all cards vs completed cards
  - _Requirements: 9.2, 9.3, 9.4_

- [x] 6.2 Implement cram mode card selection
  - Modify card filtering to include all cards when in cram mode
  - Update due cards logic to handle cram mode appropriately
  - Ensure proper card cycling through all deck cards
  - _Requirements: 9.1, 9.6_

- [x] 7. Add cram mode session tracking
  - Implement separate performance tracking for cram sessions
  - Create session statistics display for cram mode
  - Add session completion indicators and summary
  - _Requirements: 9.3_

- [ ] 8. Update UI messaging and empty states
- [ ] 8.1 Add cram mode specific messaging
  - Update empty state messages for cram mode when no cards exist
  - Add explanatory text about cram mode functionality
  - Ensure clear distinction between regular and cram mode states
  - _Requirements: 9.6_

- [ ] 8.2 Update statistics display for cram mode
  - Modify StatsDashboard to show cram mode indicators when active
  - Update card count displays to reflect cram mode behavior
  - Add visual cues for current review mode
  - _Requirements: 9.4_

- [ ] 9. Test theme system functionality
- [ ] 9.1 Test theme persistence and system detection
  - Verify theme preference is saved to localStorage
  - Test system theme detection on application load
  - Ensure theme persists across browser sessions
  - _Requirements: 10.2, 10.3_

- [ ] 9.2 Test theme toggle accessibility and transitions
  - Verify keyboard navigation works for theme toggle
  - Test smooth transitions between light and dark modes
  - Ensure proper focus management during theme changes
  - _Requirements: 10.5, 10.6_

- [ ] 10. Test cram mode functionality
- [ ] 10.1 Test cram mode card selection and review
  - Verify all cards are available for review in cram mode
  - Test that SuperMemo intervals are not updated during cram review
  - Ensure proper card cycling and session completion
  - _Requirements: 9.1, 9.2, 9.3_

- [ ] 10.2 Test cram mode UI and state management
  - Verify visual indicators properly distinguish cram mode
  - Test mode toggle functionality and state persistence
  - Ensure proper empty state handling in cram mode
  - _Requirements: 9.4, 9.5, 9.6_

- [ ] 11. Integration testing and polish
- [ ] 11.1 Test combined functionality
  - Verify theme system works properly with cram mode
  - Test all components render correctly in both themes and modes
  - Ensure no conflicts between new features and existing functionality
  - _Requirements: 9.1-9.6, 10.1-10.6_

- [ ] 11.2 Performance optimization and final polish
  - Optimize theme switching performance
  - Ensure cram mode doesn't impact application performance
  - Add any missing animations or visual polish
  - _Requirements: 10.5_