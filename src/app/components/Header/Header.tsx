import Icon from "@/app/Icon/Icon";
import { faGithub } from "@fortawesome/free-brands-svg-icons";
import { faRecordVinyl } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";

const Header = () => {
	return (
		<header className="flex rounded-lg items-center text-base-content max-w-xl mx-auto bg-slate-100 w-[50rem] my-4 px-4 md:pt-4 justify-between  gap-4 p-4 ">
			<Icon icon={faRecordVinyl} className="font-bold text-xl" />
			<h1 className="font-bold text-xl">Translingo</h1>
			<Link
				className="flex items-center gap-2 specialBtn px-3 py-2 rounded-lg text-sm"
				href="https://github.com/rushilBhatt-lab"
				target="_blank"
			>
				<Icon icon={faGithub} className="fa-solid fa-github" />
			</Link>
		</header>
	);
};

export default Header;
