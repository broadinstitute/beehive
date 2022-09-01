import { FunctionComponent } from "react"

interface TextFieldProps {
    name?: string | undefined
    defaultValue?: string | undefined
    placeholder?: string | undefined
    required?: boolean | undefined
    pattern?: string | undefined
    onChange?: React.ChangeEventHandler<HTMLInputElement> | undefined
}

const TextField: FunctionComponent<TextFieldProps> = ({ name, defaultValue, placeholder, required, pattern, onChange }) =>
    <input
        type="text"
        className="w-full rounded-lg border border-zinc-400 px-2 py-1 mt-1 focus-visible:outline-blue-500 invalid:border-dashed invalid:border-red-500"
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        required={required}
        pattern={pattern}
        onChange={onChange} />

export default TextField
