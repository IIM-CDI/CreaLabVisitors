import React, { useState } from "react";
import "./Connexion.css";
import FormEmail from "../FormEmail/FormEmail";
import FormPassword from "../FormPassword/FormPassword";
import Bouton from "../Bouton/Bouton";
import { useApi } from "../../hooks/useApi";
import { hashPassword } from "../../utils/auth";

interface ConnexionProps {
	onLoginSuccess: (cardId: string) => void;
	scannedCardId?: string | null;
	onBack?: () => void;
}

const Connexion = ({ onLoginSuccess, scannedCardId, onBack }: ConnexionProps) => {
	const { getApiUrl, getHeaders } = useApi();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");

	const clearError = () => {
		if (errorMessage) {
			setErrorMessage("");
		}
	};

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();
		setIsLoading(true);
		setErrorMessage("");

		try {
			const apiUrl = getApiUrl();
			const headers = getHeaders();
			const hashedPassword = await hashPassword(password);

			const response = await fetch(`${apiUrl}/login`, {
				method: "POST",
				headers,
				body: JSON.stringify({
					email: String(email),
					password: hashedPassword,
					scanned_card_id: scannedCardId || null,
				}),
			});

			const data = await response.json();

			if (!response.ok || !data?.authenticated || !data?.card_id) {
				throw new Error(data?.detail || "Identifiants invalides");
			}

			setEmail("");
			setPassword("");
			setErrorMessage("");
			onLoginSuccess(data.card_id);
		} catch (error) {
			console.error("Error during login:", error);
			if (error instanceof Error && error.message) {
				setErrorMessage(error.message);
			} else {
				setErrorMessage("Connexion échouee. Verifiez vos identifiants.");
			}
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="connexion_container">
			<h2>{scannedCardId ? "Connexion et association de carte" : "Connexion manuelle"}</h2>
			{scannedCardId && <p className="connexion_info">Carte scannée : {scannedCardId}</p>}
			<form className="connexion_form" onSubmit={handleSubmit}>
				<FormEmail
					label="Email"
					value={email}
					onChange={(value) => {
						setEmail(value);
						clearError();
					}}
				/>
				<FormPassword
					label="Mot de passe"
					value={password}
					onChange={(value) => {
						setPassword(value);
						clearError();
					}}
					placeholder="mot de passe"
				/>
				{errorMessage && <p className="connexion_error">{errorMessage}</p>}
				<Bouton
					type="submit"
					component_type="primary"
					label={isLoading ? "Connexion..." : "Se connecter"}
					disabled={isLoading}
				/>
				{onBack && (
					<Bouton
						type="button"
						component_type="secondary"
						label="Retour"
						onClick={onBack}
						disabled={isLoading}
					/>
				)}
			</form>
		</div>
	);
};

export default Connexion;

