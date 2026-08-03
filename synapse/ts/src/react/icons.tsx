import * as React from "react";

type SvgIconProps = React.SVGProps<SVGSVGElement>;

function SvgIcon({
  width = 18,
  height = 18,
  children,
  ...props
}: SvgIconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {children}
    </svg>
  );
}

export function IconToday(props: SvgIconProps) {
  return (
    <SvgIcon {...props}>
      <circle cx="10" cy="10" r="7" />
      <path d="M10 7v3l2 2" />
    </SvgIcon>
  );
}

export function IconDashboard(props: SvgIconProps) {
  return (
    <SvgIcon {...props}>
      <rect x="3" y="3" width="6" height="7" rx="1" />
      <rect x="11" y="3" width="6" height="4" rx="1" />
      <rect x="11" y="9" width="6" height="8" rx="1" />
      <rect x="3" y="12" width="6" height="5" rx="1" />
    </SvgIcon>
  );
}

export function IconTasks(props: SvgIconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M5 10l3 3 7-7" />
      <rect x="3" y="3" width="14" height="14" rx="2" />
    </SvgIcon>
  );
}

export function IconUseCases(props: SvgIconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M4 4h12a1 1 0 011 1v10a1 1 0 01-1 1H4a1 1 0 01-1-1V5a1 1 0 011-1z" />
      <path d="M7 8h6M7 11h4" />
      <circle cx="14.5" cy="14.5" r="2.5" fill="none" />
      <path d="M13.5 14.5h2M14.5 13.5v2" />
    </SvgIcon>
  );
}

export function IconTags(props: SvgIconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M4 4h12a1 1 0 011 1v2H3V5a1 1 0 011-1z" />
      <rect x="3" y="7" width="14" height="9" rx="1" />
      <path d="M7 11h6M7 13.5h4" />
      <circle cx="16" cy="5" r="1.5" fill="currentColor" />
    </SvgIcon>
  );
}

export function IconChat(props: SvgIconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M3 5a2 2 0 012-2h10a2 2 0 012 2v7a2 2 0 01-2 2H9l-4 3v-3H5a2 2 0 01-2-2V5z" />
      <path d="M7 7h6M7 10h4" />
    </SvgIcon>
  );
}

export function IconAgents(props: SvgIconProps) {
  return (
    <SvgIcon {...props}>
      <rect x="4" y="5" width="12" height="11" rx="2" />
      <circle cx="10" cy="3" r="1" />
      <path d="M10 4v2" />
      <circle cx="8" cy="10" r="0.8" fill="currentColor" />
      <circle cx="12" cy="10" r="0.8" fill="currentColor" />
      <path d="M8 13h4" />
    </SvgIcon>
  );
}

export function IconTools(props: SvgIconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M14.5 3a3 3 0 00-3 3v1.5l-8 8a1.5 1.5 0 002 2l8-8H15a3 3 0 100-6z" />
    </SvgIcon>
  );
}

export function IconSkills(props: SvgIconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M4 4h9l3 3v9a1 1 0 01-1 1H4a1 1 0 01-1-1V5a1 1 0 011-1z" />
      <path d="M13 4v3h3" />
      <path d="M6 10h7M6 13h5" />
    </SvgIcon>
  );
}

export function IconCurator(props: SvgIconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M10 3l1.5 4.5H16l-3.5 2.5 1.5 4.5L10 12l-4 2.5 1.5-4.5L4 7.5h4.5z" />
    </SvgIcon>
  );
}

export function IconConnections(props: SvgIconProps) {
  return (
    <SvgIcon {...props}>
      <circle cx="5" cy="10" r="3" />
      <circle cx="15" cy="5" r="2.5" />
      <circle cx="15" cy="15" r="2.5" />
      <path d="M7.8 8.8l4.7-2.6M7.8 11.2l4.7 2.6" />
    </SvgIcon>
  );
}

export function IconModels(props: SvgIconProps) {
  return (
    <SvgIcon {...props}>
      <rect x="4" y="4" width="12" height="12" rx="2" />
      <rect x="7" y="7" width="6" height="6" rx="1" />
      <path d="M4 8h-2M16 8h2M8 4v-2M12 18v-2" />
    </SvgIcon>
  );
}

