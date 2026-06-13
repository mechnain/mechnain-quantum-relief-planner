interface Props {
  kind?: 'warn' | 'error' | 'info';
  children: React.ReactNode;
}

export function WarningBanner({ kind = 'warn', children }: Props) {
  const icon = kind === 'error' ? '✕' : kind === 'warn' ? '!' : 'i';
  return (
    <div className={`banner banner-${kind}`} role={kind === 'info' ? 'note' : 'alert'}>
      <span className="banner-icon" aria-hidden="true">
        [{icon}]
      </span>
      <div>{children}</div>
    </div>
  );
}
