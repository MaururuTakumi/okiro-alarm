// Minimal setup - mock only what's needed for unit tests

// Mock react-native Platform
jest.mock('react-native', () => ({
  Platform: { OS: 'ios' },
  Vibration: { vibrate: jest.fn() },
  StyleSheet: { create: (s) => s, hairlineWidth: 0.5 },
}));

// Mock expo-notifications
jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  requestPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  scheduleNotificationAsync: jest.fn(() => Promise.resolve('mock-id')),
  cancelScheduledNotificationAsync: jest.fn(() => Promise.resolve()),
  getAllScheduledNotificationsAsync: jest.fn(() => Promise.resolve([])),
  addNotificationResponseReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  SchedulableTriggerInputTypes: {
    DAILY: 'daily',
    WEEKLY: 'weekly',
    TIME_INTERVAL: 'timeInterval',
  },
}));

// Mock react-native-purchases (RevenueCat)
jest.mock('react-native-purchases', () => ({
  __esModule: true,
  default: {
    configure: jest.fn(),
    setLogLevel: jest.fn(),
    getOfferings: jest.fn(() => Promise.resolve({ current: { availablePackages: [] } })),
    getCustomerInfo: jest.fn(() => Promise.resolve({ entitlements: { active: {} } })),
    purchasePackage: jest.fn(() => Promise.resolve({ customerInfo: { entitlements: { active: {} } } })),
    purchaseStoreProduct: jest.fn(() => Promise.resolve({ customerInfo: { entitlements: { active: {} } } })),
    restorePurchases: jest.fn(() => Promise.resolve({ entitlements: { active: {} } })),
    getProducts: jest.fn(() => Promise.resolve([])),
  },
  LOG_LEVEL: { DEBUG: 'DEBUG' },
}));

// Mock expo-sensors
jest.mock('expo-sensors', () => ({
  Accelerometer: {
    addListener: jest.fn(() => ({ remove: jest.fn() })),
    setUpdateInterval: jest.fn(),
  },
}));
