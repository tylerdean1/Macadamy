import React from 'react';
import {
  MapPin,
  ClipboardList,
  CalendarCheck,
  Truck,
  Archive,
  TrendingUp,
} from 'lucide-react';

export interface LandingFeature {
  title: string;
  description: string;
  icon: React.ReactNode;
  features: string[];
}

export const FEATURE_SECTIONS: LandingFeature[] = [
  {
    title: 'Field-to-Estimate Conversion',
    description: 'Capture site measurements and instantly generate contract-ready estimates.',
    icon: <MapPin className="w-8 h-8 text-primary" />,
    features: [
      'Mobile measurement capture',
      'Auto-calculated volumes & areas',
      'Instant estimate previews',
    ],
  },
  {
    title: 'Structured WBS & Bidding',
    description: 'Build work breakdown structures and prepare multi-vendor bids in one flow.',
    icon: <ClipboardList className="w-8 h-8 text-primary" />,
    features: [
      'Custom WBS templates',
      'Line-item cost breakdowns',
      'Bid comparison tools',
    ],
  },
  {
    title: 'Budget & Bid Management',
    description: 'Create budgets, send RFPs, and track approvals with automated workflows.',
    icon: <CalendarCheck className="w-8 h-8 text-primary" />,
    features: [
      'Auto-generated budget summaries',
      'Bid request notifications',
      'Approval reminders',
    ],
  },
  {
    title: 'Crew & Equipment Tracking',
    description: 'Assign tasks, monitor crews, and log equipment usage in real time.',
    icon: <Truck className="w-8 h-8 text-primary" />,
    features: [
      'GPS-based crew locations',
      'Equipment usage logs',
      'Daily dispatch reports',
    ],
  },
  {
    title: 'Inspections & Audit Archiving',
    description: 'Manage quality checks and archive full project records for audits.',
    icon: <Archive className="w-8 h-8 text-primary" />,
    features: [
      'Custom inspection templates',
      'Photo & issue tracking',
      'Audit-ready archives',
    ],
  },
  {
    title: 'Real-Time Insights',
    description: 'Live dashboards, role-based access, and map overlays keep you in sync.',
    icon: <TrendingUp className="w-8 h-8 text-primary" />,
    features: [
      'Live project dashboards',
      'Role-based permissions',
      'Geospatial mapping',
    ],
  },
];
