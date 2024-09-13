/** @type {import('next').NextConfig} */
const nextConfig = {
	webpack: (config, { isServer }) => {
		// Externalize the 'onnxruntime-node' module to avoid Webpack bundling it
		if (isServer) {
			config.externals = config.externals || [];
			config.externals.push({
				"onnxruntime-node": "commonjs onnxruntime-node",
			});
		}
		return config;
	},
};

export default nextConfig;
