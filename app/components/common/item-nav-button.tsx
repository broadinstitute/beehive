import { NavLink } from '@remix-run/react';
import { FunctionComponent, ReactNode } from 'react';

interface ItemNavButtonProps {
    to: string
    className: string
    children: ReactNode
}

export const ItemNavButton: FunctionComponent<ItemNavButtonProps> = ({ to, className, children }) =>
    <NavLink
        to={to}
        className={`bg-white active:bg-zinc-50 shrink-0 flex items-center justify-center rounded-2xl shadow-lg hover:shadow-xl border-2 hover:border-4 transition-all duration-75 ${className}`}
    >
        {children}
    </NavLink>

export default ItemNavButton
