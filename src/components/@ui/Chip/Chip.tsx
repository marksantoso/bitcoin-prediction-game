import React, { ReactElement } from 'react';
import styles from './Chip.module.css';

interface ChipProps {
  label: ReactElement;
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  size?: 'small' | 'medium' | 'large';
  className?: string;
  onDelete?: () => void;
  onClick?: () => void;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export const Chip: React.FC<ChipProps> = ({
  label,
  variant = 'default',
  size = 'medium',
  className = '',
  onClick,
  disabled = false,
  icon,
}) => {
  const chipClasses = [
    styles.chip,
    styles[variant],
    styles[size],
    onClick && !disabled ? styles.clickable : '',
    disabled ? styles.disabled : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const handleClick = () => {
    if (!disabled && onClick) {
      onClick();
    }
  };

  return (
    <div
      className={chipClasses}
      onClick={handleClick}
      aria-disabled={disabled}
    >
      {icon && <span className={styles.icon}>{icon}</span>}
      <span className={styles.label}>{label}</span>
    </div>
  );
};

export default Chip; 