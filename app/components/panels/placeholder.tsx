import { FunctionComponent, ReactNode } from "react"

interface PlaceholderPanelProps {
    title?: string | undefined
    children: ReactNode
}

const PlaceholderPanel: FunctionComponent<PlaceholderPanelProps> = ({ title, children }) =>
    <div className="m-auto flex flex-col items-center w-[33vw] text-center font-light space-y-2 p-4">
        <h1 className="text-5xl font-medium">{title}</h1>
        {children}
    </div>

export default PlaceholderPanel