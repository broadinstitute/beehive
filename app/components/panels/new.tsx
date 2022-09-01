import { Form } from "@remix-run/react"
import { FunctionComponent, ReactNode } from "react"
import { AuthenticityTokenInput } from "remix-utils"
import LineActionButton from "../common/line-action-button"

interface NewPanelProps {
    name?: string
    borderClassName: string
    backgroundClassName: string
    children: ReactNode
}

const NewPanel: FunctionComponent<NewPanelProps> = ({ name, borderClassName, backgroundClassName, children }) =>
    <div className={`w-[33vw] shrink-0 bg-white overflow-y-auto shadow-lg flex flex-col items-center space-y-4 pb-4 h-full border-l-4 ${borderClassName}`}>
        <div className="w-[30vw] p-3 pt-4">
            <h1 className="text-3xl font-medium">Now Creating New {name}</h1>
        </div>
        <Form reloadDocument method="post" className={`w-[30vw] rounded-2xl border-2 shadow-sm p-8 flex flex-col space-y-4 ${borderClassName} ${backgroundClassName}`}>
            {children}
            <br />
            <AuthenticityTokenInput />
            <LineActionButton borderClassName={borderClassName} type="submit">
                <h2 className="font-light">Click to Create New <span className="font-medium">{name}</span></h2>
            </LineActionButton>
        </Form>
    </div>

export default NewPanel