export function IconMcpServers(props: SvgIconProps) {
  return (
    <SvgIcon {...props}>
      <rect x="3" y="4" width="14" height="5" rx="1" />
      <rect x="3" y="11" width="14" height="5" rx="1" />
      <circle cx="6" cy="6.5" r="0.7" fill="currentColor" />
      <circle cx="6" cy="13.5" r="0.7" fill="currentColor" />
    </SvgIcon>
  );
}

export function IconExecutions(props: SvgIconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M3 10l3 3 4-5 3 3 4-4" />
      <path d="M3 16h14" />
    </SvgIcon>
  );
}

export function IconKpis(props: SvgIconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M4 16V9M8 16V5M12 16v-6M16 16V7" />
      <path d="M3 17h14" />
    </SvgIcon>
  );
}

export function IconNotifications(props: SvgIconProps) {
  return (
    <SvgIcon {...props} strokeWidth={1.6}>
      <path d="M10 2a6 6 0 0 1 6 6c0 3.5 1.5 5 1.5 5H2.5S4 11.5 4 8a6 6 0 0 1 6-6z" />
      <path d="M8.5 17a1.5 1.5 0 0 0 3 0" />
    </SvgIcon>
  );
}

export function IconInfra(props: SvgIconProps) {
  return (
    <SvgIcon {...props}>
      <rect x="3" y="4" width="14" height="5" rx="1" />
      <rect x="3" y="11" width="14" height="5" rx="1" />
      <circle cx="6" cy="6.5" r="0.7" fill="currentColor" />
      <circle cx="6" cy="13.5" r="0.7" fill="currentColor" />
      <path d="M10 6.5h5M10 13.5h5" />
    </SvgIcon>
  );
}

export function IconObservability(props: SvgIconProps) {
  return (
    <SvgIcon {...props}>
      <circle cx="10" cy="10" r="7" />
      <path d="M10 6v4l3 2" />
    </SvgIcon>
  );
}

export function IconOrganization(props: SvgIconProps) {
  return (
    <SvgIcon {...props}>
      <circle cx="10" cy="5" r="2.5" />
      <circle cx="4" cy="14" r="2" />
      <circle cx="16" cy="14" r="2" />
      <path d="M10 7.5v3M10 10.5l-4 2M10 10.5l4 2" />
    </SvgIcon>
  );
}

export function IconBrain(props: SvgIconProps) {
  return (
    <SvgIcon {...props} width={16} height={16} strokeWidth={1.6}>
      <path d="M10 3C6 3 4 6 5 9c-1 1 0 3 2 3 0 2 4 2 4 0 2 0 3-2 2-3 1-3-1-6-3-6Z" />
      <circle cx="8" cy="8" r="0.7" fill="currentColor" />
      <circle cx="12" cy="9" r="0.7" fill="currentColor" />
    </SvgIcon>
  );
}

export function IconChevronLeft(props: SvgIconProps) {
  return (
    <SvgIcon {...props} width={16} height={16} strokeWidth={2}>
      <path d="M13 15l-5-5 5-5" />
    </SvgIcon>
  );
}

export function IconChevronRight(props: SvgIconProps) {
  return (
    <SvgIcon {...props} width={12} height={12} strokeWidth={2}>
      <path d="M7 5l5 5-5 5" />
    </SvgIcon>
  );
}

export function IconHamburger(props: SvgIconProps) {
  return (
    <SvgIcon {...props} width={18} height={18} strokeWidth={1.8}>
      <path d="M3 5h14M3 10h14M3 15h14" />
    </SvgIcon>
  );
}

export function IconSearch(props: SvgIconProps) {
  return (
    <SvgIcon {...props} width={15} height={15} strokeWidth={1.8}>
      <circle cx="8.5" cy="8.5" r="5.5" />
      <path d="M13 13l3.5 3.5" />
    </SvgIcon>
  );
}

export function IconSun(props: SvgIconProps) {
  return (
    <SvgIcon {...props} width={17} height={17} strokeWidth={1.8}>
      <circle cx="10" cy="10" r="4" />
      <path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.2 4.2l1.4 1.4M14.4 14.4l1.4 1.4M4.2 15.8l1.4-1.4M14.4 5.6l1.4-1.4" />
    </SvgIcon>
  );
}

export function IconMoon(props: SvgIconProps) {
  return (
    <SvgIcon {...props} width={17} height={17} strokeWidth={1.8}>
      <path d="M17.5 12A7.5 7.5 0 018 2.5a7.5 7.5 0 100 15 7.5 7.5 0 009.5-5.5z" />
    </SvgIcon>
  );
}
