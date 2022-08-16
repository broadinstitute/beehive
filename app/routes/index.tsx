import { NavLink } from "@remix-run/react";

export default function Index() {
  return (
    <div className="lg:flex flex-col h-full justify-center items-center space-y-8 mt-8">
      <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-extralight lg:font-thin shrink-0 text-center">Welcome to Beehive</h1>
      <div className="flex flex-wrap justify-center 2xl:justify-between w-full max-w-7xl h-auto m-auto">
        <NavLink to="/" className="bg-white active:bg-zinc-50 h-52 w-80 m-4 md:m-8 shrink-0 flex items-center justify-center rounded-2xl shadow-lg hover:shadow-xl border-2 hover:border-4 transition-all duration-75 border-emerald-300">
          <div className="h-[11.5rem] w-[18.5rem] flex flex-col justify-center items-center text-center">
            <div className="w-72 border-b border-zinc-300 border-solid">
              <h2 className="text-3xl font-light">Clusters</h2>
            </div>
            <div>
              <p>Browse Kubernetes clusters containing our deployments</p>
            </div>
          </div>
        </NavLink>
        <NavLink to="/" className="bg-white active:bg-zinc-50 h-52 w-80 m-4 md:m-8 shrink-0 flex items-center justify-center rounded-2xl shadow-lg hover:shadow-xl border-2 hover:border-4 transition-all duration-75 border-amber-300">
          <div className="h-[11.5rem] w-[18.5rem] flex flex-col justify-center items-center text-center">
            <div className="w-72 border-b border-zinc-300 border-solid">
              <h2 className="text-3xl font-light">Environments</h2>
            </div>
            <div>
              <p>Browse live environments or BEE templates and instances</p>
            </div>
          </div>
        </NavLink>
        <NavLink to="/" className="bg-white active:bg-zinc-50 h-52 w-80 m-4 md:m-8 shrink-0 flex items-center justify-center rounded-2xl shadow-lg hover:shadow-xl border-2 hover:border-4 transition-all duration-75 border-blue-300">
          <div className="h-[11.5rem] w-[18.5rem] flex flex-col justify-center items-center text-center">
            <div className="w-72 border-b border-zinc-300 border-solid">
              <h2 className="text-3xl font-light">Charts and Apps</h2>
            </div>
            <div>
              <p>Browse applications and the Helm Charts that deploy them</p>
            </div>
          </div>
        </NavLink>
      </div>
    </div>
  );
}
