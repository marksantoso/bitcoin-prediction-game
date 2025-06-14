import React, { ReactElement } from 'react';
import { CardHeader as MuiCardHeader } from '@mui/material';
import clsx from 'clsx';
import styles from './CardHeader.module.css';

interface CardHeaderProps {
	title: ReactElement | string;
	subheader?: ReactElement | string;
	className?: string;
}

const CardHeader: React.FC<CardHeaderProps> = ({ title, subheader, className }) => {
	return (
		<div className={styles.cardHeader}>
			<MuiCardHeader
				title={title}
				subheader={subheader}
				className={clsx(
					styles.cardHeader,
					styles.h1, // For title styling
					styles.h2, // For subheader styling
					className
				)}
				titleTypographyProps={{
					className: styles.h1
				}}
				subheaderTypographyProps={{
					className: styles.h2
				}}
			/>
		</div>
	);
};

export default CardHeader;