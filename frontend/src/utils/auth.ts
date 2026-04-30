const ALLOWED_SCHOOL_EMAIL_DOMAINS = ["@devinci.fr", "@edu.devinci.fr"] as const;

export const isSchoolEmail = (emailValue: string): boolean => {
    const normalizedEmail = emailValue.trim().toLowerCase();
    return ALLOWED_SCHOOL_EMAIL_DOMAINS.some((domain) => normalizedEmail.endsWith(domain));
};

export const hashPassword = async (passwordValue: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(passwordValue);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hashBuffer))
        .map((byte) => byte.toString(16).padStart(2, "0"))
        .join("");
};
