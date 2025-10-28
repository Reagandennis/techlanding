export type BusinessVertical = 'education' | 'recruitment' | 'consulting' | 'development';

export interface NavigationItem {
  label: string;
  href: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface NavigationConfig {
  primary: NavigationItem[];
  secondary: NavigationItem[];
  verticals: NavigationItem[];
}

export interface BusinessVerticalInfo {
  id: BusinessVertical;
  title: string;
  description: string;
  primaryColor: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
}
