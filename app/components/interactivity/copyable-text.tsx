import { useState } from "react";

export const CopyableText: React.FunctionComponent<{
  children?: string;
}> = ({ children: text }) => {
  const [buttonText, setButtonText] = useState("copy");
  return (
    <>
      {text}
      {text && (
        <>
          {" "}
          <button
            type="button"
            className="underline decoration-color-link-underline"
            onClick={() =>
              navigator.clipboard
                .writeText(text)
                .then(() => setButtonText("copied!"))
            }
          >
            ({buttonText})
          </button>
        </>
      )}
    </>
  );
};
