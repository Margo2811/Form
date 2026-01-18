import { useState, useRef } from 'react';
import * as yup from 'yup';
import styles from './App.module.css';

const initialState = {
	email: '',
	password: '',
	repeatPassword: '',
};

const useStore = () => {
	const [state, setState] = useState(initialState);

	return {
		getState: () => state,
		updateState: (fieldName, newValue) => {
			setState({ ...state, [fieldName]: newValue });
		},
	};
};

const sendData = (formData) => {
	console.log(formData);
};

const emailScheme = yup.string().email('Некорректный email');

const passwordChangeScheme = yup
	.string()
	.matches(/^[\w_]*$/, 'Допустимые символы - буквы, цифры и нижнее подчеркивание.')
	.max(20, 'Должно быть не более 20 символов.');

const passwordBlurScheme = yup.string().min(3, 'Должно быть не менее 3 символов.');

const repeatPasswordScheme = yup
	.string()
	.oneOf([yup.ref('password')], 'Пароли не совпадают');

const validateAndGetErrorMessage = (scheme, value) => {
	let errorMessage = null;

	try {
		scheme.validateSync(value, { abortEarly: false });
	} catch ({ errors }) {
		errorMessage = errors.join('\n');
	}
	return errorMessage;
};

export const App = () => {
	const { getState, updateState } = useStore();
	const [emailError, setEmailError] = useState(null);
	const [passwordError, setPasswordError] = useState(null);
	const [repeatPasswordError, setRepeatPasswordError] = useState(null);
	const submitButtonRef = useRef(null);

	const { email, password, repeatPassword } = getState();

	const onEmailChange = ({ target }) => {
		updateState('email', target.value);
		const error = validateAndGetErrorMessage(emailScheme, target.value);
		setEmailError(error);
	};

	const onPasswordChange = ({ target }) => {
		updateState('password', target.value);
		const error = validateAndGetErrorMessage(passwordChangeScheme, target.value);
		setPasswordError(error);

		if (target.value.length === 20) {
			submitButtonRef.current.focus();
		}
	};

	const onPasswordBlur = () => {
		const error = validateAndGetErrorMessage(passwordBlurScheme, password);
		setPasswordError(error);
	};

	const onRepeatPasswordChange = ({ target }) => {
		updateState('repeatPassword', target.value);

		const schema = yup.object().shape({
			password: yup.string().required(),
			repeatPassword: repeatPasswordScheme,
		});

		try {
			schema.validateSync({
				password: password,
				repeatPassword: target.value,
			});
			setRepeatPasswordError(null);
		} catch (err) {
			setRepeatPasswordError(err.errors.join('\n'));
		}
	};

	const onSubmit = (event) => {
		event.preventDefault();

		const emailErr = validateAndGetErrorMessage(emailScheme, email);
		const passwordErr = validateAndGetErrorMessage(passwordBlurScheme, password);

		const repeatSchema = yup.object().shape({
			password: yup.string().required(),
			repeatPassword: repeatPasswordScheme,
		});

		let repeatErr = null;
		try {
			repeatSchema.validateSync({ password, repeatPassword });
		} catch ({ errors }) {
			repeatErr = errors.join('\n');
		}

		setEmailError(emailErr);
		setPasswordError(passwordErr);
		setRepeatPasswordError(repeatErr);

		if (!emailErr && !passwordErr && !repeatErr) {
			sendData(getState());
		}
	};

	return (
		<div className={styles.App}>
			<form onSubmit={onSubmit}>
				<input
					type="email"
					name="email"
					value={email}
					placeholder="Email"
					onChange={onEmailChange}
				/>
				{emailError && <div className={styles.errorLabel}>{emailError}</div>}

				<input
					type="password"
					name="password"
					value={password}
					placeholder="Пароль"
					onChange={onPasswordChange}
					onBlur={onPasswordBlur}
				/>
				{passwordError && (
					<div className={styles.errorLabel}>{passwordError}</div>
				)}

				<input
					type="password"
					name="repeatPassword"
					value={repeatPassword}
					placeholder="Повтор пароля"
					onChange={onRepeatPasswordChange}
				/>
				{repeatPasswordError && (
					<div className={styles.errorLabel}>{repeatPasswordError}</div>
				)}

				<button
					ref={submitButtonRef}
					type="submit"
					disabled={emailError || passwordError || repeatPasswordError}
				>
					Зарегистрироваться
				</button>
			</form>
		</div>
	);
};
