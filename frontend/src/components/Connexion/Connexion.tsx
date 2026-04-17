import React, { useState } from "react";
import "./Connexion.css";
import FormEmail from "../FormEmail/FormEmail";
import FormPassword from "../FormPassword/FormPassword";
import Bouton from "../Bouton/Bouton";
import { useApi } from "../../hooks/useApi";

interface ConnexionProps {
	onLoginSuccess: (cardId: string) => void;
}

const Connexion = ({ onLoginSuccess }: ConnexionProps) => {
	const { getApiUrl, getHeaders } = useApi();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");

	const hashPassword = async (passwordValue: string): Promise<string> => {
		const encoder = new TextEncoder();
		const data = encoder.encode(passwordValue);
		const hashBuffer = await crypto.subtle.digest("SHA-256", data);
		const hashArray = Array.from(new Uint8Array(hashBuffer));
		return hashArray.map((byte) => byte.toString(16).padStart(2, "0")).join("");
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
			setErrorMessage("Connexion échouee. Verifiez vos identifiants.");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="connexion_container">
            <h3> Connexion manuelle :</h3>
            <br />
			<form className="connexion_form" onSubmit={handleSubmit}>
				<FormEmail
					label="Email"
					value={email}
					onChange={(value) => {
						setEmail(value);
						if (errorMessage) {
							setErrorMessage("");
						}
					}}
				/>
				<FormPassword
					label="Mot de passe"
					value={password}
					onChange={(value) => {
						setPassword(value);
						if (errorMessage) {
							setErrorMessage("");
						}
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
			</form>
		</div>
	);
};

export default Connexion;

