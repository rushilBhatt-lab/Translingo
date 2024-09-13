import Icon from "@/app/Icon/Icon";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

const Header = () => {
	return (
		<header className="flex items-center justify-between gap-4 p-4">
			<h1 className="font-medium">Translingo</h1>
			<button className="flex items-center gap-2 specialBtn px-3 py-2 rounded-lg text-sm">
				<p>New</p>
				<Icon icon={faPlus} className="fa-solid fa-plus" />
			</button>
		</header>
	);
};

export default Header;
