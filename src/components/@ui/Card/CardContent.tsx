import React from 'react';
import { CardContent as MuiCardContent } from '@mui/material';
import clsx from 'clsx';
import styles from './CardContent.module.css';

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'small' | 'medium' | 'large';
  spacing?: 'none' | 'small' | 'medium' | 'large';
  align?: 'left' | 'center' | 'right';
  as?: 'div' | 'section' | 'article' | 'main';
}

export const CardContent: React.FC<CardContentProps> = ({
  children,
  className = '',
  padding = 'medium',
  spacing = 'small',
  align = 'left',
  as: Component = 'div',
}) => {
  return (
    <MuiCardContent
      component={Component}
      className={clsx(
        styles.cardContent,
        styles[`padding-${padding}`],
        styles[`spacing-${spacing}`],
        styles[`align-${align}`],
        className // className comes last = highest priority
      )}
    >
      {children}
    </MuiCardContent>
  );
};

export default CardContent;