import React, { Fragment } from 'react';
import { AuthorizerResetPassword } from '@luclu7/authorizer-react';

export default function ResetPassword() {
	return (
		<Fragment>
			<h1 style={{ textAlign: 'center' }}>Reset Password</h1>
			<br />
			<AuthorizerResetPassword />
		</Fragment>
	);
}
