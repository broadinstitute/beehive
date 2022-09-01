import { Form } from "@remix-run/react"
import { FunctionComponent, ReactNode } from "react"
import { AuthenticityTokenInput } from "remix-utils"
import LineActionButton from "../common/line-action-button"
import TextField from "../common/text-field"

interface DeletePanelProps {
    name?: string | undefined
    deleteGuard?: boolean | undefined
    borderClassName: string
    backgroundClassName: string
    children: ReactNode
}

const DeletePanel: FunctionComponent<DeletePanelProps> = ({ name, deleteGuard = true, borderClassName, backgroundClassName, children }) =>
    <div className="w-[33vw] flex flex-col items-center space-y-4 pb-4">
        <div className="w-[30vw] p-3 pt-4">
            <h1 className="text-3xl font-medium">Now Deleting {name}</h1>
        </div>
        <Form reloadDocument method="post" className={`w-[30vw] rounded-2xl border-2 shadow-sm p-8 flex flex-col space-y-4 ${borderClassName} ${backgroundClassName}`}>
            {children}
            <p className="text-sm">DevOps can manually un-delete anything in Sherlock's database, keeping associations intact, but this is an emergency process.</p>
            <AuthenticityTokenInput />
            {deleteGuard && <label>
                Type "delete {name}" below to confirm:
                <TextField placeholder={`delete ${name}`} required pattern={`delete ${name}`} />
            </label>}
            <LineActionButton borderClassName={borderClassName} type="submit">
                <h2 className="font-light">Click to Delete <span className="font-medium">{name}</span></h2>
            </LineActionButton>
        </Form>
    </div>

export default DeletePanel
