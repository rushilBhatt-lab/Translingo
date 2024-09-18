module.exports = {
	extends: ["next/core-web-vitals", "next/typescript"],
	rules: {
		"@typescript-eslint/no-explicit-any": "off",
		"@typescript-eslint/explicit-module-boundary-types": "off",
		"@typescript-eslint/no-empty-function": "off",
		"@typescript-eslint/ban-types": "off",
		"@typescript-eslint/ban-ts-comment": "off",
	},
};
