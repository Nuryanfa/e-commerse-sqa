export default function PageWrapper({ children, className = '' }) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}
