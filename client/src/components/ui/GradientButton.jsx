import { Link } from 'react-router-dom';

/** One button for every call-to-action. Renders a router Link, anchor or button. */
export default function GradientButton({ to, href, variant = 'solid', className = '', children, ...props }) {
  const cls = `${variant === 'solid' ? 'btn-gradient' : 'btn-ghost'} ${className}`;
  if (to) return <Link to={to} className={cls} {...props}>{children}</Link>;
  if (href) return <a href={href} className={cls} {...props}>{children}</a>;
  return <button type="button" className={cls} {...props}>{children}</button>;
}
