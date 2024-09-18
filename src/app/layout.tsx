import type { Metadata } from "next";
import { Open_Sans, Poppins } from "next/font/google";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { Toaster } from "sonner";
import "./globals.css";
config.autoAddCss = false;

const openSans = Open_Sans({
	weight: ["300", "400", "500", "600"],
	subsets: ["latin"],
	display: "swap",
});

const poppins = Poppins({
	weight: ["100", "200", "300", "400", "500", "600", "700"],
	subsets: ["latin"],
	display: "swap",
});

export const metadata: Metadata = {
	title: "Tanslingo",
	description: "Record,Transcribe,Translate",
	icons: [
		{
			url: "/favicon.ico",
			href: "/favicon.ico",
		},
	],
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={`${openSans.className} ${poppins.className} antialiased`}>
				<Toaster />
				{children}
			</body>
		</html>
	);
}
