import { Link, useOutletContext } from "@remix-run/react";
import { V2controllersEnvironment } from "@sherlock-js-client/sherlock";
import { FunctionComponent } from "react";
import PlaceholderPanel from "~/components/panels/placeholder";

const EnvironmentsEnvironmentNameIndexRoute: FunctionComponent = () => {
    const { environment } = useOutletContext<{ environment: V2controllersEnvironment }>()
    switch (environment.lifecycle) {
        case "static":
            return (
                <PlaceholderPanel
                    title={environment.name}>
                    <p>{environment.name} is a static environment, which means that it is backed by Terraform-managed infrastructure and monitoring.</p>
                    <p>Static environments are heavyweight and complex, so feel free to reach out to DevOps if you'd like help or more info.</p>
                </PlaceholderPanel>
            )
        case "template":
            return (
                <PlaceholderPanel
                    title={`Template: ${environment.name}`}>
                    <p>This template is an environment that exists only in configuration: you won't any of its charts <i>actually</i> deployed anywhere.</p>
                    <p>Instead, we create dynamic environments {"(what we call BEEs, for Branch Engineering Environments)"} <i>based on templates like this one,</i> and the instances of charts in those environments actually exist in our infrastructure.</p>
                    <p>The reason for this is so that we can have a ton of BEEs without also having an explosion of configuration. We can maintain a much more limited set of templates, and BEEs just borrow the configuration from their template.</p>
                </PlaceholderPanel>
            )
        case "dynamic":
            return (
                <PlaceholderPanel
                    title={`BEE: ${environment.name}`}>
                    <h2 className="text-3xl">Based on Template: {environment.templateEnvironment}</h2>
                    <p>This environment gets its configuration from the <Link to={`/environments/${environment.templateEnvironment}`} className="font-mono underline decoration-blue-500">{environment.templateEnvironment}</Link> template environment.</p>
                </PlaceholderPanel>
            )
        default:
            return <div></div>
    }
}

export default EnvironmentsEnvironmentNameIndexRoute
