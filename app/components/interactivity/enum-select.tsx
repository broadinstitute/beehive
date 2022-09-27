export interface EnumSelectProps {
  name: string;
  className?: string | undefined;
  fieldValue: string;
  setFieldValue: (value: string) => void;
  enums: Array<[string, string]>;
  borderClassName: string;
}

export const EnumSelect: React.FunctionComponent<EnumSelectProps> = ({
  name,
  className,
  fieldValue,
  setFieldValue,
  enums,
  borderClassName,
}) => (
  <>
    <input type="hidden" name={name} value={fieldValue} />
    <div className={`min-h-[3rem] w-full mt-2 gap-2 ${className}`}>
      {enums.map(([displayValue, valueToSet]) => (
        <button
          className={`first:rounded-l-2xl last:rounded-r-2xl shadow-md hover:shadow-lg motion-safe:transition-all duration-75 ${
            borderClassName || "border-zinc-300"
          } ${
            valueToSet === fieldValue
              ? "bg-white border-4 font-medium"
              : "bg-white/30 border-2 hover:border-4"
          }`}
          key={valueToSet}
          onClickCapture={(e) => {
            setFieldValue(valueToSet);
            e.preventDefault();
          }}
        >
          {displayValue}
        </button>
      ))}
    </div>
  </>
);
