import { Popover, PopoverTrigger, PopoverContent } from "@radix-ui/react-popover";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import "./style.css";
const DropdownBox = ({
	title,
	titleExtra,
	icon,
	children,
	options = {
		align: "end",
		side: "bottom",
		contentClassName: "filter-dropdown-box",
		triggerClassName: "filter-dropdown",
		alignOffset: 0,
		sideOffset: 10,
	},
}) => {
	return (
		<Popover>
			<PopoverTrigger asChild>
				<div className={options?.triggerClassName}>
					<button type="button">
						<FontAwesomeIcon icon={icon} /> {title} {!!titleExtra && <span>{titleExtra}</span>}
					</button>
				</div>
			</PopoverTrigger>

			<PopoverContent asChild align={options?.align} side={options?.side} avoidCollisions={false} alignOffset={options.alignOffset} sideOffset={options.sideOffset}>
				<div className={options?.contentClassName}>{children}</div>
			</PopoverContent>
		</Popover>
	);
};

export default DropdownBox;
