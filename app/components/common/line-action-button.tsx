import { FunctionComponent, ReactNode } from "react"

interface LineActionButtonProps {
    type?: 'submit' | 'reset' | 'button' | undefined
    sizeClassName?: string
    borderClassName?: string
    children: ReactNode
}

const LineActionButton: FunctionComponent<LineActionButtonProps> = ({ type, sizeClassName, borderClassName, children }) => (
    <div className={`relative h-12 shrink-0 ${sizeClassName || ""}`}>
        <button
            type={type}
            className={`h-full w-full flex items-center rounded-2xl shadow-md hover:shadow-lg border-2 hover:border-4 motion-safe:transition-all duration-75 bg-white active:bg-zinc-50 focus-visible:outline-blue-500 ${borderClassName || "border-zinc-300"}`}>
            <div className="flex flex-row justify-start items-center absolute left-[1vw] text-xl">
                {children}
            </div>
        </button>
    </div>
)

export default LineActionButton
