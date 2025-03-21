import { library } from '@fortawesome/fontawesome-svg-core';
import { faHome, faNewspaper, faKitMedical, faChartLine, faGear, faChevronRight } from '@fortawesome/free-solid-svg-icons';

// Initialize the Font Awesome library with the icons we need
library.add(
  faHome,       // For Home tab
  faNewspaper,  // For Community tab
  faKitMedical, // For Treatments tab
  faChartLine,  // For Metrics tab
  faGear,       // For Settings tab
  faChevronRight // For Collapsible component
); 