import { useState, useEffect } from 'react';
import React from 'react';
import {
	PasswordStrengthIndicator,
	useAuthorizer,
} from '@luclu7/authorizer-react';
import type { UpdateProfileInput } from '@authorizerdev/authorizer-js';
import '../default.css';

interface InputDataEmailType {
	email: string | null;
}

interface PasswordDataType {
	oldPassword: string | null;
	password: string | null;
	confirmPassword: string | null;
}

export default function Dashboard() {
	const [loading, setLoading] = React.useState(false);
	const { user, token, config, setToken, authorizerRef } = useAuthorizer();

	const [passwordError, setPasswordError] = useState(``);
	const [emailError, setEmailError] = useState(``);
	const [successMessage, setSuccessMessage] = useState(``);
	const [formData, setFormData] = useState<InputDataEmailType>({
		email: null,
	});
	const [passwordData, setPasswordData] = useState<PasswordDataType>({
		oldPassword: null,
		password: null,
		confirmPassword: null,
	});

	const onLogout = async () => {
		setLoading(true);
		await authorizerRef.logout();
		setToken(null);
		setLoading(false);
	};

	const onInputChange = async (field: string, value: string) => {
		setFormData({ ...formData, [field]: value });
	};

	const onPasswordChange = async (field: string, value: string) => {
		setPasswordData({ ...passwordData, [field]: value });
	};

	const [errorDataEmail, setErrorDataEmail] = useState<InputDataEmailType>({
		email: null,
	});

	const [errorDataPassword, setErrorDataPassword] = useState<PasswordDataType>({
		oldPassword: null,
		password: null,
		confirmPassword: null,
	});
	const [disablePasswordChangeButton, setDisablePasswordChangeButton] =
		useState(false);

	useEffect(() => {
		if (formData.email === '') {
			setErrorDataEmail({ ...errorDataEmail, email: 'Email is required' });
		} else if (formData.email && !isValidEmail(formData.email)) {
			setErrorDataEmail({
				...errorDataEmail,
				email: 'Please enter valid email',
			});
		} else {
			setErrorDataEmail({ ...errorDataEmail, email: null });
		}
	}, [formData.email]);

	const onSubmitEmail = async (e: any) => {
		e.preventDefault();
		try {
			setLoading(true);
			const data: UpdateProfileInput = {
				email: formData.email || '',
			};
			const res = await authorizerRef.updateProfile(data, {
				Authorization: `Bearer ${token?.access_token}`,
			});

			if (res) {
				setLoading(false);
				setSuccessMessage(res.message || ``);
				// wait for 2 seconds then logout
				setTimeout(async () => {
					await onLogout();
				}, 2700);
			} else {
				setLoading(false);
				setEmailError(``);
			}
		} catch (err) {
			setLoading(false);
			setEmailError((err as Error).message.replace(`[GraphQL] `, ''));
			console.log('err', err);
		}
	};

	const onSubmitPassword = async (e: any) => {
		e.preventDefault();
		try {
			setLoading(true);
			const data: UpdateProfileInput = {
				old_password: passwordData.oldPassword || '',
				new_password: passwordData.password || '',
				confirm_new_password: passwordData.confirmPassword || '',
			};
			const res = await authorizerRef.updateProfile(data, {
				Authorization: `Bearer ${token?.access_token}`,
			});

			if (res) {
				setLoading(false);
				setSuccessMessage(res.message || ``);
				// wait for 2 seconds then logout
				setTimeout(async () => {
					await onLogout();
				}, 2700);
			} else {
				setLoading(false);
				setPasswordError(``);
			}
		} catch (err) {
			setLoading(false);
			console.log('err', err);
			setPasswordError((err as Error).message.replace(`[GraphQL] `, ''));
		}
	};

	if (successMessage) {
		return <p>{successMessage}</p>;
	}

	return (
		<div>
			<h1>Hey {user?.nickname} 👋</h1>

			<p>
				Your email address is{' '}
				<a href={`mailto:${user?.email}`} style={{ color: '#3B82F6' }}>
					{user?.email}
				</a>
			</p>
			{user?.email_verified ? (
				<p>Your email is already verified.</p>
			) : (
				<p>You didn't verify your email address yet.</p>
			)}

			<hr />
			{/* password change */}
			<form onSubmit={onSubmitPassword} name="authorizer-password-change-form">
				<h2>Change Password </h2>
				<div className={'styled-form-group'}>
					<label
						className={'form-input-label'}
						htmlFor="authorizer-sign-up-password"
					>
						<span>* </span>Current Password
					</label>
					<input
						name="oldPassword"
						id="authorizer-sign-up-password"
						className={`${'form-input-field'} ${
							errorDataPassword.oldPassword ? 'input-error-content' : ''
						}`}
						placeholder="********"
						type="password"
						value={passwordData.oldPassword || ''}
						onChange={(e) => onPasswordChange('oldPassword', e.target.value)}
					/>
					{errorDataPassword.oldPassword && (
						<div className={'form-input-error'}>
							{errorDataPassword.oldPassword}
						</div>
					)}
				</div>
				<div className={'styled-form-group'}>
					<label
						className={'form-input-label'}
						htmlFor="authorizer-sign-up-password"
					>
						<span>* </span>New Password
					</label>
					<input
						name="password"
						id="authorizer-sign-up-password"
						className={`${'form-input-field'} ${
							errorDataPassword.password ? 'input-error-content' : ''
						}`}
						placeholder="********"
						type="password"
						value={passwordData.password || ''}
						onChange={(e) => onPasswordChange('password', e.target.value)}
					/>
					{errorDataPassword.password && (
						<div className={'form-input-error'}>
							{errorDataPassword.password}
						</div>
					)}
				</div>
				<div className={'styled-form-group'}>
					<label
						className={'form-input-label'}
						htmlFor="authorizer-sign-up-confirm-password"
					>
						<span>* </span>Confirm New Password
					</label>
					<input
						name="confirmPassword"
						id="authorizer-sign-up-confirm-password"
						className={`${'form-input-field'} ${
							errorDataPassword.confirmPassword ? 'input-error-content' : ''
						}`}
						placeholder="********"
						type="password"
						value={passwordData.confirmPassword || ''}
						onChange={(e) =>
							onPasswordChange('confirmPassword', e.target.value)
						}
					/>
					{errorDataPassword.confirmPassword && (
						<div className={'form-input-error'}>
							{errorDataPassword.confirmPassword}
						</div>
					)}
				</div>
				{config.is_strong_password_enabled && (
					<>
						<PasswordStrengthIndicator
							value={passwordData.password || ''}
							setDisableButton={setDisablePasswordChangeButton}
						/>
						<br />
					</>
				)}
				<br />
				<button
					className={'styled-button'}
					type="submit"
					style={{
						width: '100%',
						backgroundColor:
							loading ||
							!!errorDataPassword.password ||
							!passwordData.password ||
							passwordData.password !== passwordData.confirmPassword ||
							disablePasswordChangeButton
								? 'var(--authorizer-primary-disabled-color)'
								: 'var(--authorizer-primary-color)',
						// : 'var(--authorizer-white-color)',
						color: 'var(--authorizer-white-color)',
						border: '0px',
					}}
					disabled={
						loading ||
						!!errorDataPassword.password ||
						!passwordData.password ||
						passwordData.password !== passwordData.confirmPassword ||
						disablePasswordChangeButton
					}
				>
					{loading ? `Processing ...` : `Change Password`}
				</button>

				{passwordError ? (
					<div
						style={{
							backgroundColor: 'var(--authorizer-danger-color)',
							borderRadius: 20,
							paddingLeft: 10,
							paddingTop: 2,
							paddingBottom: 2,
							marginTop: 10,
						}}
					>
						<h3 style={{ color: 'var(--authorizer-white-color)' }}>
							{passwordError}
						</h3>
					</div>
				) : null}
			</form>

			<br />
			<hr />
			<br />

			{/* email change */}
			<form onSubmit={onSubmitEmail} name="authorizer-sign-up-form">
				<h2>Change Email </h2>

				<div className={'styled-form-group'}>
					<label
						className={'form-input-label'}
						htmlFor="authorizer-change-email"
					>
						<span>* </span>New Email
					</label>
					<input
						name="email"
						id="authorizer-change-email"
						className={`form-input-field ${
							errorDataEmail.email ? 'input-error-content' : ''
						}`}
						placeholder="eg. foo@bar.com"
						type="email"
						value={formData.email || ''}
						onChange={(e) => onInputChange('email', e.target.value)}
					/>
					{errorDataEmail.email && (
						<div className={'form-input-error'}>{errorDataEmail.email}</div>
					)}
				</div>
				<button
					className={'styled-button'}
					type="submit"
					style={{
						width: '100%',
						backgroundColor:
							loading ||
							!!errorDataEmail.email ||
							!formData.email ||
							formData.email === user?.email
								? 'var(--authorizer-primary-disabled-color)'
								: 'var(--authorizer-primary-color)',
						// : 'var(--authorizer-white-color)',
						color: 'var(--authorizer-white-color)',
						border: '0px',
					}}
					disabled={
						loading ||
						!!errorDataEmail.email ||
						!formData.email ||
						formData.email === user?.email
					}
				>
					{loading ? `Processing ...` : `Change Email`}
				</button>

				{emailError ? (
					<div
						style={{
							backgroundColor: 'var(--authorizer-danger-color)',
							borderRadius: 20,
							paddingLeft: 10,
							paddingTop: 2,
							paddingBottom: 2,
							marginTop: 10,
						}}
					>
						<h3 style={{ color: 'var(--authorizer-white-color)' }}>
							{emailError}
						</h3>
					</div>
				) : null}
			</form>

			<br />
			{loading ? (
				<h3>Processing....</h3>
			) : (
				<h3
					style={{
						color: '#3B82F6',
						cursor: 'pointer',
					}}
					onClick={onLogout}
				>
					Logout
				</h3>
			)}
		</div>
	);
}

export const isValidEmail = (email: string): boolean => {
	const re =
		/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	return re.test(String(email.trim()).toLowerCase());
};
