import React from 'react';
import { Button as MuiButton, CircularProgress } from '@mui/material';
import clsx from 'clsx';
import styles from './Button.module.css';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outlined' | 'ghost' | 'success' | 'warning' | 'error';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  fullWidth = false,
  icon,
  iconPosition = 'left',
  className = '',
  onClick,
  type = 'button',
}) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!loading && !disabled && onClick) {
      onClick(e);
    }
  };

  // Map custom variants to MUI variants or use default
  const getMuiVariant = () => {
    switch (variant) {
      case 'outlined':
        return 'outlined';
      case 'ghost':
        return 'text';
      default:
        return 'contained';
    }
  };

  return (
    <MuiButton
      className={clsx(
        styles.button,
        styles[variant],
        styles[size],
        loading ? styles.loading : '',
        fullWidth ? styles.fullWidth : '',
        className // className comes last = highest priority
      )}
      onClick={handleClick}
      disabled={disabled || loading}
      fullWidth={fullWidth}
      size={size === 'large' ? 'large' : size === 'small' ? 'small' : 'medium'}
      variant={getMuiVariant()}
      type={type}
      startIcon={!loading && icon && iconPosition === 'left' ? icon : undefined}
      endIcon={!loading && icon && iconPosition === 'right' ? icon : undefined}
    >
      {loading && (
        <CircularProgress 
          size={32} 
          sx={{ color: 'white' }}
        />
      )}
      {!loading && <span className={styles.content}>{children}</span>}
    </MuiButton>
  );
};

export default Button;